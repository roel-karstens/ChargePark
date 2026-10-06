"""
Tests for charging service - cost calculation, ranking, and database queries.

Covers:
- Geographic radius searches
- Cost estimation (exact and estimated)
- Charging time calculation
- Result ranking (by cost, time, distance)
- Charger detail retrieval
"""

import pytest
from decimal import Decimal
from datetime import datetime
from unittest.mock import MagicMock, patch
from psycopg2.extensions import connection as psycopg2_connection

from app.services.charging import ChargingService
from app.schemas.charging import (
    ChargingCostEstimate,
    ChargerDetailResponse,
    ChargingResultItem,
)


@pytest.fixture
def sample_charger_dict():
    """Sample charger database row."""
    return {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "ndw_id": "NL-RD-001",
        "name": "Rotterdam Centraal",
        "address": "Stationsplein 1, Rotterdam",
        "latitude": Decimal("51.925"),
        "longitude": Decimal("4.4678"),
        "charger_power_kw": Decimal("50.0"),
        "connector_types": ["Type2", "CCS"],
        "num_connectors": 8,
        "price_per_kwh": Decimal("0.32"),
        "availability_total": 8,
        "availability_available": 3,
        "last_updated": datetime(2026, 10, 6, 10, 30, 0),
        "created_at": datetime(2026, 10, 1, 0, 0, 0),
        "updated_at": datetime(2026, 10, 6, 10, 30, 0),
    }


@pytest.fixture
def mock_db_pool():
    """Mock database connection pool."""
    pool = MagicMock()
    return pool


@pytest.fixture
def charging_service(mock_db_pool):
    """Create charging service with mocked database."""
    return ChargingService(mock_db_pool)


