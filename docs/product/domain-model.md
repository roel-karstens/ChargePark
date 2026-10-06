# ChargePark: Domain Model

## Conceptual Model

### Core Entities

```
┌─────────────────────────┐
│   User Request          │
│                         │
│ • Destination (Point)   │
│ • Battery % (0-100)     │
│ • Search radius         │
└────────────┬────────────┘
             │
             ↓
┌─────────────────────────┐
│   Charging Point        │  (from NDW data)
│                         │
│ • Location (coordinates)│
│ • Name + Address        │
│ • Power (kW)            │
│ • Connector type/qty    │
│ • Price (€/kWh)        │
│ • Availability          │
└────────────┬────────────┘
             │
             ↓
┌─────────────────────────┐
│  Recommendation         │
│                         │
│ • Total Cost (€)        │
│ • Charging Time (min)   │
│ • Walking Distance (m)  │
│ • Rank (1, 2, 3...)    │
│ • Reason (explanation)  │
└─────────────────────────┘
```

---

## Detailed Domain Model

### ChargingSearchRequest

**What:** User's search parameters

```python
@dataclass
class ChargingSearchRequest:
    destination: Point
        """Destination coordinates (lat, lon)"""
    
    destination_name: Optional[str]
        """Human-readable name (e.g., 'Rotterdam Centraal')"""
    
    battery_percentage: int
        """Current battery level (0-100)"""
    
    search_radius_meters: int = 500
        """How far to search from destination"""
```

**Validation Rules:**
- `0 <= battery_percentage <= 100`
- `search_radius_meters > 0`
- `destination` must be valid Point (lat: -90 to 90, lon: -180 to 180)

---

### ChargingPoint

**What:** A physical charging station (from NDW data)

```python
@dataclass
class ChargingPoint:
    id: UUID
    ndw_id: str
        """Unique identifier from NDW"""
    
    name: str
        """Charger name (e.g., 'Q-Park Blaaktuin')"""
    
    address: str
        """Full address including postal code"""
    
    location: Point
        """Geographic coordinates (from NDW)"""
    
    charger_power_kw: float
        """Charging power in kW (e.g., 11 kW)"""
    
    connector_types: List[str]
        """Connector types available (e.g., ['Type 2', 'CCS'])"""
    
    num_connectors: int
        """Total number of connectors"""
    
    price_per_kwh: Optional[float]
        """Electricity price €/kWh (from NDW tariffs)"""
    
    availability_total: int
        """Total connectors at location"""
    
    availability_available: int
        """Currently available connectors"""
    
    last_updated: datetime
        """When this data was last refreshed from NDW"""
```

**Business Rules:**
- Cannot change name, address, or location (immutable from NDW)
- Price and availability are mutable (refreshed from NDW)
- Must have at least one connector
- Price is nullable (data not always available)

**Relationships:**
- One-to-many: ChargingPoint → Recommendations

---

### CostCalculation

**What:** How much will charging cost?

```python
@dataclass
class CostCalculation:
    battery_percentage: int
        """User's starting battery level"""
    
    battery_capacity_kwh: float = 60
        """Assumed battery size (typical EV = 60 kWh)"""
    
    price_per_kwh: float
        """Electricity cost from charger"""
    
    @property
    def total_cost_euro(self) -> float:
        """
        Total cost = (battery % / 100) × capacity × price
        
        Example:
        50% battery × 60 kWh × €0.42/kWh = €12.60
        """
        energy_needed = (self.battery_percentage / 100) * self.battery_capacity_kwh
        return energy_needed * self.price_per_kwh
```

**Business Rules:**
- MVP uses fixed 60 kWh battery (typical EV)
- Formula: `(battery_pct / 100) × 60 × price`
- Result rounded to nearest €0.01
- If price unavailable, cost is None

**Future:**
- v2: Support vehicle-specific battery capacities
- v2: Include session fees, overstay fees, etc.

---

### ChargingTimeEstimation

**What:** How long will charging take?

```python
@dataclass
class ChargingTimeEstimation:
    battery_percentage: int
        """Starting battery level (0-100)"""
    
    charger_power_kw: float
        """Charger power (e.g., 11 kW)"""
    
    @property
    def estimated_minutes(self) -> int:
        """
        Simplified estimation for MVP:
        50% charge takes 30 minutes (at 11 kW)
        Linear scaling
        
        Formula: (battery_pct / 100) × 60 minutes
        
        Example:
        50% → 30 min
        100% → 60 min
        25% → 15 min
        """
        return int((self.battery_percentage / 100) * 60)
```

**Business Rules:**
- MVP uses simplified linear model
- Assumes 11 kW charging speed
- Result as integer minutes
- Actual time varies by charger speed

**Limitations:**
- Doesn't account for charging curve (fast → slow as battery fills)
- Doesn't consider charger power limits
- May overestimate for high-power chargers

**Future:**
- v2: Vehicle-specific charging curves
- v2: Consider actual charger power

---

### WalkingDistanceCalculation

**What:** Distance from charger to destination

```python
@dataclass
class WalkingDistanceCalculation:
    charger_location: Point
    destination_location: Point
    
    @property
    def distance_meters(self) -> int:
        """Pedestrian walking distance via OSRM"""
        # Calls OSRM routing engine
        # Returns actual street distance (not straight-line)
    
    @property
    def walking_time_minutes(self) -> int:
        """Estimated walking time at ~1.4 m/s average"""
        return int(self.distance_meters / 1.4 / 60)
```

**Business Rules:**
- Pedestrian routing only (no cars)
- Uses real street network (via OSRM)
- Assumes ~1.4 m/s walking speed (realistic urban pace)
- Result as integer minutes

---

### ChargingRecommendation

**What:** A ranked charging option for the user

