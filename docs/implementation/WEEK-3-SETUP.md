# Week 3: Frontend UI Development

## Overview

Week 3 implements the React frontend for the ChargePark MVP.

**Deliverables:**
- ✅ TypeScript types for charging domain
- ✅ Custom React hooks (search, geocoding, battery)
- ✅ React components (SearchBar, ChargingCard, ResultsList, MapView, DetailModal, BatterySlider)
- ✅ Pages (HomePage, ResultsPage)
- ✅ React Router integration
- ✅ Tailwind CSS mobile-responsive styling
- ✅ Leaflet map integration

---

## Phase 1: Setup

### 1.1 Install Dependencies

```bash
cd frontend
npm install
```

**Key additions:**
- `react-router-dom@^6.20.0` — Client-side routing
- `leaflet@^1.9.4` — Interactive maps
- `@types/leaflet` — TypeScript types for Leaflet

### 1.2 Configure Environment

```bash
# frontend/.env
VITE_API_URL=http://localhost:8000
```

Get value from backend server (should match `uvicorn --port 8000`).

### 1.3 Start Development Server

```bash
npm run dev
```

**Access at:** http://localhost:5173

---

## Phase 2: Architecture

### Component Hierarchy

```
App (Router)
├─ HomePage (Search page)
│  ├─ SearchBar (autocomplete)
│  ├─ BatterySlider (0-100%)
│  └─ Search button
└─ ResultsPage (Results page)
   ├─ MapView (Leaflet map)
   ├─ ResultsList (ranked list)
   │  └─ ChargingCard (result item)
   └─ DetailModal (charger details)
```

### Custom Hooks

**useChargingSearch()**
- Manages search state (data, loading, error)
- Calls `/api/v1/charging/search`
- Returns search(), reset() functions

**useGeocoding()**
- Manages autocomplete state
- Calls `/api/v1/geocode/search`
- Debounced search (300ms)

**useBattery()**
- Manages battery percentage (0-100%)
- Persists to localStorage
- Returns: battery, setBattery, increment, decrement, reset

### TypeScript Types

All types in `src/types/index.ts`:
- `ChargerDetail` — Full charger information
- `ChargingCostEstimate` — Cost breakdown
- `ChargingResultItem` — Result with cost + distance
- `ChargingSearchResponse` — Search results
- `GeocodeResult` — Address result
- `ChargingSearchRequest` — Search parameters

---

## Phase 3: Components

### SearchBar
- **Purpose:** Destination autocomplete input
- **Features:**
  - Debounced search (300ms)
  - Dropdown results
  - Click to select
  - Loading spinner
  - Error handling
- **Usage:**
  ```tsx
  <SearchBar 
    onSelect={(location) => setLocation(location)}
    disabled={isLoading}
  />
  ```

### BatterySlider
- **Purpose:** Current battery percentage selector
- **Features:**
  - Range slider (0-100%)
  - Color coding (red/yellow/green)
  - Visual battery bar
  - Touch-friendly (48px height)
- **Usage:**
  ```tsx
  <BatterySlider
    value={battery}
    onChange={(pct) => setBattery(pct)}
  />
  ```

