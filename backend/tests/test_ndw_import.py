"""
Tests for NDW import service.

Tests data fetching, filtering, parsing, and database operations.
"""

import json
from datetime import datetime
from unittest.mock import MagicMock, patch

import pytest

from app.services.ndw_import import NDWImportService


@pytest.fixture
def sample_ndw_response():
    """Sample response from NDW API with test chargers."""
    return {
        "features": [
            {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [4.4678, 51.925]  # Rotterdam Centraal
                },
                "properties": {
                    "id": "NL-RD-001",
                    "chargePointName": "Rotterdam Centraal",
                    "chargePointAddress": "Stationsplein 1, Rotterdam",
                    "maxPower": 50.0,
                    "chargePointConnectorTypes": ["Type2", "CCS"],
                    "chargePointNumberOfConnectors": 8,
                    "chargePointNumberOfConnectorsFree": 3,
                    "chargePointPricePerKwh": "0.32",
                }
            },
            {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [4.3, 51.9]  # Also Rotterdam
                },
                "properties": {
                    "id": "NL-RD-002",
                    "chargePointName": "Parking Stavoren",
                    "chargePointAddress": "Stavoren 10, Rotterdam",
                    "maxPower": 22.0,
                    "chargePointConnectorTypes": ["Type2"],
                    "chargePointNumberOfConnectors": 4,
                    "chargePointNumberOfConnectorsFree": 2,
                    "chargePointPricePerKwh": "0.28",
                }
            },
            {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [5.2, 52.5]  # Amsterdam, not Rotterdam
                },
                "properties": {
                    "id": "NL-AMS-001",
                    "chargePointName": "Amsterdam Central",
                    "chargePointAddress": "Stationsplein 1, Amsterdam",
                    "maxPower": 50.0,
                    "chargePointConnectorTypes": ["Type2"],
                    "chargePointNumberOfConnectors": 10,
                    "chargePointNumberOfConnectorsFree": 5,
                    "chargePointPricePerKwh": None,
                }
            },
        ]
    }


@pytest.fixture
def import_service():
    """Create NDW import service with mocked database."""
    with patch("app.services.ndw_import.SimpleConnectionPool"):
        service = NDWImportService(db_url="postgresql://test:test@localhost/test")
        return service


class TestNDWImportService:
    """Test NDW data import service."""

    def test_filter_rotterdam_chargers(self, import_service, sample_ndw_response):
        """Test filtering chargers within Rotterdam bounding box."""
        rotterdam = import_service.filter_rotterdam_chargers(sample_ndw_response)

        assert len(rotterdam) == 2, "Should filter to only Rotterdam chargers"
        assert rotterdam[0]["properties"]["id"] == "NL-RD-001"
        assert rotterdam[1]["properties"]["id"] == "NL-RD-002"

        # Amsterdam charger should be excluded
        charger_ids = [f["properties"]["id"] for f in rotterdam]
        assert "NL-AMS-001" not in charger_ids

    def test_parse_charger_properties(self, import_service, sample_ndw_response):
        """Test parsing NDW feature into charger dict."""
        feature = sample_ndw_response["features"][0]
        charger = import_service.parse_charger_properties(feature)

        assert charger["ndw_id"] == "NL-RD-001"
        assert charger["name"] == "Rotterdam Centraal"
        assert charger["latitude"] == 51.925
        assert charger["longitude"] == 4.4678
        assert charger["charger_power_kw"] == 50.0
        assert charger["num_connectors"] == 8
        assert charger["price_per_kwh"] == 0.32
        assert charger["availability_total"] == 8
        assert charger["availability_available"] == 3

    def test_parse_price_valid(self, import_service):
        """Test price parsing with valid string."""
        assert import_service._parse_price("0.32") == 0.32
        assert import_service._parse_price("0.28") == 0.28
        assert import_service._parse_price("1.0") == 1.0

    def test_parse_price_invalid(self, import_service):
        """Test price parsing with invalid/missing values."""
        assert import_service._parse_price(None) is None
        assert import_service._parse_price("") is None
        assert import_service._parse_price("invalid") is None

    def test_parse_charger_missing_ndw_id(self, import_service):
        """Test parsing charger without ndw_id."""
        feature = {
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [4.4, 51.9]},
            "properties": {
                "chargePointName": "Unknown Station"
                # No id
            }
        }

        charger = import_service.parse_charger_properties(feature)
        assert charger["ndw_id"] is None

    def test_upsert_charger_missing_ndw_id(self, import_service):
        """Test that chargers without ndw_id are skipped."""
        charger = {"ndw_id": None, "name": "Test"}
        conn = MagicMock()

        result = import_service.upsert_charger(conn, charger)
        assert result is False
        conn.cursor.assert_not_called()

    def test_upsert_charger_success(self, import_service):
        """Test successful charger insert/update."""
        charger = {
            "ndw_id": "NL-RD-001",
            "name": "Test Charger",
            "address": "Test St",
            "latitude": 51.9,
            "longitude": 4.4,
            "charger_power_kw": 50.0,
            "connector_types": ["Type2"],
            "num_connectors": 4,
            "price_per_kwh": 0.32,
            "availability_total": 4,
            "availability_available": 2,
        }

        # Mock database connection
        mock_cursor = MagicMock()
        mock_conn = MagicMock()
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor

        result = import_service.upsert_charger(mock_conn, charger)

        assert result is True
        mock_cursor.execute.assert_called_once()
        mock_conn.commit.assert_called_once()

    def test_upsert_charger_database_error(self, import_service):
        """Test error handling in database upsert."""
        charger = {"ndw_id": "NL-RD-001"}

        # Mock database connection that raises error
        mock_cursor = MagicMock()
        mock_cursor.execute.side_effect = Exception("DB Error")
        mock_conn = MagicMock()
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor

        result = import_service.upsert_charger(mock_conn, charger)

        assert result is False
        mock_conn.rollback.assert_called_once()

    def test_import_chargers(self, import_service, sample_ndw_response):
        """Test importing multiple chargers."""
        rotterdam_chargers = sample_ndw_response["features"][:2]

        # Mock database connection
        mock_conn = MagicMock()
        import_service.pool.getconn.return_value = mock_conn

        with patch.object(import_service, "upsert_charger", return_value=True):
            inserted, failed = import_service.import_chargers(rotterdam_chargers)

        assert inserted == 2
        assert failed == 0

    def test_import_chargers_with_failures(self, import_service, sample_ndw_response):
        """Test import with some failures."""
        rotterdam_chargers = sample_ndw_response["features"][:2]

        mock_conn = MagicMock()
        import_service.pool.getconn.return_value = mock_conn

        # First succeeds, second fails
        with patch.object(
            import_service,
            "upsert_charger",
            side_effect=[True, False]
        ):
            inserted, failed = import_service.import_chargers(rotterdam_chargers)

        assert inserted == 1
        assert failed == 1


