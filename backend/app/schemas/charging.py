"""
Pydantic schemas for charging API requests and responses.

All schemas are typed and validated with Pydantic v2.
"""

from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field


# Request Schemas
class ChargingSearchRequest(BaseModel):
    """Search request for charging points near a destination."""

    destination: str = Field(
        ..., 
        description="Destination address (e.g., 'Rotterdam Centraal')",
        min_length=1,
        max_length=255,
    )
    battery_percentage: int = Field(
        default=50,
        ge=0,
        le=100,
        description="Current battery percentage (0-100)",
    )
    radius_meters: int = Field(
        default=500,
        ge=100,
        le=5000,
        description="Search radius in meters (100-5000)",
    )
    sort_by: str = Field(
        default="cost",
        pattern="^(cost|time|distance)$",
        description="Sort results by: cost, time, or distance",
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "destination": "Rotterdam Centraal",
                    "battery_percentage": 35,
                    "radius_meters": 500,
                    "sort_by": "cost",
                }
            ]
        }
    }


class GeocodeSearchRequest(BaseModel):
    """Address autocomplete request."""

    query: str = Field(
        ...,
        description="Address or place name to search for",
        min_length=2,
        max_length=255,
    )
    limit: int = Field(
        default=5,
        ge=1,
        le=20,
        description="Maximum number of results to return",
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "query": "Rotterdam Centraal",
                    "limit": 5,
                }
            ]
        }
    }


# Response Schemas
class ChargerDetailResponse(BaseModel):
    """Detailed information about a single charger."""

    id: str = Field(..., description="Unique charger ID (UUID)")
    ndw_id: str = Field(..., description="NDW identifier")
    name: str = Field(..., description="Charger name/location")
    address: str = Field(..., description="Street address")
    latitude: Decimal = Field(..., description="Latitude coordinate")
    longitude: Decimal = Field(..., description="Longitude coordinate")
    charger_power_kw: Optional[Decimal] = Field(
        None,
        description="Power output in kilowatts"
    )
    connector_types: list[str] = Field(
        default_factory=list,
        description="Supported connector types (e.g., ['Type2', 'CCS'])"
    )
    num_connectors: int = Field(
        default=0,
        description="Total number of connectors"
    )
    price_per_kwh: Optional[Decimal] = Field(
        None,
        description="Price in EUR per kWh (null if unknown)"
    )
    availability_total: int = Field(
        default=0,
        description="Total available connectors"
    )
    availability_available: int = Field(
        default=0,
        description="Number of currently free connectors"
    )
    last_updated: str = Field(
        ...,
        description="ISO 8601 timestamp of last data update"
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "id": "550e8400-e29b-41d4-a716-446655440000",
                    "ndw_id": "NL-RD-001",
                    "name": "Rotterdam Centraal",
                    "address": "Stationsplein 1, Rotterdam",
                    "latitude": "51.925",
                    "longitude": "4.4678",
                    "charger_power_kw": "50.0",
                    "connector_types": ["Type2", "CCS"],
                    "num_connectors": 8,
                    "price_per_kwh": "0.32",
                    "availability_total": 8,
                    "availability_available": 3,
                    "last_updated": "2026-10-06T10:30:00Z",
                }
            ]
        }
    }


class ChargingCostEstimate(BaseModel):
    """Cost breakdown for charging at a location."""

    total_cost_eur: Decimal = Field(
        ...,
        description="Total estimated cost in EUR"
    )
    battery_kwh: Decimal = Field(
        ...,
        description="Battery capacity needed in kWh"
    )
    charging_time_minutes: int = Field(
        ...,
        description="Estimated charging time in minutes"
    )
    cost_confidence: str = Field(
        ...,
        pattern="^(exact|estimated|unknown)$",
        description="Confidence level: exact (price known), estimated (guessed), unknown (no data)"
    )
    cost_per_hour_eur: Optional[Decimal] = Field(
        None,
        description="Cost per hour of charging in EUR (based on charger power and kWh price)"
    )


