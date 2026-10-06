"""
API routes for charging search and charger details.

Endpoints:
  POST /api/v1/charging/search - Search and rank charging options
  GET /api/v1/charging/{id} - Get charger details
  GET /api/v1/geocode/search - Address autocomplete
"""

import logging
from datetime import datetime
from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.schemas.charging import (
    ChargingSearchRequest,
    ChargingSearchResponse,
    ChargerDetailResponse,
    ErrorResponse,
    GeocodeSearchRequest,
    GeocodeSearchResponse,
)
from app.services.charging import ChargingService
from app.services.distance import DistanceService
from app.services.geocoding import GeocodingService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1", tags=["charging"])


# POST /api/v1/charging/search
@router.post(
    "/charging/search",
    response_model=ChargingSearchResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid request"},
        404: {"model": ErrorResponse, "description": "Destination not found"},
        500: {"model": ErrorResponse, "description": "Server error"},
    },
)
async def search_charging(
    request: ChargingSearchRequest,
    db: Annotated[Session, Depends(get_db)],
) -> ChargingSearchResponse:
    """
    Search for charging options near a destination.

    1. Geocodes the destination address
    2. Finds nearby chargers using geographic radius
    3. Calculates costs and walking distances
    4. Ranks results by requested criteria (cost, time, distance)

    Args:
        request: Search parameters (destination, battery %, radius, sort by)
        db: Database session

    Returns:
        Ranked list of charging options with costs and times

    Raises:
        HTTPException: If destination not found or service error
    """
    logger.info(
        f"Charging search: {request.destination}, "
        f"battery={request.battery_percentage}%, "
        f"sort_by={request.sort_by}"
    )

    try:
        # Step 1: Determine destination coordinates
        dest_lat = None
        dest_lon = None
        
        # Check if destination is already coordinates (lat,lon format)
        if ',' in request.destination:
            try:
                parts = request.destination.split(',')
                if len(parts) == 2:
                    dest_lat = float(parts[0].strip())
                    dest_lon = float(parts[1].strip())
                    logger.info(f"Using provided coordinates: ({dest_lat}, {dest_lon})")
            except ValueError:
                pass  # Not coordinates, will geocode below
        
        # If not coordinates, geocode the address
        if dest_lat is None or dest_lon is None:
            geocoding_service = GeocodingService()
            geocode_results = geocoding_service.search_address(request.destination, limit=1)

            if not geocode_results:
                logger.warning(f"Could not geocode: {request.destination}")
                raise HTTPException(
                    status_code=404,
                    detail={
                        "error": "DESTINATION_NOT_FOUND",
                        "message": f"Could not find destination: {request.destination}",
                        "status_code": 404,
                    },
                )

            destination_result = geocode_results[0]
            dest_lat = float(destination_result.latitude)
            dest_lon = float(destination_result.longitude)

            logger.info(
                f"Geocoded to: {destination_result.address} "
                f"({dest_lat}, {dest_lon})"
            )

        # Step 2: Find nearby chargers
        charging_service = ChargingService(db)
        nearby_chargers = charging_service.search_chargers_by_location(
            latitude=dest_lat,
            longitude=dest_lon,
            radius_meters=request.radius_meters,
            limit=20,
        )

        if not nearby_chargers:
            logger.warning(
                f"No chargers found within {request.radius_meters}m "
                f"of {request.destination}"
            )
            raise HTTPException(
                status_code=404,
                detail={
                    "error": "NO_CHARGERS_FOUND",
                    "message": (
                        f"No charging points found within "
                        f"{request.radius_meters}m of {request.destination}"
                    ),
                    "status_code": 404,
                },
            )

        # Step 3: Calculate costs and distances for each charger
        distance_service = DistanceService()
        result_items = []

        for charger in nearby_chargers:
            charger_lat = float(charger["latitude"])
            charger_lon = float(charger["longitude"])

            # Get walking distance via OSRM (with fallback to Haversine)
            distance_info = distance_service.calculate_distance(
                start_lat=dest_lat,
                start_lon=dest_lon,
                end_lat=charger_lat,
                end_lon=charger_lon,
            )

            # Create result item with cost and time estimates
            result_item = charging_service.create_result_item(
                charger=charger,
                battery_percentage=request.battery_percentage,
                distance_meters=distance_info["distance_meters"],
                distance_walking_minutes=distance_info.get("duration_minutes"),
            )
            result_items.append(result_item)

        # Step 4: Rank results
        ranked_results = charging_service.rank_results(result_items, request.sort_by)

        logger.info(
            f"Returning {len(ranked_results)} ranked results "
            f"sorted by {request.sort_by}"
        )

        return ChargingSearchResponse(
            destination=request.destination,
            latitude=Decimal(str(dest_lat)),
            longitude=Decimal(str(dest_lon)),
            battery_percentage=request.battery_percentage,
            results=ranked_results,
            total_results=len(ranked_results),
            search_timestamp=datetime.utcnow().isoformat() + "Z",
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Search error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "error": "SEARCH_ERROR",
                "message": "An error occurred during search",
                "status_code": 500,
            },
        )


