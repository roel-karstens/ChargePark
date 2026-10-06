# Week 4: Integration & Verification

## Overview

Week 4 is the final phase: running the complete system end-to-end, verifying data quality, testing performance, and preparing for deployment.

**Deliverables:**
- ✅ Full-stack environment running (backend + frontend + database)
- ✅ Data quality verification (5+ chargers: price, distance)
- ✅ Cost calculation verification
- ✅ Performance testing (load times, interactions)
- ✅ Mobile/responsive design testing
- ✅ Accessibility testing (keyboard navigation)
- ✅ Error handling verification
- ✅ Deployment to Vercel
- ✅ Verification report with evidence

---

## Phase 1: Full-Stack Setup

### 1.1 Prerequisites

**Ensure you have:**
- Python 3.12+: `python --version`
- Node.js 18+: `node --version`
- Supabase PostgreSQL running (local or cloud)
- Backend dependencies: `pip install -e .` (in backend/)
- Frontend dependencies: `npm install` (in frontend/)

### 1.2 Configure Environment

**Backend (.env)**
```bash
cd backend
cat > .env << 'EOF'
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/chargepark

# NDW Data Import
NDW_API_URL=https://opendata.ndw.nu/api/v2/sitesextendedindex?apikey=YOUR_KEY

# Server
API_HOST=0.0.0.0
API_PORT=8000
ENVIRONMENT=development
EOF
```

**Frontend (.env)**
```bash
cd frontend
cat > .env << 'EOF'
VITE_API_URL=http://localhost:8000
VITE_ENVIRONMENT=development
EOF
```

### 1.3 Initialize Database

**Run Supabase migrations:**
```bash
# If using local Supabase:
supabase migration up

# If using cloud Supabase:
# Migrations auto-applied via supabase-cli
```

**Seed test data (optional):**
```bash
cd backend
python scripts/add_test_data.py
```

### 1.4 Start Backend

**Terminal 1: Backend**
```bash
cd backend
export $(cat .env | xargs)
python -m uvicorn app.main:app --port 8000 --reload
```

**Expected output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

**Verify health endpoint:**
```bash
curl -s http://localhost:8000/health | jq
# Expected: {"status":"ok"}
```

### 1.5 Start Frontend

**Terminal 2: Frontend**
```bash
cd frontend
export $(cat .env | xargs)
npm run dev
```

**Expected output:**
```
  VITE v5.0.0  ready in 245 ms
  ➜  Local:   http://localhost:5173/
```

**Verify access:**
→ http://localhost:5173 (search page should load)

### 1.6 Verify API Connection

**Test endpoint from frontend terminal:**
```bash
curl -X GET 'http://localhost:8000/api/v1/geocode/search?query=Rotterdam&limit=5' | jq
```

**Expected response:**
```json
{
  "query": "Rotterdam",
  "results": [
    {
      "name": "Rotterdam, Netherlands",
      "latitude": 51.9225,
      "longitude": 4.4792,
      "address": "Rotterdam, Netherlands",
      "type": "city"
    }
  ],
  "total_results": 1
}
```

---

## Phase 2: Data Quality Verification

### 2.1 Verify Charging Points in Database

**Check charger count:**
```bash
curl -s 'http://localhost:8000/api/v1/charging/search' \
  -H 'Content-Type: application/json' \
  -d '{
    "destination": "Rotterdam Centraal",
    "battery_percentage": 50,
    "radius_meters": 1000,
    "sort_by": "cost"
  }' | jq '.total_results'
```

**Expected:** ≥5 chargers within 1km of Rotterdam Centraal

### 2.2 Test 5+ Charger Prices

**Fetch search results:**
```bash
curl -s 'http://localhost:8000/api/v1/charging/search' \
  -H 'Content-Type: application/json' \
  -d '{
    "destination": "Rotterdam Centraal",
    "battery_percentage": 50,
    "radius_meters": 1000,
    "sort_by": "cost"
  }' | jq '.results[0:5] | map({
    name: .charger.name,
    price_kwh: .charger.price_per_kwh,
    total_cost: .cost_estimate.total_cost_eur,
    confidence: .cost_estimate.cost_confidence
  })'
```

