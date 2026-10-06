# ChargePark: Implementation Plan

## Overview

This plan covers implementation of the MVP for Rotterdam using the existing AI Starter architecture.

---

## Architecture Overview

The MVP extends the existing 3-tier starter:

```
┌──────────────────────────────────────────┐
│ Frontend (React + TypeScript)            │
│ - Home screen (destination search)       │
│ - Results view (map + list)              │
│ - Detail view (charger info)             │
│ - Battery slider                         │
└──────────────────────────────────────────┘
              ↓ HTTP Calls
┌──────────────────────────────────────────┐
│ Backend (FastAPI + Python)               │
│ - Geocoding (address → lat/lon)          │
│ - Nearby chargers search (geographic)    │
│ - Cost calculation                       │
│ - Charging time estimation               │
│ - Walking distance (OSRM)                │
│ - Data import service (NDW)              │
└──────────────────────────────────────────┘
              ↓ SQL Queries
┌──────────────────────────────────────────┐
│ Database (PostgreSQL + PostGIS)          │
│ - Charging point locations               │
│ - Charging tariffs                       │
│ - Geographic indexes                     │
└──────────────────────────────────────────┘
```

---

## Domain Model

### Entities

**ChargingPoint**
```python
class ChargingPoint:
    id: UUID
    ndw_id: str (unique)
    name: str
    address: str
    location: Point (PostGIS)
    charger_power_kw: float
    connector_types: List[str]
    num_connectors: int
    price_per_kwh: Optional[float]  # €/kWh
    availability_total: int
    availability_available: int
    last_updated: datetime
```

**ChargingSearchQuery**
```python
class ChargingSearchQuery:
    destination: Point (lat, lon)
    battery_percentage: int (0-100)
    search_radius_m: int (default: 500)
```

**ChargingRecommendation**
```python
class ChargingRecommendation:
    charging_point: ChargingPoint
    total_cost: float (€)
    charging_time_minutes: int
    walking_distance_m: int
    walking_time_minutes: int
    rank: int
    reason: str (e.g., "Recommended because: lowest cost, available now")
```

### Database Schema

```sql
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE charging_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ndw_id VARCHAR UNIQUE NOT NULL,
    name VARCHAR NOT NULL,
    address VARCHAR NOT NULL,
    location POINT NOT NULL,
    charger_power_kw DECIMAL(5,1) NOT NULL,
    connector_types VARCHAR[] NOT NULL,
    num_connectors INT NOT NULL,
    price_per_kwh DECIMAL(5,2),
    availability_total INT,
    availability_available INT,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Geographic index for fast spatial queries
CREATE INDEX idx_charging_location ON charging_points USING GIST(location);
CREATE INDEX idx_charging_ndw_id ON charging_points(ndw_id);
CREATE INDEX idx_charging_price ON charging_points(price_per_kwh);

-- RLS: Public data, no authentication needed for MVP
ALTER TABLE charging_points DISABLE ROW LEVEL SECURITY;
```

---

## Implementation Phases

### Phase 1: Data Ingestion (Week 1)

**Goal:** NDW data flowing into database

**Tasks:**
1. Set up PostGIS extension in Supabase
2. Create `charging_points` table with geographic indexes
3. Implement NDW data import script
   - Fetch from opendata.ndw.nu
   - Parse GeoJSON + OCPI tariffs
   - Validate + clean
   - Upsert into database
4. Set up cron job (every 10 minutes)
5. Verify data in database

**Deliverables:**
- ✅ ~2000 charging points loaded for Rotterdam
- ✅ Prices visible in database
- ✅ Geographic indexes verified

**Testing:**
- Sample queries work fast
- Data freshness verified
- Error handling tested (network failure, parse error)

---

### Phase 2: Backend APIs (Week 2)

**Goal:** Core business logic working

**Tasks:**
1. Implement `/api/v1/charging/search` endpoint
   ```python
   POST /api/v1/charging/search
   Request:
   {
     "destination_lat": 51.916,
     "destination_lon": 4.476,
     "battery_percentage": 50,
     "radius_meters": 500
   }
   Response:
   {
     "recommendations": [
       {
         "id": "...",
         "name": "Q-Park Blaaktuin",
         "address": "...",
         "price_per_kwh": 0.42,
         "total_cost": 12.60,
         "charging_time_minutes": 45,
         "walking_distance_m": 280,
         "availability": "2/8",
         "rank": 1
       },
       ...
     ],
     "count": 8
   }
   ```

2. Implement `/api/v1/charging/{id}` endpoint
   - Full charger details

3. Implement geocoding service
   - `/api/v1/geocode/search?q=Rotterdam%20Centraal`
   - Calls Nominatim

4. Implement distance calculation service
   - Internal utility (not exposed as API)
   - Calls OSRM

