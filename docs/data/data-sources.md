# ChargePark: Data Sources & Strategy

## Overview

ChargePark's core value depends on **accurate, real-time charging data**. This document details available sources, quality, and implementation strategy.

---

## Primary Data Source: NDW (National Data Portal Road Traffic)

### Overview

NDW is the Dutch government's centralized mobility data authority. They publish real-time, open-access charging infrastructure data.

**Portal:** https://opendata.ndw.nu/

---

### Dataset 1: Charging Point Locations

**File:** `charging_point_locations.geojson.gz`

| Aspect | Details |
|--------|---------|
| **Format** | GeoJSON (geographic coordinates) |
| **Update Frequency** | Every 3-5 minutes |
| **License** | CC0 (Public Domain) |
| **Access** | Free, anonymous, no API key required |
| **Size** | ~4.4 MB (compressed) |
| **Data Fields** | |
| | - Location (latitude, longitude) |
| | - Charger address |
| | - Charger ID (unique identifier) |
| | - Charger name/operator |
| | - Charger power (kW) |
| | - Connector types (Type 2, CCS, etc.) |
| | - Number of connectors |

**Quality Assessment:**
- ✅ **Completeness:** Covers all public chargers in Netherlands
- ✅ **Accuracy:** Coordinates verified by municipalities
- ✅ **Freshness:** Updated every 3-5 minutes
- ✅ **Reliability:** Government source
- ⚠️ **Coverage:** Public chargers only (no private/home chargers)

**Usage:**
- Primary data source for charger locations
- Enables geographic search
- Provides charger specifications

---

### Dataset 2: Charging Point Tariffs (OCPI Standard)

**File:** `charging_point_tariffs_ocpi.json.gz`

| Aspect | Details |
|--------|---------|
| **Format** | JSON (Open Charge Point Interface standard) |
| **Update Frequency** | Every 3-5 minutes |
| **License** | CC0 (Public Domain) |
| **Access** | Free, anonymous, no API key required |
| **Size** | ~3.7 MB (compressed) |
| **Data Fields** | |
| | - Charger ID (links to locations) |
| | - Price per kWh (€/kWh) |
| | - Price per session (connection fee) |
| | - Price per minute (idle/overstay fee) |
| | - Tariff effective date |
| | - Currency (EUR) |
| | - VAT (included in price) |

**Quality Assessment:**
- ✅ **Completeness:** Price data for most chargers
- ⚠️ **Accuracy:** Depends on operator data submissions (~95% complete)
- ✅ **Freshness:** Updated 3-5 minutes
- ⚠️ **Reliability:** Some operators submit outdated prices
- ❌ **Session fees:** Some operators use complex fee structures (not always captured)

**Usage:**
- Primary source for charging costs
- Enables cost ranking
- Basis for user affordability

**Limitations:**
- Not all operators submit tariff data
- Some prices outdated (operator error)
- Session/idle fees may not be captured
- Promotional pricing not included

---

### Dataset 3: Charging Point Availability (OCPI Real-Time)

**File:** `charging_point_availability_ocpi.json.gz`

| Aspect | Details |
|--------|---------|
| **Format** | JSON (OCPI standard) |
| **Update Frequency** | Real-time (streamed) |
| **License** | CC0 (Public Domain) |
| **Access** | Free, real-time feed |
| **Data Fields** | |
| | - Charger ID |
| | - Total connectors |
| | - Available connectors |
| | - Reserved connectors |
| | - Status (AVAILABLE, UNAVAILABLE, UNKNOWN) |
| | - Last updated timestamp |

**Quality Assessment:**
- ✅ **Freshness:** Real-time
- ⚠️ **Accuracy:** Depends on charger hardware reporting (~80-90% reliable)
- ⚠️ **Coverage:** Not all chargers report availability
- ❌ **Lag:** Some delays in status updates (5-30 seconds typical)