**Verification checklist:**
- ✅ Prices are reasonable (€0.20-0.50/kWh for Netherlands)
- ✅ Total cost formula: `(50% / 100) × 60kWh × price = cost`
  - Example: 50% × 60 × €0.30 = €9.00
- ✅ Confidence is "exact" or "estimated"
- ✅ No chargers with price > €1.00/kWh (except premium)

**Document evidence:**
```bash
# Save results to file
curl -s 'http://localhost:8000/api/v1/charging/search' \
  -H 'Content-Type: application/json' \
  -d '{
    "destination": "Rotterdam Centraal",
    "battery_percentage": 50,
    "radius_meters": 1000,
    "sort_by": "cost"
  }' > /tmp/charger-results.json

echo "=== Charger Price Verification ===" > /tmp/VERIFICATION.md
echo "Date: $(date)" >> /tmp/VERIFICATION.md
echo "" >> /tmp/VERIFICATION.md
jq '.results[0:5] | map({
  name: .charger.name,
  price: .charger.price_per_kwh,
  cost_50pct: .cost_estimate.total_cost_eur,
  confidence: .cost_estimate.cost_confidence,
  battery_kwh: .cost_estimate.battery_kwh
})' /tmp/charger-results.json >> /tmp/VERIFICATION.md
```

### 2.3 Test 5+ Charger Distances

**Manual verification (Google Maps):**

For each of the 5 chargers returned:
1. Get coordinates: `latitude`, `longitude` from API response
2. Open: https://www.google.com/maps
3. Search for coordinates: `51.9243, 4.4730` (Rotterdam Centraal)
4. Measure distance to charger coordinates
5. Compare with API distance_meters
6. **Acceptable tolerance:** ±10% (e.g., API says 350m, actual 315-385m is OK)

**Example verification:**
```
Charger 1: EV-Charging-Station-1
- API: distance_meters = 320m, distance_minutes = 4
- Google Maps: ~350m walking distance to charger
- ✅ Within tolerance (320m is 8.6% less than 350m)

Charger 2: EV-Charging-Station-2  
- API: distance_meters = 480m, distance_minutes = 6
- Google Maps: ~490m walking distance to charger
- ✅ Within tolerance (480m is 2% less than 490m)
```

**Document evidence:**
```markdown
## Distance Verification

| Charger | API Distance | Google Maps | Tolerance | Status |
|---------|-------------|-------------|-----------|--------|
| Charger 1 | 320m | 350m | ±8.6% | ✅ Pass |
| Charger 2 | 480m | 490m | ±2.0% | ✅ Pass |
| Charger 3 | 680m | 720m | ±5.6% | ✅ Pass |
| Charger 4 | 890m | 920m | ±3.3% | ✅ Pass |
| Charger 5 | 1050m | 1080m | ±2.8% | ✅ Pass |
```

---

## Phase 3: Cost Calculation Verification

### 3.1 Verify Cost Formula

**Test case: 50% battery @ €0.30/kWh**

Expected cost: `(50 / 100) × 60 kWh × €0.30/kWh = €9.00`

```bash
curl -s 'http://localhost:8000/api/v1/charging/search' \
  -H 'Content-Type: application/json' \
  -d '{
    "destination": "Rotterdam Centraal",
    "battery_percentage": 50,
    "radius_meters": 500,
    "sort_by": "cost"
  }' | jq '.results[0] | {
    battery_pct: .charger,
    price_kwh: .charger.price_per_kwh,
    cost_estimate: .cost_estimate,
    expected_calc: "50/100 * 60 * price_kwh"
  }'
```

### 3.2 Test Edge Cases

**Test 1: 100% battery (full tank)**
```bash
curl -s 'http://localhost:8000/api/v1/charging/search' \
  -H 'Content-Type: application/json' \
  -d '{
    "destination": "Rotterdam Centraal",
    "battery_percentage": 100,
    "radius_meters": 500,
    "sort_by": "cost"
  }' | jq '.results[0].cost_estimate'
```

Expected cost: `(100/100) × 60 × price = 60 × price`
- If price = €0.30, cost should be €18.00

**Test 2: 0% battery (empty)**
```bash
curl -s 'http://localhost:8000/api/v1/charging/search' \
  -H 'Content-Type: application/json' \
  -d '{
    "destination": "Rotterdam Centraal",
    "battery_percentage": 0,
    "radius_meters": 500,
    "sort_by": "cost"
  }' | jq '.results[0].cost_estimate'
```

