"""
Distance service - calculate walking distance via OSRM (Open Source Routing Machine).

Uses free OSRM service for pedestrian routing.
"""

import logging
from typing import Optional

import httpx

logger = logging.getLogger(__name__)

# Public OSRM instance (free, no auth required)
OSRM_BASE_URL = "https://router.project-osrm.org"
OSRM_ROUTE_ENDPOINT = f"{OSRM_BASE_URL}/route/v1/foot"


class DistanceService:
    """Service for walking distance calculation via OSRM."""

    @staticmethod
    def calculate_distance(
        start_lat: float,
        start_lon: float,
        end_lat: float,
        end_lon: float,
    ) -> dict[str, int | None]:
        """
        Calculate walking distance and time between two points.

        Args:
            start_lat: Starting latitude
            start_lon: Starting longitude
            end_lat: Ending latitude
            end_lon: Ending longitude

        Returns:
            Dict with 'distance_meters' and 'duration_minutes' or None on error
        """
        logger.info(
            f"Calculating distance from ({start_lat}, {start_lon}) "
            f"to ({end_lat}, {end_lon})"
        )

        try:
            # OSRM format: lon,lat (not lat,lon)
            coordinates = f"{start_lon},{start_lat};{end_lon},{end_lat}"
            url = f"{OSRM_ROUTE_ENDPOINT}/{coordinates}"

            with httpx.Client() as client:
                response = client.get(
                    url,
                    params={
                        "steps": "false",
                        "annotations": "false",
                    },
                    timeout=10.0,
                )
                response.raise_for_status()
                data = response.json()

            if data.get("code") != "Ok":
                logger.warning(
                    f"OSRM returned code: {data.get('code')} - "
                    f"Using straight-line estimate"
                )
                return DistanceService._fallback_distance(
                    start_lat, start_lon, end_lat, end_lon
                )

            # Extract distance and duration from first route
            if data.get("routes"):
                route = data["routes"][0]
                distance_meters = int(route["distance"])
                duration_seconds = int(route["duration"])
                duration_minutes = max(1, duration_seconds // 60)

                logger.info(
                    f"Distance: {distance_meters}m, Time: {duration_minutes}min"
                )

                return {
                    "distance_meters": distance_meters,
                    "duration_minutes": duration_minutes,
                }

            logger.warning("No routes returned from OSRM")
            return DistanceService._fallback_distance(
                start_lat, start_lon, end_lat, end_lon
            )

        except httpx.RequestError as e:
            logger.error(f"OSRM distance calculation error: {e}")
            # Fall back to straight-line estimation
            return DistanceService._fallback_distance(
                start_lat, start_lon, end_lat, end_lon
            )

    @staticmethod
    def _fallback_distance(
        start_lat: float,
        start_lon: float,
        end_lat: float,
        end_lon: float,
    ) -> dict[str, int]:
        """
        Fallback straight-line distance calculation (Haversine).

        Used when OSRM is unavailable. Less accurate than street routing
        but sufficient for MVP ranking.

        Args:
            start_lat: Starting latitude
            start_lon: Starting longitude
            end_lat: Ending latitude
            end_lon: Ending longitude

        Returns:
            Dict with estimated distance and duration
        """
        import math

        # Haversine formula
        lat1_rad = math.radians(start_lat)
        lat2_rad = math.radians(end_lat)
        delta_lat = math.radians(end_lat - start_lat)
        delta_lon = math.radians(end_lon - start_lon)

        a = (
            math.sin(delta_lat / 2) ** 2 +
            math.cos(lat1_rad) * math.cos(lat2_rad) *
            math.sin(delta_lon / 2) ** 2
        )
        c = 2 * math.asin(math.sqrt(a))
        earth_radius_meters = 6371000

        distance_meters = int(earth_radius_meters * c)

        # Rough estimate: 1.4 m/s walking speed = 84m per minute
        duration_minutes = max(1, distance_meters // 84)

        logger.warning(
            f"Using fallback distance estimate: {distance_meters}m, "
            f"{duration_minutes}min (straight-line, less accurate)"
        )

        return {
            "distance_meters": distance_meters,
            "duration_minutes": duration_minutes,
        }