**Usage:**
- Show current availability
- Inform ranking (prefer available chargers)
- Set user expectations

**Limitations:**
- Some chargers always report "UNKNOWN"
- Availability not 100% reliable
- User should verify before driving

---

## Secondary Data Source: Geocoding (Nominatim / OpenStreetMap)

### Purpose
Convert address input → coordinates for searching

### Details

| Aspect | Details |
|--------|---------|
| **Service** | Nominatim (OSM reverse geocoding) |
| **Access** | Free, public API |
| **Rate Limit** | 1 request/second (sufficient for MVP) |
| **Accuracy** | ±50m typically |
| **Coverage** | Worldwide (very complete for Netherlands) |
| **Format** | JSON API |

**Quality Assessment:**
- ✅ **Completeness:** Handles most Dutch addresses
- ✅ **Accuracy:** Good for city-scale (~50m error)
- ✅ **Reliability:** Stable open-source service
- ✅ **Speed:** <500ms typical

**Usage:**
- Search autocomplete
- Address → lat/lon conversion
- Reverse geocoding (coordinates → address)

---

## Tertiary Data Source: Walking Distance (OSRM)

### Purpose
Calculate pedestrian walking distance and time

### Details

| Aspect | Details |
|--------|---------|
| **Service** | OSRM (Open Source Routing Machine) |
| **Access** | Free public server |
| **Format** | JSON API |
| **Routing Type** | Pedestrian (foot) |
| **Calculation** | Actual street network (not straight-line) |
| **Accuracy** | ±5% of actual (verified spot checks) |
| **Speed** | <500ms typical |

**Quality Assessment:**
- ✅ **Accuracy:** Street-network based, realistic
- ✅ **Speed:** Fast calculations
- ✅ **Reliability:** Open-source, well-maintained
- ⚠️ **Coverage:** Depends on OSM road data (good in Netherlands)

**Usage:**
- Calculate pedestrian distance from charger to destination
- Estimate walking time ("≈ 5 min walk")
- Enable distance-based ranking

---

## Vehicle Data: EV Specifications

### Requirement

MVP needs typical EV battery capacity to calculate charging cost and time.

### MVP Approach: Simple Defaults

**Option 1 (SELECTED for MVP):** Use typical EV profile
- Standard battery capacity: 60 kWh
- Standard charger power: 11 kW
- Calculation: Cost = (Battery % / 100) × 60 × Price

**Rationale:**
- Most common battery size in Netherlands
- Sufficient for MVP cost estimation
- Can be refined later with vehicle database

### Future: Vehicle Database

**v2 Enhancement:** Create EV database with specs
- Tesla Model 3: 75 kWh battery, up to 170 kW charging
- Nissan Leaf: 62 kWh battery, up to 100 kW charging
- VW ID.4: 82 kWh battery, up to 125 kW charging
- etc.

**User interaction:**
- Optional: "What's your EV model?" (if different from default)
- Battery capacity auto-filled from database
- More accurate charging time calculation

---

## Data Import & Sync Strategy

### Architecture

```
NDW Open Data Portal
    ↓ (fetch every 10 min)
Backend Import Service
    ↓ (parse + validate)
PostgreSQL (PostGIS)
    ↓ (query)
API endpoints
    ↓
Frontend
```

### Implementation

1. **Periodic Import Service**
   - Runs every 10 minutes
   - Fetches latest `charging_point_locations_ocpi.json`
   - Fetches latest `charging_point_tariffs_ocpi.json`
   - Parses and validates
   - Upserts into database

2. **Real-Time Availability (Optional for MVP)**
   - Either: Periodic polling (every 5 min)
   - Or: Stream from NDW real-time feed
   - Update availability status in database