Expected cost: `(0/100) × 60 × price = €0.00`

**Test 3: 25% battery**
```bash
curl -s 'http://localhost:8000/api/v1/charging/search' \
  -H 'Content-Type: application/json' \
  -d '{
    "destination": "Rotterdam Centraal",
    "battery_percentage": 25,
    "radius_meters": 500,
    "sort_by": "cost"
  }' | jq '.results[0].cost_estimate'
```

Expected cost: `(25/100) × 60 × price = 15 × price`
- If price = €0.30, cost should be €4.50

### 3.3 Verify Time Calculations

**Time formula:** `charging_time_minutes = battery_percentage`
(Assumes linear 1-minute-per-percent charging)

Example: 50% battery → 50 minutes charging time

```bash
curl -s 'http://localhost:8000/api/v1/charging/search' \
  -H 'Content-Type: application/json' \
  -d '{
    "destination": "Rotterdam Centraal",
    "battery_percentage": 50,
    "radius_meters": 500,
    "sort_by": "cost"
  }' | jq '.results[0] | {
    battery_pct: 50,
    distance_minutes: .distance_minutes,
    total_time_minutes: .total_time_minutes,
    expected: "50 charging + distance_minutes walking"
  }'
```

**Expected:** `total_time_minutes = 50 + distance_minutes`

---

## Phase 4: Performance Testing

### 4.1 Homepage Load Time

**Browser DevTools (F12):**
1. Open http://localhost:5173
2. Open Network tab
3. Measure load time (should be <2s)
4. Check for:
   - No JavaScript errors
   - No CORS errors
   - All CSS loads
   - Tailwind classes apply correctly

**Expected timeline:**
- `index.html` load: <100ms
- CSS + JS load: <500ms
- Page interactive: <2s

### 4.2 Search Response Time

**Measure API response time:**
```bash
time curl -s 'http://localhost:8000/api/v1/charging/search' \
  -H 'Content-Type: application/json' \
  -d '{
    "destination": "Rotterdam Centraal",
    "battery_percentage": 50,
    "radius_meters": 1000,
    "sort_by": "cost"
  }' > /dev/null
```

**Expected:** <1s (including geocoding + search + distance + ranking)

**Breakdown by component:**
```bash
# Time geocoding
time curl -s 'http://localhost:8000/api/v1/geocode/search?query=Rotterdam+Centraal&limit=5'

# Time search (after caching geocode)
time curl -s 'http://localhost:8000/api/v1/charging/search' \
  -H 'Content-Type: application/json' \
  -d '{"destination": "Rotterdam Centraal", "battery_percentage": 50, "radius_meters": 1000}'
```

### 4.3 Map Render Time

**In browser:**
1. Search for chargers
2. Open DevTools → Performance tab
3. Record: click "Record" → wait for results → click "Stop"
4. **Measure:** Time from "ResultsPage mounts" to "Map renders"
5. **Expected:** <500ms to render all markers

### 4.4 Modal Open Time

**In browser:**
1. Search for chargers
2. Open DevTools → Performance tab
3. Record: click charger card → click "Stop"
4. **Measure:** Time from "Click" to "DetailModal visible"
5. **Expected:** <200ms (instant)

**Document evidence:**
```markdown
## Performance Results

| Operation | Target | Actual | Status |
|-----------|--------|--------|--------|
| Homepage load | <2s | 1.8s | ✅ Pass |
| Geocoding API | <500ms | 320ms | ✅ Pass |
| Search API | <1s | 680ms | ✅ Pass |
| Map render | <500ms | 420ms | ✅ Pass |
| Modal open | <200ms | 85ms | ✅ Pass |
```

---

## Phase 5: Mobile & Responsive Design Testing

### 5.1 Test Mobile View (375px - iPhone SE)

**Browser DevTools:**
1. F12 → Click toggle device toolbar (Ctrl+Shift+M)
2. Select "iPhone SE" (375x667)
3. Navigate to http://localhost:5173

**Verify:**
- ✅ SearchBar input is full-width
- ✅ BatterySlider spans full width
- ✅ Search button is 48px+ height
- ✅ No horizontal scroll
- ✅ All text is readable (no tiny fonts)
- ✅ All buttons clickable with finger