### ChargingCard
- **Purpose:** Display single charging result
- **Features:**
  - Ranking badge (#1, #2, etc)
  - Cost, time, distance metrics
  - Charger details (power, connectors)
  - Availability status
  - Confidence badge
- **Usage:**
  ```tsx
  <ChargingCard
    result={result}
    index={0}
    onSelectCharger={(id) => setSelected(id)}
  />
  ```

### ResultsList
- **Purpose:** Display ranked charging results
- **Features:**
  - List of ChargingCard items
  - Loading state
  - Error state
  - Empty state
  - Results summary
- **Usage:**
  ```tsx
  <ResultsList
    response={searchResponse}
    isLoading={loading}
    error={error}
    onSelectCharger={(id) => setSelected(id)}
  />
  ```

### MapView
- **Purpose:** Interactive Leaflet map of charging points
- **Features:**
  - Destination marker (blue)
  - Charger markers (yellow/green)
  - Marker labels (result rank)
  - Click marker to select
  - Auto-fit bounds
  - Mobile-optimized
- **Usage:**
  ```tsx
  <MapView
    response={searchResponse}
    selectedChargerId={selectedId}
    onSelectCharger={(id) => setSelected(id)}
  />
  ```

### DetailModal
- **Purpose:** Full charger information modal
- **Features:**
  - Modal overlay
  - Full charger details
  - Cost breakdown
  - Time breakdown
  - Data freshness timestamp
  - Navigate button (Google Maps)
  - Escape to close
  - Mobile-optimized (bottom sheet on mobile)
- **Usage:**
  ```tsx
  {selected && (
    <DetailModal
      result={selected}
      onClose={() => setSelected(null)}
    />
  )}
  ```

---

## Phase 4: Pages

### HomePage (/
)
- **Purpose:** Main search interface
- **Workflow:**
  1. User enters destination (SearchBar with autocomplete)
  2. User adjusts battery slider
  3. User clicks "Search Charging Options"
  4. Calls `/api/v1/charging/search`
  5. Navigates to /results with search response
- **States:**
  - Idle (awaiting destination selection)
  - Loading (searching)
  - Error (display error message)
- **Mobile Layout:**
  - Full-width search form
  - Battery slider
  - Search button (48px+ height)

### ResultsPage (/results)
- **Purpose:** Display and navigate search results
- **Features:**
  - Desktop: Map (left) + List (right)
  - Mobile: Toggle list/map view
  - Click charger to open DetailModal
  - Back to search button
  - Results summary
- **Mobile Layout:**
  - Toggle buttons (📋 List / 🗺️ Map)
  - Full-width view
  - DetailModal as bottom sheet

---

## Phase 5: Styling & Responsive Design

### Mobile-First Approach

All components built with mobile-first responsive design:
- **Base:** 375px width (mobile)
- **Tablet (sm):** 640px+ width
- **Desktop:** 1024px+ width

### Tailwind Classes Used

**Layout:**
- `flex`, `grid`, `space-*` for spacing
- `max-w-*` for max widths

**Touch Targets:**
- All buttons/inputs ≥ 48px height
- Touch padding (px-4, py-3)

**Colors:**
- Blue: Primary actions
- Green: Positive/success
- Yellow: Warnings/medium priority
- Red: Errors/low battery
- Gray: Secondary text

**Responsive:**
- `sm:` prefix for tablet+
- `hidden sm:block` for desktop-only
- `sm:hidden` for mobile-only

### Example Responsive Button

```tsx
<button className={`
  w-full py-4 px-4 rounded-lg font-semibold text-base
  transition h-14
  ${disabled 
    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
    : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
  }
`}>
  Search
</button>
```

---

## Phase 6: Run and Test

### 1. Ensure Backend is Running

```bash
# In one terminal
cd backend
python -m uvicorn app.main:app --port 8000 --reload
```

### 2. Start Frontend Dev Server

```bash
# In another terminal
cd frontend
npm run dev
```

### 3. Visit http://localhost:5173

You should see the ChargePark search page.

### 4. Test User Flow

1. **Search:** Enter "Rotterdam Centraal"
2. **Select:** Click on first result
3. **Adjust:** Move battery slider to 35%
4. **Search:** Click "Search Charging Options"
5. **View:** Should see results page with map and list
6. **Click:** Click a charger card or map marker
7. **Details:** Modal shows full charger information
8. **Navigate:** Click "Navigate →" button (opens Google Maps)
9. **Back:** Click "New Search" to return to homepage

### 5. Responsive Testing

Use browser DevTools (F12):
- **Mobile view:** Chrome → Toggle device toolbar (iPhone SE 375px)
- **Tablet view:** iPad Air 768px
- **Zoom:** Test at 100%, 150%, 200%

---

## Phase 7: Acceptance Criteria

Week 3 is complete when:

- ✅ Frontend installs without errors: `npm install`
- ✅ Dev server starts: `npm run dev` → http://localhost:5173
- ✅ Type checking passes: `npm run type-check`
- ✅ Linting passes: `npm run lint`
- ✅ HomePage displays:
  - SearchBar with autocomplete
  - BatterySlider
  - Search button
