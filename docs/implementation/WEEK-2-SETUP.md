# Week 2: Backend APIs Development

## Overview

Week 2 implements the core charging search API and supporting services.

**Deliverables:**
- ✅ Pydantic schemas (requests/responses)
- ✅ ChargingService (database queries, cost calculation, ranking)
- ✅ GeocodingService (Nominatim integration)
- ✅ DistanceService (OSRM integration)
- ✅ API routes (search, charger detail, geocoding)
- ✅ Comprehensive test coverage

---

## Phase 1: Service Layer

### 1.1 ChargingService

**Responsibilities:**
- Geographic radius searches using PostGIS
- Cost calculation (exact and estimated)
- Charging time estimation
- Result ranking (by cost, time, or distance)
- Charger detail retrieval

**Key Methods:**
```python
service.search_chargers_by_location(lat, lon, radius_meters)
service.calculate_cost(battery_percentage, price_per_kwh)
service.create_result_item(charger, battery_percentage, distance_meters)
service.rank_results(results, sort_by="cost")
service.get_charger_by_id(charger_id)
```

**Cost Calculation (MVP):**
- Assumes 60 kWh battery capacity
- Linear charging time: 1 minute per % battery
- Cost formula: `(battery_pct / 100) × 60 kWh × price_per_kwh`
- Fallback price: €0.32/kWh if unknown (Rotterdam average)

### 1.2 GeocodingService

**Responsibilities:**
- Address search via Nominatim (OpenStreetMap)
- Reverse geocoding (coordinates → address)
- Limited to Netherlands (MVP scope)

**Key Methods:**
```python
service.search_address(query, limit=5)
service.reverse_geocode(latitude, longitude)
```

**Details:**
- Uses public Nominatim instance (no auth required)
- Filters to Netherlands only (`countrycodes=nl`)
- Returns: name, address, coordinates, type

### 1.3 DistanceService

**Responsibilities:**
- Walking distance calculation via OSRM
- Fallback to Haversine formula
- Walking time estimation

**Key Methods:**
```python
service.calculate_distance(start_lat, start_lon, end_lat, end_lon)
```

**Details:**
- Uses public OSRM instance (no auth required)
- OSRM response: distance (meters) + duration (seconds)
- Fallback Haversine: ~1.4 m/s = 84m/min estimate
- Minimum 1 minute for any distance

---

## Phase 2: Pydantic Schemas

All request/response schemas are in `app/schemas/charging.py`:

**Request Schemas:**
- `ChargingSearchRequest` — Search parameters
- `GeocodeSearchRequest` — Address autocomplete

**Response Schemas:**
- `ChargerDetailResponse` — Full charger info
- `ChargingCostEstimate` — Cost breakdown
- `ChargingResultItem` — Result with cost + distance
- `ChargingSearchResponse` — Ranked results
- `GeocodeSearchResponse` — Geocoding results
- `ErrorResponse` — Standard error format

All schemas have:
- Full type hints
- Pydantic validation
- JSON schema examples
- Field descriptions (for OpenAPI docs)

---

## Phase 3: API Routes

### 3.1 POST /api/v1/charging/search

**Main endpoint for charging search.**

Request:
```json
{
  "destination": "Rotterdam Centraal",
  "battery_percentage": 35,
  "radius_meters": 500,
  "sort_by": "cost"
}
```

Response:
```json
{
  "destination": "Rotterdam Centraal",
  "latitude": "51.925",
  "longitude": "4.4678",
  "battery_percentage": 35,
  "results": [
    {
      "charger": { /* full charger details */ },
      "cost_estimate": {
        "total_cost_eur": "6.72",
        "battery_kwh": "21.0",
        "charging_time_minutes": 35,
        "cost_confidence": "exact"
      },
      "distance_meters": 280,
      "distance_minutes": 4,
      "total_time_minutes": 39
    }
  ],
  "total_results": 15,
  "search_timestamp": "2026-10-06T10:30:00Z"
}
```

**Workflow:**
1. Geocode destination → coordinates
2. Find chargers within radius (PostGIS)
3. Calculate cost for each (battery % × price/kWh)
4. Estimate walking distance (OSRM or Haversine)
5. Calculate total time (charging + walking)
6. Rank by sort_by criteria
7. Return response

**Error Cases:**
- 400: Invalid battery % or radius
- 404: Destination not found or no chargers found
- 500: Service errors

### 3.2 GET /api/v1/charging/{id}

**Get charger details by ID.**

Response:
```json
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
  "last_updated": "2026-10-06T10:30:00Z"
}
```

**Error Cases:**
- 404: Charger not found
- 500: Database error

### 3.3 GET /api/v1/geocode/search

**Address autocomplete for frontend.**

Request:
```
GET /api/v1/geocode/search?query=Rotterdam%20Centraal&limit=5
```

Response:
```json
{
  "query": "Rotterdam Centraal",
  "results": [
    {
      "name": "Rotterdam Central Station",
      "latitude": "51.925",
      "longitude": "4.4678",
      "address": "Stationsplein 1, 3013 AK Rotterdam, Netherlands",
      "type": "station"
    }
  ],
  "total_results": 1
}
```

**Error Cases:**
- 400: Invalid query (too short/long)
- 404: No results found
- 500: Nominatim error