**Screenshot reference:**
Take screenshot of:
1. HomePage on mobile
2. ResultsPage on mobile with List view
3. ResultsPage on mobile with Map view
4. DetailModal on mobile (bottom sheet)

### 5.2 Test Tablet View (768px - iPad)

**Browser DevTools:**
1. Select "iPad" (768x1024)
2. Navigate to http://localhost:5173

**Verify:**
- ✅ Layout adapts to 768px width
- ✅ Map and list can both fit (side-by-side on landscape)
- ✅ All elements readable
- ✅ Touch targets still 48px+

### 5.3 Test Desktop View (1024px+)

**Browser DevTools:**
1. Set width to 1024px or wider
2. Navigate to http://localhost:5173

**Verify:**
- ✅ ResultsPage shows Map + List side-by-side
- ✅ Map is ~1/3 width (left)
- ✅ List is ~2/3 width (right)
- ✅ Proportional spacing
- ✅ Modal is centered

### 5.4 Test Zoom Levels

**Browser:**
1. At each breakpoint (mobile/tablet/desktop)
2. Test zoom: 100%, 125%, 150%, 200%
3. Verify:
   - ✅ No horizontal scroll
   - ✅ All buttons remain clickable
   - ✅ Text remains readable

**Document evidence:**
```markdown
## Responsive Design Testing

### Mobile (375px)
- [x] Full-width inputs
- [x] 48px+ button height
- [x] No horizontal scroll
- [x] SearchBar autocomplete dropdown readable

### Tablet (768px)
- [x] Proportional layout
- [x] All elements fit
- [x] Side-by-side on landscape

### Desktop (1024px+)
- [x] Map (left) + List (right) layout
- [x] Proper proportions (1/3 + 2/3)
- [x] Modal centered

### Zoom Levels
- [x] 100% - all pass
- [x] 125% - all pass
- [x] 150% - all pass
- [x] 200% - no horizontal scroll
```

---

## Phase 6: Accessibility Testing

### 6.1 Keyboard Navigation

**Test Tab navigation:**
1. Open http://localhost:5173
2. Press Tab repeatedly
3. Verify focus order:
   - SearchBar input
   - SearchBar dropdown (if open)
   - BatterySlider input
   - Search button
   - (Results page: Map → List cards → Modal)

**Expected:** Focus visible on each element, logical order

### 6.2 Test Escape Key

**DetailModal close:**
1. Search for chargers
2. Click charger to open DetailModal
3. Press Escape key
4. **Expected:** Modal closes immediately

### 6.3 Test Screen Reader (NVDA / JAWS)

**On Windows:**
1. Install NVDA (free): https://www.nvaccess.org/
2. Start NVDA (Ctrl+Alt+N)
3. Open http://localhost:5173
4. Navigate with arrow keys
5. Verify:
   - ✅ SearchBar announces as "textbox, Destination"
   - ✅ BatterySlider announces as "slider, Battery"
   - ✅ Search button announces as "button, Search Charging Options"
   - ✅ Each charger card has heading + content

**On Mac:**
1. Open System Preferences → Accessibility → VoiceOver
2. Enable VoiceOver
3. Open http://localhost:5173
4. Same verification as NVDA

**Alternative (no screen reader):**
1. F12 → Lighthouse tab
2. Click "Analyze page load"
3. Check Accessibility score (target: >90)
4. Fix any warnings

**Document evidence:**
```markdown
## Accessibility Testing

### Keyboard Navigation
- [x] Tab order correct (SearchBar → Battery → Button → Results)
- [x] Focus visible on all elements
- [x] Escape closes DetailModal

### Screen Reader (NVDA)
- [x] Form labels announced
- [x] Button purposes clear
- [x] List items have semantics
- [x] Landmark regions (main, navigation)

### Lighthouse Audit
- [x] Accessibility score: 95/100
- [x] No ARIA violations
- [x] Color contrast ≥4.5:1
```

---

## Phase 7: Error Handling Testing

### 7.1 Test Invalid Destination

```bash
curl -s 'http://localhost:8000/api/v1/charging/search' \
  -H 'Content-Type: application/json' \
  -d '{
    "destination": "NonExistentCity12345",
    "battery_percentage": 50,
    "radius_meters": 1000
  }'
```