```python
@dataclass
class ChargingRecommendation:
    charging_point: ChargingPoint
    
    total_cost: float
        """Calculated cost (€)"""
    
    charging_time_minutes: int
        """Estimated charging time"""
    
    walking_distance_m: int
        """Distance from charger to destination"""
    
    walking_time_minutes: int
        """Walking time (derived from distance)"""
    
    rank: int
        """Position in ranking (1 = best)"""
    
    reason: str
        """Why this option is recommended"""
    
    @property
    def is_cheapest(self) -> bool:
        """True if rank 1 by cost"""
        return self.rank == 1
    
    @property
    def is_fastest(self) -> bool:
        """True if significantly faster than cheapest"""
        # Logic: if this option charges significantly faster
        # and user might prefer speed over cost
        pass
```

**Business Rules:**
- Ranked by cost (cheapest = rank 1)
- Alternative options shown for context
- Reason should be explainable (transparent to user)
- Can have multiple recommendations (not just one)

**Ranking Logic:**
```
1. Sort all options by total_cost (ascending)
2. Rank 1 = cheapest
3. Show top 3-5 options
4. For each, calculate trade-offs (cost vs. time vs. distance)
5. Flag alternatives (e.g., "FASTEST", "SHORTEST WALK")
```

---

### SearchResults

**What:** Complete response to a search request

```python
@dataclass
class SearchResults:
    search_request: ChargingSearchRequest
    
    recommendations: List[ChargingRecommendation]
        """Ranked charging options"""
    
    count: int
        """Total chargers found"""
    
    search_quality_metrics:
        """Metadata about search"""
        - chargers_found: int
        - chargers_with_price: int
        - average_distance_m: float
        - data_freshness_minutes: int
```

**Business Rules:**
- Must return at least 1 recommendation (or empty if none)
- Recommendations should have 3+ options
- Always ranked by cost
- Should include data freshness info

---

## State Machines

### User Search Flow

```
START
  ↓
ENTER_DESTINATION → (user types address)
  ↓
SEARCH_RESULTS → (API returns recommendations)
  ↓
VIEW_DETAILS → (user taps a charger)
  ↓
NAVIGATE → (user leaves to native maps)
  ↓
END
```

**Alternative paths:**
- User adjusts battery slider → results re-rank
- User sees no results → error state (try other destination)
- User experiences API timeout → error state (try again)

---

## Constraints & Invariants

### Must Always Be True

1. **Price Accuracy**
   - If displayed, must match NDW data (within 1 hour)
   - If data >1 hour stale, mark as "cached"
   - Unknown prices explicitly labeled

2. **Ranking Stability**
   - Same request always produces same results
   - Ranking based only on deterministic factors (price, distance)
   - No random shuffling

3. **Data Completeness**
   - Every recommendation must have: charger info, cost, time, distance
   - No recommendations with missing critical fields
   - Missing optional fields handled gracefully

4. **Distance Accuracy**
   - Pedestrian distance only (no vehicle routing)
   - Based on actual street network (OSRM)
   - Not straight-line distance

5. **Cost Calculation**
   - Fixed formula: (battery % / 100) × 60 kWh × price/kWh
   - Consistent across requests
   - Includes VAT (from NDW data)

---

## Relationships & Dependencies

### External Dependencies

```
ChargingPoint
  ← depends on → NDW Open Data (locations + tariffs)
                 updated every 10 minutes

ChargingRecommendation
  ← depends on → WalkingDistanceCalculation (OSRM)
                 called per charger

SearchResults
  ← depends on → ChargingPoint (database query)
                 GeocodingService (Nominatim)
```

### Business Logic Flow

```
User Search Request
    ↓
Geocode destination (Nominatim)
    ↓
Find nearby chargers (PostGIS + database)
    ↓
For each charger:
    ├─ Calculate cost (CostCalculation)
    ├─ Estimate time (ChargingTimeEstimation)
    └─ Calculate distance (WalkingDistanceCalculation → OSRM)
    ↓
Create Recommendation for each charger
    ↓
Rank by cost
    ↓
Return top 3-5 as SearchResults
```

---

## Change Log

### MVP Scope

**Included:**
- ChargingPoint (location, power, price)
- CostCalculation (simple: battery % × price)
- ChargingTimeEstimation (simple linear model)
- WalkingDistanceCalculation (OSRM)
- ChargingRecommendation (ranked by cost)

**Excluded (v2+):**
- Parking integration
- Session/idle fees
- User preferences/personalization
- Charger reservations
- Price trends/history

---

## Domain Glossary

| Term | Definition |
|------|-----------|
| **ChargingPoint** | A physical charging station location from NDW data |
| **Battery %** | User's current charge level (0-100%) |
| **Tariff** | Electricity price per unit (€/kWh) |
| **Connector** | Physical charging plug (Type 2, CCS, etc.) |
| **Availability** | How many connectors currently available |
| **Recommendation** | A ranked charging option for user |
| **Search Radius** | Geographic distance to search (default: 500m) |
| **Walking Distance** | Pedestrian distance from charger to destination |
| **Cost** | Total electricity cost for charging |
| **Charging Time** | Estimated duration to charge from user's current % |

---

## Design Decisions

| Decision | Alternative | Rationale |
|----------|-------------|-----------|
| **Fixed 60 kWh battery** | Vehicle database | Simpler MVP, accurate enough for estimation |
| **Linear charging curve** | Vehicle-specific curves | Sufficient for MVP cost estimation |
| **Cost-first ranking** | Multi-factor weighting | User priority from interview |
| **Transparent unknowns** | Best-guess estimates | Data quality principle |
| **No parking v1** | Include parking | Parking data not in NDW |
| **Pedestrian only** | Vehicle routing | Walking from car to destination |
