# ChargePark: MVP Requirements

## Functional Requirements

### F1: Destination Search
**Requirement:** Users can search for a destination by address or POI name

- **Acceptance Criteria:**
  - [ ] Text input accepts address or place name
  - [ ] Autocomplete provides suggestions (top 5)
  - [ ] User can select suggestion
  - [ ] Selected destination geocoded to lat/lon
  - [ ] Search handles partial addresses
  - [ ] Search handles misspellings (fuzzy match)
  - [ ] Search returns results within 5 seconds

- **Data Source:** OpenStreetMap + Nominatim (geocoding)
- **Error Cases:**
  - "No results found" if invalid address
  - Clear message: "Try different spelling or check address"

---

### F2: Map-Based Destination Selection
**Requirement:** Users can select a destination by tapping on a map

- **Acceptance Criteria:**
  - [ ] Interactive map shows Rotterdam area
  - [ ] User can tap any location on map
  - [ ] App identifies nearest address/POI
  - [ ] Tapped location geocoded to lat/lon
  - [ ] Map zoom level appropriate (city view)
  - [ ] User can drag to pan
  - [ ] User can pinch to zoom

- **Data Source:** OpenStreetMap tiles
- **Error Cases:**
  - Invalid coordinates rejected
  - Clear message if no POI near tapped location

---

### F3: Battery Level Input
**Requirement:** Users can specify current battery level

- **Acceptance Criteria:**
  - [ ] Slider control for 0-100%
  - [ ] Default: 50%
  - [ ] Live update on slider drag
  - [ ] Current value displayed (e.g., "45%")
  - [ ] Results update instantly when changed
  - [ ] Mobile-friendly large tap targets

- **Data Source:** User input (no backend)
- **Constraints:**
  - Battery % does not persist (stateless)

---

### F4: Nearby Charging Search
**Requirement:** Find nearby charging options for a destination

- **Acceptance Criteria:**
  - [ ] Search radius: ~500m around destination (configurable in settings)
  - [ ] Returns all available chargers in radius
  - [ ] Minimum 1 result, maximum 10+ displayed
  - [ ] Search completes in <2s
  - [ ] Results ranked by cost (cheapest first)
  - [ ] Results include at least 3 options
  - [ ] Charger data current (refreshed hourly minimum)

- **Data Source:** NDW OCPI charging locations + tariffs
- **Error Cases:**
  - "No charging options within 5km" if none found
  - Suggest expanding radius
  - Handle API timeouts gracefully

---

### F5: Cost Calculation
**Requirement:** Show accurate charging cost for user's battery level

- **Formula:**
  ```
  Total Cost = (Battery % / 100) × Battery Capacity (kWh) × Price (€/kWh)
  
  Example:
  - User battery: 50%
  - Battery capacity: 60 kWh (typical)
  - Price: €0.42/kWh
  - Cost = (50/100) × 60 × 0.42 = €12.60
  
  But we simplify for MVP:
  - Cost = (Battery % / 100) × 50 × Price (€/kWh)
  - Assumption: typical battery ~60 kWh, so (50/100) ≈ €X/kWh for 50% charge
  ```

- **Acceptance Criteria:**
  - [ ] Calculation accurate to NDW pricing
  - [ ] Price displayed as €X.XX
  - [ ] Price includes VAT
  - [ ] Price updates when battery slider moves
  - [ ] Handles missing pricing ("Unknown")
  - [ ] No session/connection fees in MVP

- **Data Source:** NDW OCPI tariffs
- **Precision:** Rounded to nearest €0.01

---

### F6: Charging Time Estimation
**Requirement:** Estimate how long charging will take

- **Formula (MVP Simple):**
  ```
  Charging Time (minutes) = (Battery % / 100) × 60
  
  Assumptions:
  - 50% charge takes 30 minutes (typical 11 kW charger)
  - Linear scaling for MVP (simplified)
  - Can improve with vehicle-specific curves later
  
  Example:
  - Battery 50% → 30 min
  - Battery 100% → 60 min
  - Battery 25% → 15 min
  ```

- **Acceptance Criteria:**
  - [ ] Time calculation reasonable
  - [ ] Time displayed as "XX min"
  - [ ] Time updates when battery slider moves
  - [ ] Can handle varying charger power (11kW, 22kW, 50kW)
  - [ ] Shows power info (e.g., "45 min @ 11kW")

- **Data Source:** Charger power from NDW OCPI
- **Future:** Will refine with vehicle-specific charging curves

---

### F7: Walking Distance
**Requirement:** Calculate walking distance from charger to destination

- **Acceptance Criteria:**
  - [ ] Distance calculated for pedestrian routing
  - [ ] Displayed as meters or km ("280m", "1.2km")
  - [ ] Includes walking time estimate ("≈3.5 min walk")
  - [ ] Uses actual street network (not straight-line)
  - [ ] Calculation completes <1s

- **Data Source:** OSRM (Open Source Routing Machine)
- **Constraints:**
  - Pedestrian-only routing (no cars)
  - Shortest walking path

---

### F8: Results Ranking
**Requirement:** Rank charging options by user priority