3. **Database Schema**
   ```sql
   CREATE TABLE charging_points (
     id UUID PRIMARY KEY,
     ndw_id VARCHAR UNIQUE,
     name VARCHAR,
     address VARCHAR,
     location POINT,  -- PostGIS geographic type
     charger_power_kw DECIMAL,
     connector_types VARCHAR[],
     num_connectors INT,
     price_per_kwh DECIMAL(5,2),  -- €/kWh
     availability_total INT,
     availability_available INT,
     last_updated TIMESTAMP,
     data_freshness INTERVAL,
     CONSTRAINT price_check CHECK (price_per_kwh > 0)
   );
   
   CREATE INDEX idx_location ON charging_points USING GIST(location);
   CREATE INDEX idx_ndw_id ON charging_points(ndw_id);
   ```

4. **Geographic Search Query**
   ```sql
   SELECT *
   FROM charging_points
   WHERE ST_DWithin(
     location,
     ST_SetSRID(ST_MakePoint(lon, lat), 4326),
     500  -- 500 meters
   )
   ORDER BY price_per_kwh ASC;
   ```

---

## Data Quality Assurance

### Validation Rules

1. **Completeness**
   - Charger must have: location, address, power, connector
   - Price must be non-null or explicitly marked "Unknown"
   - Discard records failing validation

2. **Accuracy**
   - Spot-check prices weekly against operator websites
   - Spot-check coordinates against map (±100m)
   - Flag operators with consistently wrong data

3. **Freshness**
   - Reject data older than 1 hour
   - Mark data older than 30 min as "cached"
   - Show freshness indicator to user

### User-Facing Data Quality

**Principle:** Transparency > Guessing

- Show "Unknown" for missing prices
- Show "Availability may be outdated" if >5 min old
- Show "Last updated: X min ago"
- Don't fabricate data

### Error Handling

If NDW data unavailable:
- Use cached data (up to 24 hours old)
- Show warning: "Data may be outdated"
- Degrade gracefully (show what's available)
- Don't crash or hide results

---

## Data Privacy & Terms

### Data Use

- NDW data is CC0 (public domain)
- No attribution required but recommended
- Commercial use allowed
- No personal data collection

### User Data

- No user accounts needed (MVP)
- No location tracking
- No search history stored
- Minimal logging (operational only)

---

## Roadmap: Data Expansion (v2+)

### Parking Integration

**Goal:** Add parking costs to total cost calculation

**Challenge:** No centralized parking API

**Solution Options:**
1. Municipal partnerships (Rotterdam, Amsterdam, etc.)
2. Commercial parking data (Q-Park, Parkeertelefoon)
3. Scrape public parking websites
4. User crowdsourcing

**v2 Decision:** TBD (requires market validation)

---

### Charger-Specific Charging Curves

**Goal:** More accurate charging time estimation

**Data Source:**
- Tesla: Published charging curves
- ChargingCards: Vehicle database API
- Manufacturer specs

**Impact:** Improve charging time accuracy from ±20% to ±5%

**v2 Timeline:** Post-MVP validation

---

## Monitoring & Alerts

### Metrics to Track

- Data freshness (% of chargers updated in last 10 min)
- Price accuracy (spot-checks vs. operator websites)
- Distance accuracy (sample verification)
- API availability (NDW, Nominatim, OSRM)
- Search success rate (% finding results)

### Alerts

- NDW data >1 hour stale
- <80% chargers with price data
- >5% GPS error on sample chargers
- API downtime >5 minutes

---

## Decision Log

| Decision | Rationale | Status |
|----------|-----------|--------|
| **NDW as primary source** | Free, official, realtime, public domain | ✅ |
| **No parking MVP** | Data not available in NDW | ✅ |
| **Nominatim for geocoding** | Free, accurate, no rate limits | ✅ |
| **OSRM for walking** | Free, street-network, accurate | ✅ |
| **Simple EV profile MVP** | Sufficient for MVP, database later | ✅ |
| **Periodic import (10 min)** | Balances freshness vs. load | ✅ |
| **Show "Unknown" > guess** | Data quality principle | ✅ |