class TestChargingService:
    """Test charging service business logic."""

    def test_calculate_cost_with_known_price(self, charging_service):
        """Test cost calculation when price is known."""
        estimate = charging_service.calculate_cost(
            battery_percentage=50,
            price_per_kwh=Decimal("0.32"),
        )

        assert isinstance(estimate, ChargingCostEstimate)
        assert estimate.total_cost_eur == Decimal("9.6")  # 30 kWh * 0.32
        assert estimate.battery_kwh == Decimal("30.0")
        assert estimate.charging_time_minutes == 50
        assert estimate.cost_confidence == "exact"

    def test_calculate_cost_with_unknown_price(self, charging_service):
        """Test cost calculation with unknown price (fallback estimate)."""
        estimate = charging_service.calculate_cost(
            battery_percentage=50,
            price_per_kwh=None,
        )

        assert estimate.total_cost_eur == Decimal("9.6")  # 30 kWh * 0.32 (avg)
        assert estimate.battery_kwh == Decimal("30.0")
        assert estimate.cost_confidence == "estimated"

    def test_calculate_cost_zero_battery(self, charging_service):
        """Test cost calculation with 0% battery."""
        estimate = charging_service.calculate_cost(
            battery_percentage=0,
            price_per_kwh=Decimal("0.32"),
        )

        assert estimate.total_cost_eur == Decimal("0.0")
        assert estimate.battery_kwh == Decimal("0.0")
        assert estimate.charging_time_minutes == 0

    def test_calculate_cost_full_battery(self, charging_service):
        """Test cost calculation with 100% battery."""
        estimate = charging_service.calculate_cost(
            battery_percentage=100,
            price_per_kwh=Decimal("0.32"),
        )

        assert estimate.total_cost_eur == Decimal("19.20")  # 60 kWh * 0.32
        assert estimate.battery_kwh == Decimal("60.0")
        assert estimate.charging_time_minutes == 100

    def test_charger_to_detail_response(self, charging_service, sample_charger_dict):
        """Test converting database charger to response schema."""
        response = charging_service.charger_to_detail_response(sample_charger_dict)

        assert isinstance(response, ChargerDetailResponse)
        assert response.id == "550e8400-e29b-41d4-a716-446655440000"
        assert response.name == "Rotterdam Centraal"
        assert response.price_per_kwh == Decimal("0.32")
        assert response.connector_types == ["Type2", "CCS"]

    def test_charger_to_detail_response_with_nulls(self, charging_service):
        """Test converting charger with NULL fields."""
        charger = {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "ndw_id": "NL-RD-002",
            "name": "Unknown Charger",
            "address": None,
            "latitude": Decimal("51.9"),
            "longitude": Decimal("4.4"),
            "charger_power_kw": None,
            "connector_types": None,
            "num_connectors": None,
            "price_per_kwh": None,
            "availability_total": None,
            "availability_available": None,
            "last_updated": None,
        }

        response = charging_service.charger_to_detail_response(charger)

        assert response.price_per_kwh is None
        assert response.charger_power_kw is None
        assert response.address == ""

    def test_create_result_item(self, charging_service, sample_charger_dict):
        """Test creating a result item with calculations."""
        result = charging_service.create_result_item(
            charger=sample_charger_dict,
            battery_percentage=50,
            distance_meters=280,
            distance_walking_minutes=4,
        )

        assert isinstance(result, ChargingResultItem)
        assert result.charger.name == "Rotterdam Centraal"
        assert result.cost_estimate.total_cost_eur == Decimal("9.6")
        assert result.distance_meters == 280
        assert result.distance_minutes == 4
        assert result.total_time_minutes == 54  # 50 charging + 4 walking

    def test_create_result_item_estimate_walking_time(
        self,
        charging_service,
        sample_charger_dict
    ):
        """Test that walking time is estimated if not provided."""
        result = charging_service.create_result_item(
            charger=sample_charger_dict,
            battery_percentage=50,
            distance_meters=420,  # 420m / 84 = 5 minutes
            distance_walking_minutes=None,
        )

        # Should estimate: 420m / 84m per min ≈ 5 min
        assert result.distance_minutes == 5
        assert result.total_time_minutes == 55  # 50 + 5

    def test_rank_results_by_cost(self, charging_service):
        """Test ranking results by cost (ascending)."""
        result1 = MagicMock()
        result1.cost_estimate.total_cost_eur = Decimal("15.0")

        result2 = MagicMock()
        result2.cost_estimate.total_cost_eur = Decimal("10.0")

        result3 = MagicMock()
        result3.cost_estimate.total_cost_eur = Decimal("12.0")

        results = [result1, result2, result3]
        ranked = charging_service.rank_results(results, sort_by="cost")

        assert ranked[0].cost_estimate.total_cost_eur == Decimal("10.0")
        assert ranked[1].cost_estimate.total_cost_eur == Decimal("12.0")
        assert ranked[2].cost_estimate.total_cost_eur == Decimal("15.0")

    def test_rank_results_by_time(self, charging_service):
        """Test ranking results by total time (ascending)."""
        result1 = MagicMock()
        result1.total_time_minutes = 60

        result2 = MagicMock()
        result2.total_time_minutes = 45

        result3 = MagicMock()
        result3.total_time_minutes = 50

        results = [result1, result2, result3]
        ranked = charging_service.rank_results(results, sort_by="time")

        assert ranked[0].total_time_minutes == 45
        assert ranked[1].total_time_minutes == 50
        assert ranked[2].total_time_minutes == 60

    def test_rank_results_by_distance(self, charging_service):
        """Test ranking results by distance (ascending)."""
        result1 = MagicMock()
        result1.distance_meters = 500

        result2 = MagicMock()
        result2.distance_meters = 250

        result3 = MagicMock()
        result3.distance_meters = 375

        results = [result1, result2, result3]
        ranked = charging_service.rank_results(results, sort_by="distance")

        assert ranked[0].distance_meters == 250
        assert ranked[1].distance_meters == 375
        assert ranked[2].distance_meters == 500

    def test_rank_results_invalid_sort(self, charging_service):
        """Test ranking with invalid sort_by parameter."""
        results = [MagicMock(), MagicMock()]
        ranked = charging_service.rank_results(results, sort_by="invalid")

        # Should return unchanged
        assert len(ranked) == 2

    @patch("app.services.charging.psycopg2.extras.RealDictCursor")
    def test_search_chargers_by_location(self, mock_cursor, charging_service):
        """Test searching for chargers within radius."""
        mock_chargers = [
            {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "name": "Charger 1",
                "distance_meters": 100,
            },
            {
                "id": "550e8400-e29b-41d4-a716-446655440001",
                "name": "Charger 2",
                "distance_meters": 250,
            },
        ]

        mock_conn = MagicMock()
        charging_service.pool.getconn.return_value = mock_conn
        mock_cursor_instance = MagicMock()
        mock_cursor_instance.fetchall.return_value = mock_chargers
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor_instance

        results = charging_service.search_chargers_by_location(
            latitude=51.925,
            longitude=4.4678,
            radius_meters=500,
            limit=20,
        )

        assert len(results) == 2
        assert results[0]["name"] == "Charger 1"
        assert results[0]["distance_meters"] == 100

    @patch("app.services.charging.psycopg2.extras.RealDictCursor")
    def test_search_chargers_no_results(self, mock_cursor, charging_service):
        """Test search with no results."""
        mock_conn = MagicMock()
        charging_service.pool.getconn.return_value = mock_conn
        mock_cursor_instance = MagicMock()
        mock_cursor_instance.fetchall.return_value = []
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor_instance

        results = charging_service.search_chargers_by_location(
            latitude=51.925,
            longitude=4.4678,
            radius_meters=500,
        )

        assert len(results) == 0

    @patch("app.services.charging.psycopg2.extras.RealDictCursor")
    def test_get_charger_by_id_success(self, mock_cursor, charging_service, sample_charger_dict):
        """Test retrieving charger by ID."""
        mock_conn = MagicMock()
        charging_service.pool.getconn.return_value = mock_conn
        mock_cursor_instance = MagicMock()
        mock_cursor_instance.fetchone.return_value = sample_charger_dict
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor_instance

        charger = charging_service.get_charger_by_id("550e8400-e29b-41d4-a716-446655440000")

        assert charger is not None
        assert charger["name"] == "Rotterdam Centraal"

    @patch("app.services.charging.psycopg2.extras.RealDictCursor")
    def test_get_charger_by_id_not_found(self, mock_cursor, charging_service):
        """Test retrieving non-existent charger."""
        mock_conn = MagicMock()
        charging_service.pool.getconn.return_value = mock_conn
        mock_cursor_instance = MagicMock()
        mock_cursor_instance.fetchone.return_value = None
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor_instance

        charger = charging_service.get_charger_by_id("nonexistent-id")

        assert charger is None