# GET /api/v1/charging/{id}
@router.get(
    "/charging/{charger_id}",
    response_model=ChargerDetailResponse,
    responses={
        404: {"model": ErrorResponse, "description": "Charger not found"},
        500: {"model": ErrorResponse, "description": "Server error"},
    },
)
async def get_charger_detail(
    charger_id: str,
    db: Annotated[Session, Depends(get_db)],
) -> ChargerDetailResponse:
    """
    Get detailed information about a specific charger.

    Args:
        charger_id: UUID of the charger
        db: Database session

    Returns:
        Charger details

    Raises:
        HTTPException: If charger not found or service error
    """
    logger.info(f"Fetching charger details: {charger_id}")

    try:
        charging_service = ChargingService(db)
        charger = charging_service.get_charger_by_id(charger_id)

        if not charger:
            logger.warning(f"Charger not found: {charger_id}")
            raise HTTPException(
                status_code=404,
                detail={
                    "error": "CHARGER_NOT_FOUND",
                    "message": f"Charger {charger_id} not found",
                    "status_code": 404,
                },
            )

        return charging_service.charger_to_detail_response(charger)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching charger {charger_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "error": "FETCH_ERROR",
                "message": "An error occurred fetching charger details",
                "status_code": 500,
            },
        )


# GET /api/v1/geocode/search
@router.get(
    "/geocode/search",
    response_model=GeocodeSearchResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid query"},
        404: {"model": ErrorResponse, "description": "No results found"},
        500: {"model": ErrorResponse, "description": "Server error"},
    },
)
async def geocode_search(
    query: Annotated[str, Query(..., min_length=2, max_length=255)],
    limit: Annotated[int, Query(ge=1, le=20)] = 5,
) -> GeocodeSearchResponse:
    """
    Search for addresses and locations via geocoding.

    Used for destination autocomplete in frontend.

    Args:
        query: Address or place name to search for
        limit: Maximum results to return (1-20)

    Returns:
        List of geocoding results

    Raises:
        HTTPException: If service error
    """
    logger.info(f"Geocoding search: {query}, limit={limit}")

    try:
        geocoding_service = GeocodingService()
        results = geocoding_service.search_address(query, limit=limit)

        if not results:
            logger.warning(f"No geocoding results for: {query}")
            raise HTTPException(
                status_code=404,
                detail={
                    "error": "NO_RESULTS",
                    "message": f"No locations found for: {query}",
                    "status_code": 404,
                },
            )

        return GeocodeSearchResponse(
            query=query,
            results=results,
            total_results=len(results),
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Geocoding error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "error": "GEOCODING_ERROR",
                "message": "An error occurred during geocoding",
                "status_code": 500,
            },
        )