**Business Logic:**
- Cost calculation: (battery_pct / 100) × 60 kWh × price_per_kwh
- Charging time: (battery_pct / 100) × 60 minutes (at 11kW)
- Ranking: Sort by cost (cheapest first)
- Distance: Calculate walking distance via OSRM

**Testing:**
- Unit tests for calculations
- Integration tests for API endpoints
- Sample queries verified

**Deliverables:**
- ✅ Working `/api/v1/charging/search` endpoint
- ✅ Geocoding working
- ✅ Distance calculations working
- ✅ Tests passing

---

### Phase 3: Frontend UI (Week 3)

**Goal:** User-facing interface

**Tasks:**
1. Home page
   - Destination search input (with autocomplete)
   - Map button (alternate entry)
   - Clean, minimal design

2. Results page
   - List view of recommendations
   - Map view toggle
   - Battery slider
   - Sort/filter controls (v2)

3. Detail page
   - Full charger information
   - Cost breakdown
   - Distance + time
   - Navigate button

4. Error states
   - No results
   - API errors
   - Loading states

5. Mobile responsiveness
   - Tested on iOS and Android
   - Touch targets 48px+
   - One-handed use

**Components:**
- `SearchBar` (autocomplete input)
- `ChargingCard` (result item)
- `ResultsList` (scrollable list)
- `MapView` (Leaflet integration)
- `DetailModal` (charger details)
- `BatterySlider` (percentage control)
- `LoadingState` (spinner)
- `ErrorAlert` (error message)

**Testing:**
- Component tests (Vitest)
- User flow tests
- Mobile-specific testing

**Deliverables:**
- ✅ Home → Search → Results → Details flow working
- ✅ Battery slider updates results
- ✅ Mobile responsive
- ✅ No console errors

---

### Phase 4: Integration Testing (Week 4)

**Goal:** End-to-end verification

**Tasks:**
1. Full user flow testing
   - Search Rotterdam Centraal
   - See real results
   - Adjust battery
   - View details
   - Navigate out

2. Data quality verification
   - Price accuracy (spot-check vs. NDW)
   - Distance accuracy (5+ locations verified)
   - Availability status (manual spot-check)

3. Performance testing
   - Page load <2s
   - Results <2s
   - Map interactions smooth

4. Edge cases
   - No results found
   - API timeout
   - Missing prices
   - Stale availability

5. Mobile testing
   - iOS 14+
   - Android 10+
   - Various screen sizes

**Deliverables:**
- ✅ Full user flow verified in real app
- ✅ Data quality verified
- ✅ Performance acceptable
- ✅ Mobile working

---

## Technology Stack

### Frontend
- React 18
- TypeScript (strict mode)
- Vite (build)
- Leaflet (maps)
- React Query (data fetching)
- Vitest (testing)
- TailwindCSS (styling)

### Backend
- FastAPI
- Python 3.12+
- Pydantic (validation)
- Pyright (type checking)
- Pytest (testing)
- Httpx (HTTP client)

### External Services
- Nominatim (geocoding, free)
- OSRM (walking distance, free)
- NDW Open Data (charging data, free)

### Database
- PostgreSQL 15+
- PostGIS (geographic queries)
- Supabase (managed PostgreSQL)

---

## File Structure

### Backend
```
backend/app/
├── api/
│   ├── __init__.py
│   ├── charging.py          # Main charging endpoints
│   ├── geocoding.py         # Address search
│   └── health.py            # Health check
├── services/
│   ├── __init__.py
│   ├── charging_service.py  # Core business logic
│   ├── geocoding_service.py # Nominatim integration
│   ├── distance_service.py  # OSRM integration
│   └── ndw_import_service.py # NDW data fetching
├── models/
│   ├── __init__.py
│   ├── charging_point.py    # SQLAlchemy model
│   └── recommendation.py    # Result model
├── schemas/
│   ├── __init__.py
│   ├── charging.py          # Request/response schemas
│   └── geocoding.py
├── dependencies.py          # FastAPI dependencies
├── main.py                  # App entry point
└── config.py                # Settings
```

### Frontend
```
frontend/src/
├── components/
│   ├── SearchBar.tsx        # Destination search + autocomplete
│   ├── ChargingCard.tsx     # Result card
│   ├── ResultsList.tsx      # List view
│   ├── MapView.tsx          # Map view
│   ├── DetailModal.tsx      # Charger details
│   ├── BatterySlider.tsx    # Battery percentage
│   └── ErrorAlert.tsx       # Error display (reuse)
├── pages/
│   ├── HomePage.tsx         # Initial search screen
│   ├── ResultsPage.tsx      # Results view
│   └── DetailPage.tsx       # Detail view
├── hooks/
│   ├── useChargingSearch.ts # Search API hook
│   ├── useBattery.ts        # Battery state
│   └── useGeocoding.ts      # Address search hook
├── lib/
│   ├── api.ts               # API client (extend)
│   └── osm.ts               # Map utilities
├── types/
│   ├── index.ts             # Shared types
│   └── charging.ts          # Charging-specific types
└── App.tsx
```