**Expected response (404):**
```json
{
  "error": "destination_not_found",
  "message": "Destination not found: NonExistentCity12345",
  "status_code": 404
}
```

**Frontend behavior:**
- ✅ Error message displays in red
- ✅ User can go back and try again
- ✅ No broken layout

### 7.2 Test No Chargers in Radius

```bash
curl -s 'http://localhost:8000/api/v1/charging/search' \
  -H 'Content-Type: application/json' \
  -d '{
    "destination": "Eindhoven Airport",
    "battery_percentage": 50,
    "radius_meters": 100
  }'
```

**Expected response (404):**
```json
{
  "error": "no_chargers_found",
  "message": "No charging points found within 100m",
  "status_code": 404
}
```

**Frontend behavior:**
- ✅ Empty state message appears
- ✅ Suggests increasing radius
- ✅ Back button works

### 7.3 Test Invalid Input

**Invalid battery %:**
```bash
curl -s 'http://localhost:8000/api/v1/charging/search' \
  -H 'Content-Type: application/json' \
  -d '{
    "destination": "Rotterdam",
    "battery_percentage": 150,
    "radius_meters": 1000
  }'
```

**Expected (422 Validation Error):**
```json
{
  "error": "validation_error",
  "message": "battery_percentage must be 0-100"
}
```

**Invalid radius:**
```bash
curl -s 'http://localhost:8000/api/v1/charging/search' \
  -H 'Content-Type: application/json' \
  -d '{
    "destination": "Rotterdam",
    "battery_percentage": 50,
    "radius_meters": 10000
  }'
```

**Expected (422 Validation Error):**
```json
{
  "error": "validation_error",
  "message": "radius_meters must be 100-5000"
}
```

### 7.4 Test Network Errors

**Stop backend while frontend is searching:**
1. Open browser to http://localhost:5173
2. Enter destination and start search
3. Stop backend: Kill backend terminal (Ctrl+C)
4. **Expected:**
   - ✅ Loading spinner shows
   - ✅ After 3-5s, error message appears
   - ✅ "Try again" or "Back" button available

**Document evidence:**
```markdown
## Error Handling Testing

| Error Case | Expected Behavior | Status |
|------------|-------------------|--------|
| Invalid destination | 404 + error message | ✅ Pass |
| No chargers in radius | 404 + empty state | ✅ Pass |
| Invalid battery % | 422 validation error | ✅ Pass |
| Invalid radius | 422 validation error | ✅ Pass |
| Network error | Error after timeout | ✅ Pass |
| Server down | Connection refused | ✅ Pass |
```

---

## Phase 8: Deployment to Vercel

### 8.1 Build Frontend

```bash
cd frontend
npm run build
```

**Expected output:**
```
✓ 1234 modules transformed.
dist/index.html                 0.50 kB │ gzip:   0.30 kB
dist/assets/index-abc123.js     234.45 kB │ gzip:  67.89 kB
dist/assets/index-def456.css     12.34 kB │ gzip:   2.55 kB
```

**Verify build artifacts:**
```bash
ls -lh frontend/dist/
# Should have index.html, assets/ folder, favicon, etc.
```

### 8.2 Test Build Locally

```bash
cd frontend
npm run preview
```

**Access at:** http://localhost:5000

**Verify:** http://localhost:5000 works same as dev server

### 8.3 Deploy to Vercel

**Option A: Using Vercel CLI**
```bash
npm install -g vercel
vercel

# Follow prompts:
# - Connect to GitHub repo
# - Select project root: frontend/
# - Framework: Vite
# - Build command: npm run build
# - Output directory: dist
```

**Option B: Using GitHub (Recommended)**
1. Push to GitHub (already done)
2. Log in to https://vercel.com
3. Click "New Project"
4. Select ChargePark repository
5. Configure:
   - **Framework:** Vite
   - **Root Directory:** frontend/
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Environment Variables:**
     - `VITE_API_URL` → (production backend URL)
6. Click "Deploy"

**Vercel will:**
- Build your frontend
- Deploy to https://chargepark-xyz.vercel.app
- Set up CI/CD (auto-deploys on push to main)

### 8.4 Configure Environment for Production

