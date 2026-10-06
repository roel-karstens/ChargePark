"""
Tests for geocoding and distance services.

Covers:
- Nominatim address search
- Reverse geocoding
- OSRM walking distance calculation
- Haversine fallback distance calculation
"""

from decimal import Decimal
from unittest.mock import MagicMock, patch

import pytest
import httpx

from app.services.geocoding import GeocodingService
from app.services.distance import DistanceService
from app.schemas.charging import GeocodeResult


class TestGeocodingService:
    """Test address geocoding via Nominatim."""

    @patch("app.services.geocoding.httpx.Client")
    def test_search_address_success(self, mock_http):
        """Test successful address search."""
        mock_response = MagicMock()
        mock_response.json.return_value = [
            {
                "name": "Rotterdam Central Station",
                "lat": "51.925",
                "lon": "4.4678",
                "display_name": "Rotterdam Centraal, Stationsplein, Rotterdam, Netherlands",
                "type": "station",
            }
        ]
        mock_client = MagicMock()
        mock_client.get.return_value = mock_response
        mock_http.return_value.__enter__.return_value = mock_client

        results = GeocodingService.search_address("Rotterdam Centraal", limit=5)

        assert len(results) == 1
        assert isinstance(results[0], GeocodeResult)
        assert results[0].name == "Rotterdam Central Station"
        assert results[0].latitude == Decimal("51.925")
        assert results[0].type == "station"

    @patch("app.services.geocoding.httpx.Client")
    def test_search_address_multiple_results(self, mock_http):
        """Test search with multiple results."""
        mock_response = MagicMock()
        mock_response.json.return_value = [
            {
                "name": "Rotterdam Centraal",
                "lat": "51.925",
                "lon": "4.4678",
                "display_name": "Rotterdam Centraal Station",
                "type": "station",
            },
            {
                "name": "Rotterdam",
                "lat": "51.92",
                "lon": "4.47",
                "display_name": "Rotterdam, Netherlands",
                "type": "city",
            },
        ]
        mock_client = MagicMock()
        mock_client.get.return_value = mock_response
        mock_http.return_value.__enter__.return_value = mock_client

        results = GeocodingService.search_address("Rotterdam", limit=10)

        assert len(results) == 2
        assert results[0].type == "station"
        assert results[1].type == "city"

    @patch("app.services.geocoding.httpx.Client")
    def test_search_address_no_results(self, mock_http):
        """Test search with no results."""
        mock_response = MagicMock()
        mock_response.json.return_value = []
        mock_client = MagicMock()
        mock_client.get.return_value = mock_response
        mock_http.return_value.__enter__.return_value = mock_client

        results = GeocodingService.search_address("zzzzzzzzzzzzz", limit=5)

        assert len(results) == 0

    @patch("app.services.geocoding.httpx.Client")
    def test_search_address_network_error(self, mock_http):
        """Test handling network errors."""
        mock_http.return_value.__enter__.return_value.get.side_effect = \
            httpx.RequestError("Network error")

        with pytest.raises(httpx.RequestError):
            GeocodingService.search_address("Rotterdam Centraal")

    @patch("app.services.geocoding.httpx.Client")
    def test_reverse_geocode_success(self, mock_http):
        """Test successful reverse geocoding."""
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "name": "Rotterdam",
            "lat": "51.925",
            "lon": "4.4678",
            "display_name": "Stationsplein 1, Rotterdam, Netherlands",
            "type": "station",
            "address": {"city": "Rotterdam"},
        }
        mock_client = MagicMock()
        mock_client.get.return_value = mock_response
        mock_http.return_value.__enter__.return_value = mock_client

        result = GeocodingService.reverse_geocode(51.925, 4.4678)

        assert result is not None
        assert isinstance(result, GeocodeResult)
        assert result.latitude == Decimal("51.925")
        assert result.type == "station"

    @patch("app.services.geocoding.httpx.Client")
    def test_reverse_geocode_no_result(self, mock_http):
        """Test reverse geocoding with no result."""
        mock_response = MagicMock()
        mock_response.json.return_value = {}
        mock_client = MagicMock()
        mock_client.get.return_value = mock_response
        mock_http.return_value.__enter__.return_value = mock_client

        result = GeocodingService.reverse_geocode(0, 0)

        assert result is None

    @patch("app.services.geocoding.httpx.Client")
    def test_search_address_limits_to_netherlands(self, mock_http):
        """Test that search limits results to Netherlands."""
        mock_response = MagicMock()
        mock_response.json.return_value = [
            {
                "name": "Amsterdam",
                "lat": "52.37",
                "lon": "4.89",
                "display_name": "Amsterdam, Netherlands",
                "type": "city",
            }
        ]
        mock_client = MagicMock()
        mock_client.get.return_value = mock_response
        mock_http.return_value.__enter__.return_value = mock_client

        GeocodingService.search_address("Amsterdam")

        # Check that countrycodes parameter was passed
        call_args = mock_client.get.call_args
        assert call_args[1]["params"]["countrycodes"] == "nl"