- ✅ Search flow works end-to-end:
  - Enter destination
  - Adjust battery
  - Click search
  - Get results
- ✅ ResultsPage displays:
  - Map with charger markers
  - List of ranked results
  - Results count and timestamp
- ✅ DetailModal shows:
  - Full charger information
  - Cost breakdown
  - Time breakdown
  - Data freshness
  - Navigate button
- ✅ Mobile layout works:
  - 375px width responsive
  - All buttons 48px+ height
  - Touch-friendly spacing
  - Map and list toggle
- ✅ Accessibility:
  - Form labels present
  - ARIA attributes (aria-label, aria-expanded)
  - Keyboard navigation (Escape to close modal)

---

## File Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── SearchBar.tsx
│   │   ├── BatterySlider.tsx
│   │   ├── ChargingCard.tsx
│   │   ├── ResultsList.tsx
│   │   ├── MapView.tsx
│   │   └── DetailModal.tsx
│   ├── pages/
│   │   ├── ChargingHomePage.tsx
│   │   └── ChargingResultsPage.tsx
│   ├── hooks/
│   │   ├── useChargingSearch.ts
│   │   ├── useGeocoding.ts
│   │   └── useBattery.ts
│   ├── types/
│   │   └── index.ts
│   ├── lib/
│   │   ├── api.ts (existing)
│   │   └── supabase.ts (existing)
│   ├── App.tsx (updated with Router)
│   ├── main.tsx (existing)
│   └── index.css (Leaflet import added)
├── package.json (react-router-dom, leaflet added)
└── vite.config.ts
```

---

## API Integration

### Search Endpoint
**POST** `/api/v1/charging/search`

```json
Request:
{
  "destination": "Rotterdam Centraal",
  "battery_percentage": 35,
  "radius_meters": 500,
  "sort_by": "cost"
}

Response:
{
  "destination": "Rotterdam Centraal",
  "latitude": "51.925",
  "longitude": "4.4678",
  "battery_percentage": 35,
  "results": [
    {
      "charger": { /* charger details */ },
      "cost_estimate": { /* cost info */ },
      "distance_meters": 280,
      "distance_minutes": 4,
      "total_time_minutes": 39
    }
  ],
  "total_results": 15,
  "search_timestamp": "2026-10-06T10:30:00Z"
}
```

### Geocoding Endpoint
**GET** `/api/v1/geocode/search?query=...&limit=5`

```json
Response:
{
  "query": "Rotterdam Centraal",
  "results": [
    {
      "name": "Rotterdam Central Station",
      "latitude": "51.925",
      "longitude": "4.4678",
      "address": "Stationsplein 1, 3013 AK Rotterdam",
      "type": "station"
    }
  ],
  "total_results": 1
}
```

---

## Known Limitations

These are acceptable for MVP:

1. **No Local Caching** — Results not cached, fresh search each time
2. **No Favorites** — Can't save charging points (v2 feature)
3. **No Share** — Can't share results via link (v2 feature)
4. **No Notifications** — No price alerts (v2 feature)
5. **Map Mobile** — Leaflet can be slow on mobile (optimize in v2)

All documented in code comments.

---

## Next Steps (Week 4)

Once Week 3 is complete:

1. **Integration Testing**
   - End-to-end user flows
   - Backend API responses
   - Map/list interaction

2. **Data Quality Verification**
   - 5+ chargers price accuracy
   - 5+ chargers distance ±10%
   - Cost calculation verification

3. **Performance Testing**
   - Home page <2s load
   - Results <2s render
   - Map interactions <500ms

4. **Mobile Testing**
   - iOS 14+ (Safari)
   - Android 10+ (Chrome)
   - One-handed use (portrait)
   - Network throttling (3G)

5. **Deployment**
   - Build frontend: `npm run build`
   - Deploy to Vercel
   - Verify production API calls

---

## Resources

- **React Router:** https://reactrouter.com/
- **Leaflet:** https://leafletjs.com/
- **Tailwind CSS:** https://tailwindcss.com/
- **TypeScript:** https://www.typescriptlang.org/
- **Vite:** https://vitejs.dev/