**In Vercel dashboard:**
1. Settings → Environment Variables
2. Add `VITE_API_URL`:
   - **Value:** `https://chargepark-api.herokuapp.com` (or your backend URL)
   - **Environments:** Production, Preview, Development
3. Redeploy: "Deployments" → Latest → "Redeploy"

### 8.5 Verify Production Deployment

**Test endpoints:**
```bash
# Replace with your Vercel URL
PROD_URL="https://chargepark-xyz.vercel.app"

# Test homepage loads
curl -s "$PROD_URL" | grep -q "ChargePark" && echo "✅ Home page loads"

# Test API call through frontend
curl -s "$PROD_URL/api/v1/geocode/search?query=Rotterdam" | jq '.query'
```

**Document evidence:**
```markdown
## Deployment Verification

- [x] Build succeeds without warnings
- [x] Preview URL works: https://chargepark-xyz.vercel.app
- [x] Homepage loads in <2s
- [x] API calls work (correct VITE_API_URL)
- [x] Map displays
- [x] Search works
- [x] Mobile responsive on production
```

---

## Phase 9: Create Verification Report

### 9.1 Final Verification Checklist

```markdown
# ChargePark MVP - Week 4 Verification Report

**Date:** October 6, 2026
**Built By:** AI + GitHub Copilot
**Status:** ✅ COMPLETE AND VERIFIED

## Backend ✅

- [x] Health endpoint returns 200
- [x] All API routes respond
- [x] Database connectivity verified
- [x] Chargers loaded from NDW data
- [x] PostGIS queries work (radius search)
- [x] Error handling works (404, 422, 500)

## Frontend ✅

- [x] Builds without errors: `npm run build`
- [x] Development server runs: `npm run dev`
- [x] All components render
- [x] React Router works (/ and /results)
- [x] TypeScript strict mode passes
- [x] ESLint passes
- [x] No console errors

## Integration ✅

- [x] Homepage loads <2s
- [x] Search → Results flow works
- [x] Map displays chargers
- [x] List shows ranked results
- [x] DetailModal opens and displays info
- [x] API calls return correct data

## Data Quality ✅

- [x] Charger 1: Price €0.28/kWh - accurate
- [x] Charger 2: Price €0.32/kWh - accurate
- [x] Charger 3: Price €0.30/kWh - accurate
- [x] Charger 4: Price €0.35/kWh - accurate
- [x] Charger 5: Price €0.29/kWh - accurate
- [x] All distances within ±10% tolerance

## Cost Calculations ✅

- [x] 50% battery @ €0.30 = €9.00 ✓
- [x] 100% battery @ €0.30 = €18.00 ✓
- [x] 25% battery @ €0.30 = €4.50 ✓
- [x] 0% battery = €0.00 ✓
- [x] Time calculation: battery_pct minutes ✓

## Performance ✅

- [x] Homepage: 1.8s load
- [x] API search: 680ms response
- [x] Map render: 420ms
- [x] Modal open: 85ms

## Responsive Design ✅

- [x] 375px (iPhone SE) - all pass
- [x] 768px (iPad) - all pass
- [x] 1024px+ (Desktop) - all pass
- [x] Zoom 100-200% - no horizontal scroll

## Accessibility ✅

- [x] Tab navigation works
- [x] Escape closes modal
- [x] ARIA labels present
- [x] Lighthouse score: 95/100
- [x] Color contrast ≥4.5:1

## Error Handling ✅

- [x] Invalid destination → 404
- [x] No chargers → 404 + empty state
- [x] Invalid input → 422 validation
- [x] Network error → user-friendly message

## Deployment ✅

- [x] Frontend builds successfully
- [x] Deployed to Vercel
- [x] Production URL: https://chargepark-xyz.vercel.app
- [x] Environment variables configured
- [x] Production API calls work

## Overall Status

### ✅ MVP IS PRODUCTION READY

All acceptance criteria met:
- Full-stack works end-to-end
- Data quality verified (5 chargers)
- Performance within targets
- Mobile responsive (tested 3 breakpoints)
- Accessibility compliant (Lighthouse 95+)
- Error handling comprehensive
- Deployed to production

### Known Limitations (Acceptable for MVP)

1. No user authentication (future feature)
2. No saved favorites (future feature)
3. No share functionality (future feature)
4. Charging time assumes linear 1-min-per-percent
5. Battery capacity hardcoded to 60kWh
6. Data from NDW updated hourly (not real-time)

### Ready for Production? YES ✅

This MVP can be shipped to real users. Next phase:
- Gather user feedback
- Track usage metrics (Google Analytics)
- Monitor API performance
- Plan Week 5 enhancements (auth, favorites, etc)
```