class ChargingResultItem(BaseModel):
    """Single charging result with cost and distance."""

    charger: ChargerDetailResponse = Field(
        ...,
        description="Charger details"
    )
    cost_estimate: ChargingCostEstimate = Field(
        ...,
        description="Cost calculation"
    )
    distance_meters: int = Field(
        ...,
        description="Estimated walking distance in meters"
    )
    distance_minutes: Optional[int] = Field(
        None,
        description="Estimated walking time in minutes (optional)"
    )
    total_time_minutes: int = Field(
        ...,
        description="Total time = walking + charging"
    )


class ChargingSearchResponse(BaseModel):
    """Response with ranked charging options."""

    destination: str = Field(
        ...,
        description="Searched destination"
    )
    latitude: Decimal = Field(
        ...,
        description="Destination latitude"
    )
    longitude: Decimal = Field(
        ...,
        description="Destination longitude"
    )
    battery_percentage: int = Field(
        ...,
        description="Current battery percentage used in search"
    )
    results: list[ChargingResultItem] = Field(
        ...,
        description="Ranked charging options"
    )
    total_results: int = Field(
        ...,
        description="Total number of results"
    )
    search_timestamp: str = Field(
        ...,
        description="ISO 8601 timestamp of search"
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "destination": "Rotterdam Centraal",
                    "latitude": "51.925",
                    "longitude": "4.4678",
                    "battery_percentage": 35,
                    "results": [
                        {
                            "charger": {
                                "id": "550e8400-e29b-41d4-a716-446655440000",
                                "ndw_id": "NL-RD-001",
                                "name": "Rotterdam Centraal",
                                "address": "Stationsplein 1, Rotterdam",
                                "latitude": "51.925",
                                "longitude": "4.4678",
                                "charger_power_kw": "50.0",
                                "connector_types": ["Type2", "CCS"],
                                "num_connectors": 8,
                                "price_per_kwh": "0.32",
                                "availability_total": 8,
                                "availability_available": 3,
                                "last_updated": "2026-10-06T10:30:00Z",
                            },
                            "cost_estimate": {
                                "total_cost_eur": "6.72",
                                "battery_kwh": "21.0",
                                "charging_time_minutes": 35,
                                "cost_confidence": "exact",
                            },
                            "distance_meters": 280,
                            "distance_minutes": 4,
                            "total_time_minutes": 39,
                        }
                    ],
                    "total_results": 1,
                    "search_timestamp": "2026-10-06T10:30:00Z",
                }
            ]
        }
    }


class GeocodeResult(BaseModel):
    """Single geocode search result."""

    name: str = Field(
        ...,
        description="Display name of the location"
    )
    latitude: Decimal = Field(
        ...,
        description="Latitude coordinate"
    )
    longitude: Decimal = Field(
        ...,
        description="Longitude coordinate"
    )
    address: str = Field(
        ...,
        description="Full address"
    )
    type: str = Field(
        ...,
        description="Result type (e.g., 'station', 'building', 'street')"
    )


class GeocodeSearchResponse(BaseModel):
    """Response with geocoding results."""

    query: str = Field(
        ...,
        description="Original search query"
    )
    results: list[GeocodeResult] = Field(
        ...,
        description="List of geocoding results"
    )
    total_results: int = Field(
        ...,
        description="Total number of results found"
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "query": "Rotterdam Centraal",
                    "results": [
                        {
                            "name": "Rotterdam Central Station",
                            "latitude": "51.925",
                            "longitude": "4.4678",
                            "address": "Stationsplein 1, 3013 AK Rotterdam, Netherlands",
                            "type": "station",
                        }
                    ],
                    "total_results": 1,
                }
            ]
        }
    }


# Error Response
class ErrorResponse(BaseModel):
    """Standard error response."""

    error: str = Field(
        ...,
        description="Error code (e.g., 'DESTINATION_NOT_FOUND')"
    )
    message: str = Field(
        ...,
        description="Human-readable error message"
    )
    status_code: int = Field(
        ...,
        description="HTTP status code"
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "error": "DESTINATION_NOT_FOUND",
                    "message": "Could not geocode destination address",
                    "status_code": 400,
                }
            ]
        }
    }