---

## API Contracts

### GET /api/v1/charging/search

**Request:**
```json
{
  "destination_lat": 51.916,
  "destination_lon": 4.476,
  "battery_percentage": 50,
  "radius_meters": 500
}
```

**Response:**
```json
{
  "destination": {
    "lat": 51.916,
    "lon": 4.476,
    "address": "Rotterdam Centraal"
  },
  "search_params": {
    "battery_percentage": 50,
    "radius_meters": 500
  },
  "recommendations": [
    {
      "id": "uuid",
      "name": "Q-Park Blaaktuin",
      "address": "Blaaktuin 12, Rotterdam 3011 TA",
      "location": {
        "lat": 51.9165,
        "lon": 4.4757
      },
      "charger_power_kw": 11,
      "connector_types": ["Type 2"],
      "num_connectors": 8,
      "price_per_kwh": 0.42,
      "total_cost": 12.60,
      "charging_time_minutes": 45,
      "walking_distance_m": 280,
      "walking_time_minutes": 4,
      "availability_total": 8,
      "availability_available": 2,
      "data_freshness_minutes": 2,
      "rank": 1
    },
    ...
  ],
  "count": 8
}
```

### GET /api/v1/charging/{id}

Returns full details for a charger (same structure as above).

### GET /api/v1/geocode/search?q=Rotterdam%20Centraal

**Response:**
```json
{
  "results": [
    {
      "display_name": "Rotterdam Centraal, Rotterdam",
      "lat": 51.916,
      "lon": 4.476,
      "type": "railway_station"
    },
    ...
  ]
}
```

---

## Testing Strategy

### Unit Tests
- Charging calculations (cost, time, distance)
- Data validation (Pydantic models)
- Geocoding response parsing
- Distance calculation logic

### Integration Tests
- API endpoints (end-to-end)
- Database queries
- External service calls (Nominatim, OSRM, NDW)
- Data import pipeline

### Component Tests
- SearchBar autocomplete
- BatterySlider updates
- ResultsList rendering
- DetailModal display

### E2E Tests
- Home → Search → Results → Details flow
- Error states (no results, API down)
- Mobile responsiveness

### Manual Testing
- Data quality (prices vs. NDW)
- Distance accuracy (spot checks)
- App performance on real devices
- UX/usability

---

## Deployment & DevOps

### Environment Setup

```
.env.example:
DATABASE_URL=postgresql://...
NDW_DATA_URL=https://opendata.ndw.nu/
NOMINATIM_URL=https://nominatim.openstreetmap.org/
OSRM_URL=https://router.project-osrm.org/
VITE_API_URL=http://localhost:8000
```

### CI/CD

- GitHub Actions (test + build)
- Lint checks (ESLint, Ruff)
- Type checks (TypeScript, Pyright)
- Unit tests (Vitest, Pytest)
- Build verification (Vite, FastAPI)

### Deployment

1. Backend: Vercel or Supabase Functions
2. Frontend: Vercel
3. Database: Supabase PostgreSQL
4. Import Service: Scheduled job (cron)

---

## Timeline

| Week | Phase | Deliverable |
|------|-------|-------------|
| 1 | Data | NDW data in database |
| 2 | Backend | APIs working, tested |
| 3 | Frontend | UI complete, mobile ready |
| 4 | Integration | End-to-end verified |

**Total:** 4 weeks for MVP

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| NDW data quality issues | High | Spot-check data weekly, show "Unknown" for missing |
| API performance | High | Database indexes, query optimization, caching |
| Geocoding accuracy | Medium | Test on real addresses, handle edge cases |
| Mobile compatibility | Medium | Device testing (iOS/Android), responsive design |
| Data privacy | Low | No user data collection in MVP |

---

## Success Criteria

- ✅ Search works in <2s
- ✅ Results accurate and ranked correctly
- ✅ Mobile UI fast and responsive
- ✅ Data freshness verified
- ✅ End-to-end flow smooth
- ✅ No critical bugs

---

## Next Steps

1. **Week 1 kickoff:** Set up database schema, start NDW import
2. **Code review cadence:** Daily standup, weekly architecture reviews
3. **Verification:** Use Verification Skill after each major component
4. **Documentation:** Keep architecture and API docs current
5. **Feedback:** Collect user feedback during testing phase

---

## Decision Log

| Decision | Rationale | Status |
|----------|-----------|--------|
| **4-week timeline** | Realistic MVP pace | ✅ |
| **PostgreSQL + PostGIS** | Efficient geographic queries | ✅ |
| **FastAPI + React** | Extend existing starter | ✅ |
| **Simple cost model MVP** | Sufficient for validation | ✅ |
| **No auth MVP** | Reduce complexity | ✅ |
| **Vercel deployment** | Fast, simple, scalable | ✅ |