- **Ranking Logic (MVP):**
  1. Primary: Sort by total cost (cheapest first)
  2. Secondary: Group by charger power (faster options visible)
  3. Tertiary: Walking distance (show range)

- **Acceptance Criteria:**
  - [ ] "CHEAPEST" option always first
  - [ ] "FASTEST" alternative shown (if different)
  - [ ] Options show full transparency (cost + time + distance)
  - [ ] Can identify trade-offs easily
  - [ ] Ranking stable (no random ordering)

- **Display:**
  ```
  Option 1 (CHEAPEST)
  €2.10  | 45 min  | 280m
  
  Option 2 (FASTEST)
  €4.50  | 8 min   | 420m
  
  Option 3
  €2.40  | 40 min  | 150m
  ```

---

### F9: Detail View
**Requirement:** Show full information for a charger

- **Information Displayed:**
  - [ ] Charger name/location
  - [ ] Full address
  - [ ] Exact price (€/kWh)
  - [ ] Total cost for user's battery %
  - [ ] Charger power (e.g., "11 kW")
  - [ ] Charger type (e.g., "Type 2")
  - [ ] Number of available connectors
  - [ ] Currently available? (Y/N / X available)
  - [ ] Walking distance + time
  - [ ] "Navigate" button

- **Acceptance Criteria:**
  - [ ] All key information visible without scrolling
  - [ ] Text readable on mobile
  - [ ] Formatting clear and scannable
  - [ ] Up-to-date information (refreshed on open)

- **Data Source:** NDW OCPI + walking calculation
- **Error Cases:**
  - Handle missing fields gracefully
  - Show "Unknown" for unavailable data

---

### F10: Navigation Integration
**Requirement:** Link to native navigation app

- **Acceptance Criteria:**
  - [ ] "Navigate" button opens Google Maps / Apple Maps
  - [ ] Auto-fills charger address
  - [ ] Sets charger location as destination
  - [ ] Uses device's default maps app
  - [ ] Works on iOS and Android

- **Implementation:**
  - Use geo:// URI scheme (iOS)
  - Use geo:// intent (Android)
  - Fallback to browser link if native unavailable

- **No Requirement:**
  - Don't embed turn-by-turn navigation
  - Let native app handle routing

---

### F11: List View
**Requirement:** Display results as scrollable list

- **Acceptance Criteria:**
  - [ ] Shows all results in ranked order
  - [ ] Each result shows: cost, time, distance, address
  - [ ] Tap any result to expand details
  - [ ] Scrollable on mobile (vertical list)
  - [ ] Clear visual distinction between options

---

### F12: Map View
**Requirement:** Display results on interactive map

- **Acceptance Criteria:**
  - [ ] Map shows Rotterdam area
  - [ ] Destination marked clearly
  - [ ] Charger locations shown as pins
  - [ ] Pin color indicates cost (green=cheap, red=expensive)
  - [ ] Tap pin to expand charger details
  - [ ] Tap location to see address/info window
  - [ ] Can zoom and pan

- **Implementation:** Leaflet or Mapbox

---

## Non-Functional Requirements

### NFR1: Performance
- Page load time: <2 seconds
- Search response time: <2 seconds
- Map interaction: <500ms latency
- Battery slider update: Instant (<100ms)

### NFR2: Availability
- Uptime: 99.5% (MVP)
- API response: <200ms p95
- Graceful degradation if NDW data unavailable

### NFR3: Mobile Responsiveness
- Responsive design: iOS 14+, Android 10+
- Touch targets: Minimum 48px × 48px
- Viewport: Mobile-first (320px+)
- One-handed navigation supported

### NFR4: Data Freshness
- Charging locations: Updated hourly minimum
- Charging tariffs: Updated hourly minimum
- Availability: Real-time from NDW (polling every 5 min)
- Data staleness indicated if >1 hour

### NFR5: Accessibility
- WCAG 2.1 AA compliance
- Color not only indicator (cost ranking)
- Readable text (18px minimum)
- Sufficient contrast (4.5:1)

### NFR6: Security
- No secrets in codebase
- HTTPS only
- No unnecessary data collection
- Error messages don't leak internals

### NFR7: Data Quality
- Pricing accuracy: 100% match NDW (verified on sample)
- Distance accuracy: Within 10% of actual (spot check)
- Availability: Reflects real-time status

---

## User Stories (Traceability)

| Story | Requirement | Priority |
|-------|-------------|----------|
| As user, I want to search for a destination | F1, F2 | MUST |
| As user, I want to see charging options | F4 | MUST |
| As user, I want to know the cost | F5 | MUST |
| As user, I want to know charging time | F6 | MUST |
| As user, I want to know walking distance | F7 | MUST |
| As user, I want to see best option first | F8 | MUST |
| As user, I want to navigate to charger | F10 | MUST |
| As user, I want to view results on map | F12 | SHOULD |
| As user, I want to view results as list | F11 | SHOULD |
| As user, I want to adjust battery level | F3 | SHOULD |

---

## Out of Scope Explicitly

- User authentication
- Payment processing
- Charger reservations
- Parking integration
- Reviews/ratings
- Historical data
- Multi-language support
- Offline functionality
