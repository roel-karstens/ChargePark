"""
NDW (Nationale DataWareHouse) data import service.

Fetches real-time charging point data from NDW Open Data API.
Updates local PostgreSQL database with locations, prices, and availability.

Data source: https://opendata.ndw.nu/
License: CC0 (public domain)
Update frequency: Every 5 minutes recommended
"""

import logging
import os
from datetime import datetime
from typing import Any, Optional

import httpx
import psycopg2
import psycopg2.extras
from psycopg2.pool import SimpleConnectionPool

logger = logging.getLogger(__name__)

# NDW API endpoints
NDW_BASE_URL = "https://opendata.ndw.nu"
NDW_CHARGERS_ENDPOINT = f"{NDW_BASE_URL}/api/v2/chargepoint/chargepoint/features"

# Rotterdam bounding box for MVP (lat/lon)
ROTTERDAM_BBOX = {
    "min_lat": 51.8,
    "max_lat": 51.95,
    "min_lon": 4.3,
    "max_lon": 4.55,
}


class NDWImportService:
    """Service to fetch and import NDW charging point data."""

    def __init__(self, db_url: Optional[str] = None):
        """Initialize with database connection pool."""
        self.db_url = db_url or os.getenv(
            "DATABASE_URL",
            "postgresql://postgres:password@localhost:5432/chargepark"
        )
        self.pool = SimpleConnectionPool(1, 5, self.db_url)

    def get_connection(self):
        """Get a connection from the pool."""
        return self.pool.getconn()

    def return_connection(self, conn):
        """Return a connection to the pool."""
        self.pool.putconn(conn)

    def close(self):
        """Close all connections in the pool."""
        self.pool.closeall()

    def fetch_ndw_data(self) -> dict[str, Any]:
        """
        Fetch charging point data from NDW Open Data API.

        Returns:
            GeoJSON FeatureCollection with charging points
        """
        logger.info("Fetching NDW data...")
        try:
            async def _fetch():
                async with httpx.AsyncClient() as client:
                    response = await client.get(
                        NDW_CHARGERS_ENDPOINT,
                        timeout=30.0,
                        follow_redirects=True
                    )
                    response.raise_for_status()
                    return response.json()

            # For synchronous context, use httpx directly
            with httpx.Client() as client:
                response = client.get(
                    NDW_CHARGERS_ENDPOINT,
                    timeout=30.0,
                    follow_redirects=True
                )
                response.raise_for_status()
                data = response.json()

            logger.info(f"Fetched {len(data.get('features', []))} chargers from NDW")
            return data

        except httpx.RequestError as e:
            logger.error(f"Failed to fetch NDW data: {e}")
            raise

    def filter_rotterdam_chargers(self, geojson_data: dict[str, Any]) -> list[dict]:
        """
        Filter chargers within Rotterdam bounding box.

        Args:
            geojson_data: GeoJSON FeatureCollection from NDW

        Returns:
            List of charger features in Rotterdam
        """
        rotterdam_chargers = []

        for feature in geojson_data.get("features", []):
            if feature.get("type") != "Feature":
                continue

            coords = feature.get("geometry", {}).get("coordinates", [])
            if not coords or len(coords) < 2:
                continue

            lon, lat = coords[0], coords[1]

            # Check if within Rotterdam bbox
            if (ROTTERDAM_BBOX["min_lat"] <= lat <= ROTTERDAM_BBOX["max_lat"] and
                ROTTERDAM_BBOX["min_lon"] <= lon <= ROTTERDAM_BBOX["max_lon"]):
                rotterdam_chargers.append(feature)

        logger.info(f"Filtered to {len(rotterdam_chargers)} Rotterdam chargers")
        return rotterdam_chargers

    def parse_charger_properties(self, feature: dict) -> dict[str, Any]:
        """
        Parse charger properties from NDW GeoJSON feature.

        Args:
            feature: GeoJSON Feature object

        Returns:
            Dict with parsed charger properties
        """
        props = feature.get("properties", {})
        coords = feature.get("geometry", {}).get("coordinates", [None, None])

        # Extract core properties
        charger = {
            "ndw_id": props.get("id"),
            "name": props.get("chargePointName", "Unknown"),
            "address": props.get("chargePointAddress", ""),
            "longitude": coords[0],
            "latitude": coords[1],
            "charger_power_kw": props.get("maxPower"),
            "connector_types": props.get("chargePointConnectorTypes", []),
            "num_connectors": len(props.get("chargePointConnectorTypes", [])),
            "price_per_kwh": self._parse_price(props.get("chargePointPricePerKwh")),
            "availability_total": props.get("chargePointNumberOfConnectors"),
            "availability_available": props.get("chargePointNumberOfConnectorsFree"),
        }

        return charger

    @staticmethod
    def _parse_price(price_str: Optional[str]) -> Optional[float]:
        """
        Parse price from NDW format to decimal.

        NDW returns prices as strings like "0.32" or None
        """
        if not price_str:
            return None
        try:
            return float(price_str)
        except (ValueError, TypeError):
            return None

    def upsert_charger(self, conn, charger: dict) -> bool:
        """
        Insert or update charger in database.

        Args:
            conn: Database connection
            charger: Charger properties dict

        Returns:
            True if successful
        """
        if not charger.get("ndw_id"):
            logger.warning("Charger missing ndw_id, skipping")
            return False

        query = """
        INSERT INTO charging_points (
            ndw_id, name, address, latitude, longitude, location,
            charger_power_kw, connector_types, num_connectors,
            price_per_kwh, availability_total, availability_available,
            last_updated
        ) VALUES (
            %(ndw_id)s, %(name)s, %(address)s, %(latitude)s, %(longitude)s,
            ST_Point(%(longitude)s, %(latitude)s, 4326),
            %(charger_power_kw)s, %(connector_types)s, %(num_connectors)s,
            %(price_per_kwh)s, %(availability_total)s, %(availability_available)s,
            %(last_updated)s
        )
        ON CONFLICT (ndw_id) DO UPDATE SET
            name = EXCLUDED.name,
            address = EXCLUDED.address,
            charger_power_kw = EXCLUDED.charger_power_kw,
            connector_types = EXCLUDED.connector_types,
            num_connectors = EXCLUDED.num_connectors,
            price_per_kwh = EXCLUDED.price_per_kwh,
            availability_total = EXCLUDED.availability_total,
            availability_available = EXCLUDED.availability_available,
            last_updated = EXCLUDED.last_updated,
            updated_at = CURRENT_TIMESTAMP
        """

        charger["last_updated"] = datetime.utcnow()
        charger["connector_types"] = charger.get("connector_types") or []

        try:
            with conn.cursor() as cur:
                cur.execute(query, charger)
                conn.commit()
                return True
        except psycopg2.Error as e:
            logger.error(f"Database error upserting charger {charger.get('ndw_id')}: {e}")
            conn.rollback()
            return False

    def import_chargers(self, chargers: list[dict]) -> tuple[int, int]:
        """
        Import list of chargers into database.

        Args:
            chargers: List of charger dicts

        Returns:
            Tuple of (inserted, failed)
        """
        conn = self.get_connection()
        inserted, failed = 0, 0

        try:
            for charger_feature in chargers:
                charger = self.parse_charger_properties(charger_feature)
                if self.upsert_charger(conn, charger):
                    inserted += 1
                else:
                    failed += 1
        finally:
            self.return_connection(conn)

        logger.info(f"Import complete: {inserted} inserted/updated, {failed} failed")
        return inserted, failed

    def run_import(self) -> dict[str, Any]:
        """
        Run complete import workflow: fetch → filter → import.

        Returns:
            Import result dict with counts and timestamp
        """
        logger.info("Starting NDW import...")
        start_time = datetime.utcnow()

        try:
            # Fetch from NDW
            ndw_data = self.fetch_ndw_data()

            # Filter to Rotterdam
            rotterdam_chargers = self.filter_rotterdam_chargers(ndw_data)

            # Import to database
            inserted, failed = self.import_chargers(rotterdam_chargers)

            result = {
                "status": "success",
                "total_fetched": len(ndw_data.get("features", [])),
                "rotterdam_count": len(rotterdam_chargers),
                "inserted": inserted,
                "failed": failed,
                "timestamp": start_time.isoformat(),
                "duration_seconds": (datetime.utcnow() - start_time).total_seconds(),
            }

            logger.info(f"Import successful: {result}")
            return result

        except Exception as e:
            logger.error(f"Import failed: {e}", exc_info=True)
            return {
                "status": "error",
                "error": str(e),
                "timestamp": start_time.isoformat(),
                "duration_seconds": (datetime.utcnow() - start_time).total_seconds(),
            }


if __name__ == "__main__":
    # Simple CLI for manual import
    logging.basicConfig(level=logging.INFO)

    importer = NDWImportService()
    try:
        result = importer.run_import()
        print("\nImport Result:")
        print(f"  Status: {result.get('status')}")
        print(f"  Total Fetched: {result.get('total_fetched')}")
        print(f"  Rotterdam Chargers: {result.get('rotterdam_count')}")
        print(f"  Inserted/Updated: {result.get('inserted')}")
        print(f"  Failed: {result.get('failed')}")
        print(f"  Duration: {result.get('duration_seconds'):.2f}s")
    finally:
        importer.close()
