# Week 1: Data Ingestion Setup

## Overview

Week 1 prepares the database and loads NDW charging point data for the Rotterdam MVP.

**Deliverables:**
- ✅ PostGIS extension enabled
- ✅ `charging_points` table created
- ✅ NDW import service implemented
- ✅ ~2000 Rotterdam chargers loaded
- ✅ Geographic queries tested

---

## Phase 1: Database Setup

### 1.1 Enable PostGIS in Supabase

PostGIS provides geographic/spatial data types and functions for efficient location-based queries.

**Steps:**

1. Go to [Supabase Console](https://supabase.com)
2. Select ChargePark project
3. Navigate to **SQL Editor**
4. Click **New Query**
5. Run the migration file:

```bash
# Copy content of supabase/migrations/0002_charging_points.sql
# Paste into Supabase SQL Editor
# Click "Run"
```

**Or via CLI** (if using Supabase CLI):
```bash
supabase db push
```

**Verify:**
```sql
-- Check PostGIS is enabled
SELECT postgis_version();

-- Check table exists
SELECT * FROM information_schema.tables 
WHERE table_name = 'charging_points';

-- Check indexes exist
SELECT indexname FROM pg_indexes 
WHERE tablename = 'charging_points';
```

---

### 1.2 Verify Table Structure

```bash
# Via psql
psql -h <supabase_host> -U postgres -d postgres

\d charging_points
```

Expected columns:
- `id` (UUID, primary key)
- `ndw_id` (VARCHAR, unique)
- `name`, `address`
- `latitude`, `longitude`, `location` (geography point)
- `charger_power_kw`, `connector_types`, `num_connectors`
- `price_per_kwh`
- `availability_total`, `availability_available`
- `last_updated`, `created_at`, `updated_at`

---

## Phase 2: NDW Import Service Setup

### 2.1 Install Dependencies

```bash
cd backend
pip install -e .
```

This installs:
- `httpx>=0.25.0` — HTTP client for NDW API
- `psycopg2-binary>=2.9.0` — PostgreSQL driver

### 2.2 Configure Database URL

Create `.env` in the `backend/` directory:

```env
DATABASE_URL=postgresql://postgres:<password>@<supabase_host>:5432/postgres
```

Get credentials from:
1. Supabase Console → Settings → Database
2. Copy connection string (PostgreSQL)

### 2.3 Test Import Service

```bash
cd backend

# Run import (one-time)
python -m app.services.ndw_import
```

**Expected output:**
```
INFO:__main__:Starting NDW import...
INFO:__main__:Fetching NDW data...
INFO:__main__:Fetched 8392 chargers from NDW
INFO:__main__:Filtered to 2145 Rotterdam chargers
INFO:__main__:Import complete: 2145 inserted/updated, 0 failed
Import successful: {
    'status': 'success',
    'total_fetched': 8392,
    'rotterdam_count': 2145,
    'inserted': 2145,
    'failed': 0,
    'duration_seconds': 12.34
}
```

---

## Phase 3: Verify Data Quality

### 3.1 Check Row Count

```sql
SELECT COUNT(*) FROM charging_points;
-- Expected: ~2000-2200 chargers in Rotterdam
```

### 3.2 Check Data Completeness

```sql
-- Check price availability
SELECT 
    COUNT(*) as total,
    COUNT(price_per_kwh) as with_price,
    COUNT(price_per_kwh)::FLOAT / COUNT(*) * 100 as price_coverage
FROM charging_points;

-- Expected: >80% price coverage
```

### 3.3 Sample Chargers

```sql
SELECT 
    ndw_id,
    name,
    address,
    charger_power_kw,
    price_per_kwh,
    availability_available
FROM charging_points
LIMIT 5;
```

Expected output (example):
```
ndw_id              | name                    | price_per_kwh | availability_available
--------------------|-------------------------|---------------|------------------------
NL-RD-000123        | Rotterdam Centraal      | 0.32          | 6
NL-RD-000456        | Parkings Stavoren      | 0.28          | 2
NL-RD-000789        | Shell Recharge          | 0.35          | 8
```

### 3.4 Test Geographic Queries

```sql
-- Find chargers within 500m radius of Rotterdam Centraal
-- (Coordinates: 51.925, 4.4678)
SELECT 
    name,
    address,
    ST_Distance(
        location,
        ST_Point(4.4678, 51.925, 4326)::geography
    ) as distance_meters
FROM charging_points
WHERE ST_DWithin(
    location,
    ST_Point(4.4678, 51.925, 4326)::geography,
    500  -- 500 meters
)
ORDER BY distance_meters
LIMIT 10;
```

**Expected:** 5-15 chargers within 500m of centraal station

---

## Phase 4: Implement Scheduled Import

### 4.1 Create Cron Job (for recurring updates)

The NDW data updates every 5 minutes. For MVP, import every 10 minutes.

**Option A: Using APScheduler (in FastAPI)**

```python
# In app/main.py
from apscheduler.schedulers.background import BackgroundScheduler
from app.services.ndw_import import NDWImportService

scheduler = BackgroundScheduler()

def import_ndw_data():
    """Run NDW import every 10 minutes"""
    service = NDWImportService()
    result = service.run_import()
    logger.info(f"Scheduled NDW import: {result}")
    service.close()

@app.on_event("startup")
async def startup_event():
    """Start scheduler on app startup"""
    scheduler.add_job(
        import_ndw_data,
        "interval",
        minutes=10,
        id="ndw_import"
    )
    scheduler.start()
    logger.info("NDW import scheduler started")

@app.on_event("shutdown")
async def shutdown_event():
    """Stop scheduler on app shutdown"""
    if scheduler.running:
        scheduler.shutdown()
    logger.info("NDW import scheduler stopped")
```

**Option B: Using Supabase Edge Functions (Recommended)**

Deploy as Supabase cron function for independent scheduling without app dependency.

### 4.2 Test Scheduled Import

Monitor import logs:
```bash
# View recent imports
SELECT 
    COUNT(*),
    MAX(updated_at) as last_update
FROM charging_points;

-- Check again 10 minutes later
-- Count should be same (updates) and last_update should be recent
```

---

## Phase 5: Acceptance Criteria

Week 1 is complete when:

- ✅ PostGIS extension enabled in Supabase
- ✅ `charging_points` table created with proper indexes
- ✅ ~2000 Rotterdam chargers loaded
- ✅ >80% chargers have pricing data
- ✅ Geographic radius query returns chargers correctly
- ✅ NDW import script runs without errors
- ✅ Scheduled import configured (every 10 minutes)
- ✅ All tests passing: `pytest tests/test_ndw_import.py`

---

## Troubleshooting

### Issue: "psycopg2.OperationalError: could not connect to server"

**Fix:**
- Verify DATABASE_URL is correct
- Check Supabase credentials
- Ensure IP is whitelisted (Supabase → Settings → Network)

### Issue: "ST_Point: unknown function"

**Fix:**
- PostGIS not enabled. Re-run migration with `CREATE EXTENSION postgis`
- Verify: `SELECT postgis_version();`

### Issue: Import fetches 0 chargers

**Fix:**
- NDW API may be down (rare)
- Check Rotterdam bounding box (ROTTERDAM_BBOX in ndw_import.py)
- Verify: `curl https://opendata.ndw.nu/api/v2/chargepoint/chargepoint/features`

### Issue: "401 Unauthorized" from NDW

**Fix:**
- NDW API doesn't require auth
- Check network connectivity
- Try with different user-agent

---

## Next Steps (Week 2)

Once Week 1 is complete:

1. Build backend APIs:
   - `POST /api/v1/charging/search` — Main search endpoint
   - `GET /api/v1/charging/{id}` — Charger details
   - `GET /api/v1/geocode/search` — Address autocomplete

2. Implement business logic:
   - Cost calculation
   - Charging time estimation
   - Results ranking
   - Distance calculation (OSRM integration)

---

## Resources

- **NDW Open Data:** https://opendata.ndw.nu/
- **PostGIS Documentation:** https://postgis.net/docs/
- **Supabase PostGIS Guide:** https://supabase.com/docs/guides/database/extensions/postgis
- **psycopg2 Documentation:** https://www.psycopg.org/
