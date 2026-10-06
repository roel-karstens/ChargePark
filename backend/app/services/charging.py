"""
Charging service - business logic for search, cost calculation, and ranking.

Handles database queries, cost estimation, and result ranking.
"""

import logging
from decimal import Decimal
from typing import Any, Optional

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.schemas.charging import (
    ChargerDetailResponse,
    ChargingCostEstimate,
    ChargingResultItem,
)

logger = logging.getLogger(__name__)

# MVP assumptions
DEFAULT_BATTERY_CAPACITY_KWH = 60
LINEAR_CHARGING_TIME_MINUTES_PER_PERCENT = 1  # 60 min for 0-100%


class ChargingService:
    """Service for charging point search and cost calculation."""

    def __init__(self, db_session: Session):
        """Initialize with SQLAlchemy database session."""
        self.db = db_session

    def search_chargers_by_location(
        self,
        latitude: float,
        longitude: float,
        radius_meters: int = 500,
        limit: int = 20,
    ) -> list[dict[str, Any]]:
        """
        Find charging points within radius of location using PostGIS.

        Args:
            latitude: Destination latitude
            longitude: Destination longitude
            radius_meters: Search radius
            limit: Max results

        Returns:
            List of charger dicts with distance in meters
        """
        query = text("""
            SELECT 
                id,
                ndw_id,
                name,
                address,
                latitude,
                longitude,
                charger_power_kw,
                connector_types,
                num_connectors,
                price_per_kwh,
                availability_total,
                availability_available,
                last_updated,
                ST_Distance(
                    location,
                    ST_Point(:lon, :lat, 4326)::geography
                )::INT as distance_meters
            FROM charging_points
            WHERE ST_DWithin(
                location,
                ST_Point(:lon, :lat, 4326)::geography,
                :radius
            )
            ORDER BY distance_meters ASC
            LIMIT :limit
        """)

        try:
            result = self.db.execute(
                query,
                {
                    "lat": latitude,
                    "lon": longitude,
                    "radius": radius_meters,
                    "limit": limit,
                },
            )
            rows = result.fetchall()
            
            # Convert Row objects to dicts
            results = [dict(row._mapping) for row in rows]

            logger.info(
                f"Found {len(results)} chargers within {radius_meters}m "
                f"of ({latitude}, {longitude})"
            )
            return results

        except Exception as e:
            logger.error(f"Database error searching chargers: {e}")
            raise

    def calculate_cost(
        self,
        battery_percentage: int,
        price_per_kwh: Optional[Decimal],
    ) -> ChargingCostEstimate:
        """
        Calculate charging cost and time estimate.

        Args:
            battery_percentage: Current battery level (0-100%)
            price_per_kwh: Price in EUR/kWh (None if unknown)

        Returns:
            ChargingCostEstimate with breakdown
        """
        # Calculate kWh needed to fully charge from current battery %
        kwh_needed = (battery_percentage / 100.0) * DEFAULT_BATTERY_CAPACITY_KWH

        # Estimate charging time (linear model, MVP assumption)
        charging_minutes = int(battery_percentage * LINEAR_CHARGING_TIME_MINUTES_PER_PERCENT)

        # Calculate cost
        if price_per_kwh is not None:
            total_cost = kwh_needed * float(price_per_kwh)
            confidence = "exact"
        else:
            # Use average Rotterdam price as fallback estimate
            avg_price = 0.32  # EUR/kWh, based on NDW data
            total_cost = kwh_needed * avg_price
            confidence = "estimated"

        return ChargingCostEstimate(
            total_cost_eur=Decimal(str(round(total_cost, 2))),
            battery_kwh=Decimal(str(round(kwh_needed, 1))),
            charging_time_minutes=charging_minutes,
            cost_confidence=confidence,
        )

    def charger_to_detail_response(self, charger: dict) -> ChargerDetailResponse:
        """Convert database row to response schema."""
        return ChargerDetailResponse(
            id=str(charger["id"]),
            ndw_id=charger["ndw_id"],
            name=charger["name"],
            address=charger["address"] or "",
            latitude=Decimal(str(charger["latitude"])),
            longitude=Decimal(str(charger["longitude"])),
            charger_power_kw=(
                Decimal(str(charger["charger_power_kw"]))
                if charger["charger_power_kw"] else None
            ),
            connector_types=charger["connector_types"] or [],
            num_connectors=charger["num_connectors"] or 0,
            price_per_kwh=(
                Decimal(str(charger["price_per_kwh"]))
                if charger["price_per_kwh"] else None
            ),
            availability_total=charger["availability_total"] or 0,
            availability_available=charger["availability_available"] or 0,
            last_updated=charger["last_updated"].isoformat() if charger["last_updated"] else "",
        )

    def create_result_item(
        self,
        charger: dict,
        battery_percentage: int,
        distance_meters: int,
        distance_walking_minutes: Optional[int] = None,
    ) -> ChargingResultItem:
        """
        Create a result item with cost and time estimates.

        Args:
            charger: Charger database row
            battery_percentage: Current battery %
            distance_meters: Walking distance
            distance_walking_minutes: Estimated walking time (optional)

        Returns:
            ChargingResultItem ready for response
        """
        charger_detail = self.charger_to_detail_response(charger)
        cost_estimate = self.calculate_cost(
            battery_percentage,
            charger["price_per_kwh"],
        )

        # Estimate walking time if not provided (assume 1.4 m/s = 1 min per 84m)
        walking_minutes = distance_walking_minutes
        if walking_minutes is None:
            walking_minutes = max(1, distance_meters // 84)

        total_time = cost_estimate.charging_time_minutes + walking_minutes

        return ChargingResultItem(
            charger=charger_detail,
            cost_estimate=cost_estimate,
            distance_meters=distance_meters,
            distance_minutes=walking_minutes,
            total_time_minutes=total_time,
        )

    def rank_results(
        self,
        results: list[ChargingResultItem],
        sort_by: str = "cost",
    ) -> list[ChargingResultItem]:
        """
        Rank and sort results by specified criteria.

        Args:
            results: List of charging results
            sort_by: "cost", "time", or "distance"

        Returns:
            Sorted results
        """
        if sort_by == "cost":
            return sorted(
                results,
                key=lambda r: float(r.cost_estimate.total_cost_eur)
            )
        elif sort_by == "time":
            return sorted(
                results,
                key=lambda r: r.total_time_minutes
            )
        elif sort_by == "distance":
            return sorted(
                results,
                key=lambda r: r.distance_meters
            )
        else:
            return results

    def get_charger_by_id(self, charger_id: str) -> Optional[dict[str, Any]]:
        """
        Get charger details by ID.

        Args:
            charger_id: UUID of charger

        Returns:
            Charger dict or None
        """
        query = text("""
            SELECT 
                id, ndw_id, name, address, latitude, longitude,
                charger_power_kw, connector_types, num_connectors,
                price_per_kwh, availability_total, availability_available,
                last_updated, created_at, updated_at
            FROM charging_points
            WHERE id = :charger_id
        """)

        try:
            result = self.db.execute(query, {"charger_id": charger_id})
            row = result.fetchone()

            if row:
                result_dict = dict(row._mapping)
                logger.info(f"Retrieved charger {charger_id}")
                return result_dict
            else:
                logger.info(f"Charger {charger_id} not found")
                return None

        except Exception as e:
            logger.error(f"Database error getting charger {charger_id}: {e}")
            raise