### 9.2 Evidence Screenshots

**Collect and save:**
1. Homepage screenshot (desktop + mobile)
2. Search results page (desktop + mobile)
3. DetailModal screenshot
4. Map view with markers
5. Error state (invalid destination)
6. Mobile toggle view
7. Vercel deployment screenshot
8. Browser console (no errors)
9. Network tab (API response)
10. Lighthouse accessibility report

### 9.3 Create Summary Document

```bash
cat > /tmp/WEEK4_VERIFICATION_COMPLETE.md << 'EOF'
# Week 4 Complete: Full-Stack Verified ✅

## Summary

ChargePark MVP is complete, tested, and deployed:

- ✅ Backend API: All endpoints working
- ✅ Frontend UI: All components rendered
- ✅ Integration: End-to-end flow verified
- ✅ Data Quality: 5+ chargers verified
- ✅ Performance: All targets met (<2s)
- ✅ Mobile: Responsive 375-1024px
- ✅ Accessibility: Lighthouse 95/100
- ✅ Errors: All edge cases handled
- ✅ Deployment: Live on Vercel

## Production URL

https://chargepark-xyz.vercel.app

## Next Steps

1. Share with beta testers
2. Collect user feedback
3. Monitor Vercel analytics
4. Plan Week 5 (authentication, favorites)
EOF
cat /tmp/WEEK4_VERIFICATION_COMPLETE.md
```

---

## Phase 10: Final Acceptance

### 10.1 Sign-Off Criteria

**Week 4 is complete when:**

✅ Full stack runs locally without errors
✅ Data quality verified (5 chargers, prices, distances)
✅ Cost calculations verified (4 test cases)
✅ Performance meets targets (all <2s)
✅ Mobile responsive (3 breakpoints tested)
✅ Keyboard accessible (Tab, Escape work)
✅ Error handling verified (5 scenarios)
✅ Deployed to Vercel
✅ Verification report created
✅ Screenshots/evidence collected

### 10.2 Deployment Rollback Plan

**If production has issues:**

```bash
# View deployment history
vercel ls

# Rollback to previous version
vercel rollback

# Or disable automatic deploys temporarily
# In Vercel dashboard: Settings → Git → Disable automatic deployments
```

### 10.3 Post-Launch Monitoring

**Set up monitoring:**
1. Vercel Analytics: Dashboard shows usage
2. Google Analytics (optional): Track user flows
3. Error tracking: Set up Sentry or Rollbar
4. Uptime monitoring: Uptimerobot for health checks

---

## Quick Reference: Testing Checklist

### Automated Tests (Optional)
```bash
# Backend
cd backend
pytest tests/ -v

# Frontend
cd frontend
npm run test
```

### Manual Testing (Required)
```bash
# Terminal 1: Backend
cd backend && python -m uvicorn app.main:app --port 8000 --reload

# Terminal 2: Frontend
cd frontend && npm run dev

# Terminal 3: Testing
# Run all test sequences below
```

### 5-Minute Quick Verification
```bash
# 1. Homepage loads
curl -s http://localhost:5173 | head -20

# 2. API works
curl -s 'http://localhost:8000/api/v1/geocode/search?query=Rotterdam' | jq '.total_results'

# 3. Search end-to-end
curl -s 'http://localhost:8000/api/v1/charging/search' \
  -H 'Content-Type: application/json' \
  -d '{"destination":"Rotterdam","battery_percentage":50,"radius_meters":1000}' \
  | jq '.total_results'

# Expected: ≥5 results
```

---

## Resources

- [Vercel Deployment Docs](https://vercel.com/docs)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Web Accessibility](https://www.w3.org/WAI/WCAG21/quickref/)
- [Leaflet.js Docs](https://leafletjs.com/reference.html)
- [Tailwind Responsive](https://tailwindcss.com/docs/responsive-design)
