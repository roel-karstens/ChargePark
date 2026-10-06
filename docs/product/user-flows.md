# ChargePark: User Flows

## Primary Flow: Find Charging for Destination

### Happy Path (Quick Decision)

```
1. User opens app
   ↓
2. Search destination
   - Input: "Rotterdam Centraal"
   - Autocomplete results appear
   ↓
3. Select destination from results
   ↓
4. App shows map with current battery (default: 50%)
   ↓
5. User sees 3+ charging options ranked by cost
   - Each option shows:
     • Charger address
     • €/kWh price
     • Estimated charging time (for their battery %)
     • Walking distance
   ↓
6. User taps on cheapest option
   ↓
7. Details view shows:
   - Full address
   - Exact price for their battery %
   - Charger type/power
   - Currently available? (Y/N)
   ↓
8. User taps "Navigate"
   - Opens in Maps app (Google Maps / Apple Maps)
   ↓
9. User drives and charges (done with app)
```

**Time to decision:** ~30 seconds  
**Friction:** Minimal (2-3 taps)

---

## Variant Flows

### Adjust Battery Level

```
User at step 4-5 adjusts battery slider:
   
Current battery 50%
[●████░░░░░░░]
Estimated cost: €2.10
Charging time: 45 min

User slides to 30%:
[●██░░░░░░░]
Estimated cost: €1.20
Charging time: 25 min

Results re-rank by new battery level
```

**Use case:** User checks multiple scenarios before deciding

---

### Compare Two Options

```
User at ranking view (step 5):

Option A (CHEAPEST)          Option B (FASTEST)
€2.10 total                  €4.20 total
45 min                       8 min
280m walk                     420m walk
[View Details]               [View Details]

User taps Details on both to compare
```

**Use case:** Trade-off analysis (cheap vs. fast)

---

### No Pricing Available

```
User searches destination → gets results

Option A
€2.10 ✓
45 min
280m

Option B
Price: Unknown ⚠️
45 min
280m

[View Details]
Message: "Charger pricing not available. 
Please check with charger operator."
```

**Design principle:** Show "Unknown" rather than guessing

---

### Poor Charger Availability

```
User sees option:

Option A (Recommended)
€2.10
Status: Only 1 charger available
Currently occupied by 1 car (you'd be #2)
45 min wait if occupied

[Proceed anyway]  [See alternative]
```

**Design principle:** Transparency about risk

---

## Error Flows

### Destination Not Found

```
User searches: "Xyz Random Place"
Result: "No results found"

Suggestions:
- Check spelling
- Try nearby city
- Select on map instead
[Select on map]
```

---

### No Charging Options Nearby

```
User searches: "Remote farmhouse"
Result: "No charging options within 5km"

Options:
- Expand search radius (10km)
- Choose different destination
[Expand radius]
```

---

## Secondary Flow: Map-Based Selection

Instead of searching by name, user selects destination on map:

```
1. User opens app
   ↓
2. Default shows current location
   ↓
3. User taps "Select Destination on Map"
   ↓
4. Map opens with search/drag interface
   ↓
5. User taps location on map
   ↓
6. App identifies nearest POI/address
   ↓
7. Proceeds to ranking (same as primary flow step 5)
```

**Use case:** User knows location but not name; traveling; exploring

---

## Detail View Flow

From any option, user can drill into details:

```
Quick View (Results List)          Detail View (Full Info)
─────────────────────              ──────────────────────
Option A                           Charger Details
€2.10 ✓                           ───────────────────
45 min                            Name: Q-Park Blaaktuin
280m walk                         Address: Blaaktuin 12
[Details] → [>]                   Rotterdam 3011 TA

                                  Price: €0.42/kWh
                                  Your battery: 50%
                                  Total cost: €2.10
                                  Charging time: 45 min

                                  Charger specs:
                                  - Power: 11 kW
                                  - Type: Type 2
                                  - Available: Yes (1/2)

                                  Walking distance: 280m
                                  (≈ 3.5 min walk)

                                  [Navigate] [Back]
```

---

## Information Architecture

### Page 1: Search/Home
- Search input (address/POI)
- Recent searches (optional, v2)
- Map button (alternative entry)

### Page 2: Results
- Map view (swipeable tab)
- List view (swipeable tab)
- Battery slider
- Sort/filter options (v2)

### Page 3: Detail
- Full charger info
- Address
- Pricing
- Charger specs
- Availability
- Navigate button

### Page 4: Map (Alternative)
- Interactive map
- Tap location
- Pin details inline

---

## Key Decisions

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| **Default battery** | 50% | Neutral estimate, user can adjust |
| **Ranking order** | Cost first, then duration | User priority from interview |
| **Show top N** | 3+ options | Enough for comparison, not overwhelming |
| **No accounts** | MVP requirement | Reduce friction |
| **Navigate out** | Link to Maps, don't embed | Simpler UX, better navigation experience |
| **Missing data** | Show "Unknown", don't guess | Data quality principle |
| **Time format** | "45 min" not "12:47-13:32" | User is thinking duration, not absolute time |

---

## Interaction Principles

1. **Mobile-first, one-handed use**
   - Large tap targets
   - Vertical scrolling
   - Minimal typing

2. **Minimal input required**
   - One search (destination)
   - One slider adjustment (optional)
   - Rest is automatic

3. **Instant feedback**
   - Results load in <2s
   - Slider updates instantly
   - Navigation opens immediately

4. **Transparent about uncertainty**
   - Unknown prices labeled
   - Availability shown
   - Data freshness indicated

5. **Exit to native tools**
   - Navigation hands off to Maps
   - Don't try to embed everything
   - Let Maps do maps

---

## Excluded Flows (MVP)

- User registration / login
- Saved/favorited chargers
- Charger reservations
- In-app payment
- Charger reviews
- Historical trip data
- Price alerts
- Parking duration input
- Multi-destination trip planning
