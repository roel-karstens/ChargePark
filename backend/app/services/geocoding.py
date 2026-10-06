"""
Geocoding service - address lookup and reverse geocoding via Nominatim.

Uses OpenStreetMap's Nominatim service (free, no auth required).
"""

import logging
from decimal import Decimal
from typing import Optional

import httpx
from app.schemas.charging import GeocodeResult

logger = logging.getLogger(__name__)

NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org"
NOMINATIM_SEARCH_ENDPOINT = f"{NOMINATIM_BASE_URL}/search"
NOMINATIM_REVERSE_ENDPOINT = f"{NOMINATIM_BASE_URL}/reverse"

# User-Agent required by Nominatim terms of service
USER_AGENT = "ChargePark/1.0 (+https://github.com/roel-karstens/ChargePark)"


class GeocodingService:
    """Service for address geocoding via Nominatim."""

    @staticmethod
    def search_address(query: str, limit: int = 5) -> list[GeocodeResult]:
        """
        Search for addresses using Nominatim.

        Args:
            query: Address or place name to search for
            limit: Maximum results to return

        Returns:
            List of GeocodeResult objects
        """
        logger.info(f"Geocoding: {query}")

        try:
            with httpx.Client() as client:
                response = client.get(
                    NOMINATIM_SEARCH_ENDPOINT,
                    params={
                        "q": query,
                        "limit": limit,
                        "format": "json",
                        "countrycodes": "nl",  # Limit to Netherlands for MVP
                    },
                    headers={"User-Agent": USER_AGENT},
                    timeout=10.0,
                )
                response.raise_for_status()
                data = response.json()

            results = []
            for item in data:
                result = GeocodeResult(
                    name=item.get("name", ""),
                    latitude=Decimal(item["lat"]),
                    longitude=Decimal(item["lon"]),
                    address=item.get("display_name", ""),
                    type=item.get("type", "unknown"),
                )
                results.append(result)

            logger.info(f"Found {len(results)} results for: {query}")
            return results

        except httpx.RequestError as e:
            logger.error(f"Geocoding error: {e}")
            raise

    @staticmethod
    def reverse_geocode(
        latitude: float,
        longitude: float,
    ) -> Optional[GeocodeResult]:
        """
        Reverse geocode coordinates to address.

        Args:
            latitude: Latitude
            longitude: Longitude

        Returns:
            GeocodeResult or None if not found
        """
        logger.info(f"Reverse geocoding: ({latitude}, {longitude})")

        try:
            with httpx.Client() as client:
                response = client.get(
                    NOMINATIM_REVERSE_ENDPOINT,
                    params={
                        "lat": latitude,
                        "lon": longitude,
                        "format": "json",
                    },
                    headers={"User-Agent": USER_AGENT},
                    timeout=10.0,
                )
                response.raise_for_status()
                data = response.json()

            if data:
                result = GeocodeResult(
                    name=data.get("address", {}).get("city", data.get("name", "")),
                    latitude=Decimal(data["lat"]),
                    longitude=Decimal(data["lon"]),
                    address=data.get("display_name", ""),
                    type=data.get("type", "unknown"),
                )
                logger.info(f"Reverse geocode result: {result.address}")
                return result

            logger.warning(f"No reverse geocode result for ({latitude}, {longitude})")
            return None

        except httpx.RequestError as e:
            logger.error(f"Reverse geocoding error: {e}")
            raise