class TestDistanceService:
    """Test walking distance calculation via OSRM."""

    @patch("app.services.distance.httpx.Client")
    def test_calculate_distance_success(self, mock_http):
        """Test successful distance calculation via OSRM."""
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "code": "Ok",
            "routes": [
                {
                    "distance": 280.5,  # meters
                    "duration": 224.0,  # seconds (3.7 min)
                }
            ],
        }
        mock_client = MagicMock()
        mock_client.get.return_value = mock_response
        mock_http.return_value.__enter__.return_value = mock_client

        result = DistanceService.calculate_distance(
            start_lat=51.925,
            start_lon=4.4678,
            end_lat=51.927,
            end_lon=4.470,
        )

        assert result["distance_meters"] == 280
        assert result["duration_minutes"] == 3  # 224s / 60 = 3.7 min → 3

    @patch("app.services.distance.httpx.Client")
    def test_calculate_distance_osrm_error(self, mock_http):
        """Test fallback when OSRM returns error."""
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "code": "NoRoute",
        }
        mock_client = MagicMock()
        mock_client.get.return_value = mock_response
        mock_http.return_value.__enter__.return_value = mock_client

        result = DistanceService.calculate_distance(
            start_lat=51.925,
            start_lon=4.4678,
            end_lat=51.927,
            end_lon=4.470,
        )

        # Should fall back to Haversine (will still have distance and duration)
        assert "distance_meters" in result
        assert "duration_minutes" in result

    @patch("app.services.distance.httpx.Client")
    def test_calculate_distance_network_error(self, mock_http):
        """Test fallback when network error occurs."""
        mock_http.return_value.__enter__.return_value.get.side_effect = \
            httpx.RequestError("Network error")

        result = DistanceService.calculate_distance(
            start_lat=51.925,
            start_lon=4.4678,
            end_lat=51.927,
            end_lon=4.470,
        )

        # Should fall back to Haversine
        assert "distance_meters" in result
        assert "duration_minutes" in result

    def test_fallback_distance_straight_line(self):
        """Test Haversine fallback distance calculation."""
        # Rotterdam Centraal to Parking Stavoren (known nearby location)
        result = DistanceService._fallback_distance(
            start_lat=51.925,
            start_lon=4.4678,
            end_lat=51.928,  # ~330m north
            end_lon=4.4678,
        )

        # Should estimate distance in reasonable range
        assert result["distance_meters"] > 200
        assert result["distance_meters"] < 500
        assert result["duration_minutes"] >= 1

    @patch("app.services.distance.httpx.Client")
    def test_calculate_distance_no_routes(self, mock_http):
        """Test when OSRM returns no routes."""
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "code": "Ok",
            "routes": [],  # Empty routes
        }
        mock_client = MagicMock()
        mock_client.get.return_value = mock_response
        mock_http.return_value.__enter__.return_value = mock_client

        result = DistanceService.calculate_distance(
            start_lat=51.925,
            start_lon=4.4678,
            end_lat=51.927,
            end_lon=4.470,
        )

        # Should fall back
        assert "distance_meters" in result

    @patch("app.services.distance.httpx.Client")
    def test_calculate_distance_osrm_coordinates_format(self, mock_http):
        """Test that coordinates are passed correctly to OSRM (lon,lat format)."""
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "code": "Ok",
            "routes": [{"distance": 100, "duration": 60}],
        }
        mock_client = MagicMock()
        mock_client.get.return_value = mock_response
        mock_http.return_value.__enter__.return_value = mock_client

        DistanceService.calculate_distance(
            start_lat=51.925,
            start_lon=4.4678,
            end_lat=51.927,
            end_lon=4.470,
        )

        # Verify coordinates are in lon,lat format (OSRM requirement)
        call_args = mock_client.get.call_args
        url = call_args[0][0]
        # Should contain coordinates in format: lon,lat;lon,lat
        assert "4.4678,51.925" in url
        assert "4.470,51.927" in url

    def test_fallback_distance_same_point(self):
        """Test Haversine distance for same point."""
        result = DistanceService._fallback_distance(
            start_lat=51.925,
            start_lon=4.4678,
            end_lat=51.925,
            end_lon=4.4678,
        )

        assert result["distance_meters"] == 0
        assert result["duration_minutes"] == 1  # Minimum 1 minute