---

## Phase 4: Run and Test

### 4.1 Install Dependencies

```bash
cd backend
pip install -e .
```

This installs all packages including:
- `httpx>=0.25.0` — HTTP client
- `psycopg2-binary>=2.9.0` — PostgreSQL driver

### 4.2 Configure Environment

```bash
# backend/.env
DATABASE_URL=postgresql://postgres:<password>@<host>:5432/postgres
```

### 4.3 Run Tests

```bash
# All tests
pytest tests/

# Specific test file
pytest tests/test_charging_service.py -v

# With coverage
pytest tests/ --cov=app --cov-report=html
```

**Test Files:**
- `test_ndw_import.py` — Week 1 data service
- `test_charging_service.py` — Cost calculation, ranking, search
- `test_geocoding_distance.py` — Nominatim and OSRM

**Test Count:** 40+ test cases covering:
- ✅ Cost calculation (exact price, fallback, edge cases)
- ✅ Result ranking (by cost, time, distance)
- ✅ Geographic queries (radius, ordering)
- ✅ Address geocoding (success, no results, errors)
- ✅ Distance calculation (OSRM, Haversine fallback)
- ✅ Error handling (network, database, validation)

### 4.4 Start Backend Server

```bash
cd backend
python -m uvicorn app.main:app --port 8000 --reload
```

**Server starts at:** http://localhost:8000

**OpenAPI Docs:** http://localhost:8000/docs

### 4.5 Test Manually with curl

**Search for charging:**
```bash
curl -X POST http://localhost:8000/api/v1/charging/search \
  -H "Content-Type: application/json" \
  -d '{
    "destination": "Rotterdam Centraal",
    "battery_percentage": 35,
    "radius_meters": 500,
    "sort_by": "cost"
  }'
```

**Get charger detail:**
```bash
curl http://localhost:8000/api/v1/charging/550e8400-e29b-41d4-a716-446655440000
```

**Geocode address:**
```bash
curl "http://localhost:8000/api/v1/geocode/search?query=Rotterdam%20Centraal&limit=5"
```

---

## Phase 5: Acceptance Criteria

Week 2 is complete when:

- ✅ All services implemented (charging, geocoding, distance)
- ✅ All API routes working (search, detail, geocoding)
- ✅ All tests passing: `pytest tests/`
- ✅ Type checking passing: `pyright app/`
- ✅ Linting passing: `ruff check app/`
- ✅ OpenAPI docs at /docs
- ✅ Manual curl tests successful
- ✅ Cost calculation verified
- ✅ Geographic queries working (PostGIS)
- ✅ Error cases handled (404, validation, network)

---

## Verification Checklist

**Static Validation:**
```bash
# Type check
pyright app/

# Linting
ruff check app/ --fix

# Format check
black --check app/

# Test
pytest tests/ -v
```

**Runtime Verification:**
1. Start backend: `python -m uvicorn app.main:app --port 8000`
2. Search for charging → verify results are ranked by cost
3. Check cost calculation: (battery_pct / 100) × 60 × price
4. Verify distance is reasonable (<2km for Rotterdam MVP)
5. Test with 0% and 100% battery
6. Test with unknown price (should use fallback)
7. Test invalid requests (should return 400/404)

---

## Known Limitations (Documented)

These are acceptable for MVP:

1. **Charging Time (Linear Model)**
   - Uses simplified formula: battery_pct × 1 minute
   - Actual curves are S-shaped (docs explain this)
   - ±10% accuracy acceptable for MVP ranking

2. **Battery Capacity (Fixed)**
   - Assumes 60 kWh typical EV
   - Real: varies 40-90 kWh by model
   - Will add vehicle database in v2

3. **Distance (Fallback Haversine)**
   - OSRM unavailable → straight-line ~1.4 m/s estimate
   - Less accurate than street routing
   - Sufficient for MVP ranking

4. **Data Refresh (Every 10 minutes)**
   - Not true real-time
   - Good enough for destination planning
   - Can stream/poll in v2

All documented in code comments and API responses.

---

## Code Quality

All code follows requirements:
- ✅ Strict Python type hints (Pyright strict mode)
- ✅ Pydantic validation (all requests/responses)
- ✅ Error handling (network, database, validation)
- ✅ Logging (all operations logged)
- ✅ Tests (40+ cases, high coverage)
- ✅ Docstrings (all functions documented)
- ✅ No secrets in code (use environment variables)

---

## Next Steps (Week 3)

Once Week 2 is complete:

1. Build React frontend components
   - SearchBar with autocomplete
   - ChargingCard for results
   - ResultsList and MapView
   - DetailModal for charger info

2. Create React hooks
   - useChargingSearch()
   - useGeocoding()
   - useBattery()

3. Build pages
   - HomePage (search)
   - ResultsPage (map + list)
   - DetailPage (charger info)

4. Responsive mobile UX
   - Mobile-first layout
   - Touch-friendly buttons (48px+)
   - One-handed use

---

## Resources

- **Nominatim API:** https://nominatim.org/
- **OSRM API:** https://project-osrm.org/
- **PostGIS Queries:** https://postgis.net/docs/
- **FastAPI Docs:** https://fastapi.tiangolo.com/
- **Pydantic V2:** https://docs.pydantic.dev/latest/