class TestNDWAPI:
    """Integration tests with NDW API (mocked)."""

    @patch("app.services.ndw_import.httpx.Client")
    def test_fetch_ndw_data_success(self, mock_http, import_service, sample_ndw_response):
        """Test successful NDW API fetch."""
        mock_response = MagicMock()
        mock_response.json.return_value = sample_ndw_response
        mock_client = MagicMock()
        mock_client.get.return_value = mock_response
        mock_http.return_value.__enter__.return_value = mock_client

        data = import_service.fetch_ndw_data()

        assert len(data["features"]) == 3
        mock_client.get.assert_called_once()

    @patch("app.services.ndw_import.httpx.Client")
    def test_fetch_ndw_data_network_error(self, mock_http, import_service):
        """Test NDW API fetch with network error."""
        mock_http.return_value.__enter__.return_value.get.side_effect = \
            Exception("Network error")

        with pytest.raises(Exception):
            import_service.fetch_ndw_data()

    @patch.object(NDWImportService, "fetch_ndw_data")
    @patch.object(NDWImportService, "import_chargers")
    def test_run_import_workflow(
        self,
        mock_import,
        mock_fetch,
        import_service,
        sample_ndw_response
    ):
        """Test complete import workflow."""
        mock_fetch.return_value = sample_ndw_response
        mock_import.return_value = (2, 0)

        result = import_service.run_import()

        assert result["status"] == "success"
        assert result["total_fetched"] == 3
        assert result["rotterdam_count"] == 2
        assert result["inserted"] == 2
        assert result["failed"] == 0

    @patch.object(NDWImportService, "fetch_ndw_data")
    def test_run_import_error_handling(self, mock_fetch, import_service):
        """Test error handling in import workflow."""
        mock_fetch.side_effect = Exception("API error")

        result = import_service.run_import()

        assert result["status"] == "error"
        assert "error" in result


# Unit test targets
UNIT_TEST_COVERAGE = {
    "filter_rotterdam_chargers": "Geographic filtering works correctly",
    "parse_charger_properties": "NDW feature parsing works correctly",
    "_parse_price": "Price string parsing handles valid/invalid input",
    "upsert_charger": "Database insert/update with error handling",
    "import_chargers": "Batch import with success/failure tracking",
    "fetch_ndw_data": "NDW API integration",
    "run_import": "Complete workflow with error recovery",
}
