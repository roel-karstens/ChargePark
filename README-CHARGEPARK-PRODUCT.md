# ChargePark: Smart EV Charging Decision Support

## What Is ChargePark?

**ChargePark helps EV drivers make smart charging decisions at their destination.**

Instead of asking "where are charging stations?", ChargePark answers: "I'm at Rotterdam Centraal with 35% battery. What's my cheapest charging option? How long? How far to walk?"

---

## Problem

EV drivers making a destination-based charging decision face fragmentation:

- Charging apps show maps of all chargers (overwhelming)
- Prices vary 2-4x (€0.20/kWh to €0.80/kWh)
- No single app optimizes price + charging time + walking distance
- Most apps ignore the parking component (where do I leave the car?)

**Result:** Decision friction. Users don't optimize. They charge at the first available option.

---

## Solution

**ChargePark: destination-first charging optimization**

1. User searches destination (e.g., "Rotterdam Centraal")
2. App finds nearby chargers with live pricing
3. Shows ranked options: cheapest, fastest, closest
4. User taps to navigate

**Time to decision:** <30 seconds

---

## Market Opportunity

**Netherlands First**
- High EV adoption (~20% of new cars)
- Mature public charging (4,000+ public chargers)
- Open government data (NDW, municipalities)
- Initial market: Rotterdam (test + validation)
- Expansion: Amsterdam, Utrecht, nationwide

**Competitive Landscape**
- No existing app combines destination + parking + charging pricing
- Charging apps (Allego, Plugsurfing) are charger maps
- Parking apps don't show charging
- **Genuine market gap**

---

## MVP Scope

### In Scope (What We Build)

✅ Destination search (address autocomplete + map)  
✅ Battery level input (slider 0-100%)  
✅ Nearby charging finder (real-time NDW data)  
✅ Cost calculation (€/kWh × battery %)  
✅ Charging time estimation  
✅ Walking distance calculation  
✅ Ranked recommendations  
✅ Mobile-first responsive UI  
✅ Error handling & edge cases  

**Geographic:** Rotterdam MVP

**Technology:** React + FastAPI + PostgreSQL (extending AI Starter)

### Explicitly Out of MVP Scope

❌ Parking integration (data not available in NDW yet)  
❌ User accounts / login  
❌ Charger reservations  
❌ In-app payment  
❌ Multi-city (validated post-MVP)  

---

## Product Principles

### 1. Destination-First

The user specifies WHERE they're going, not WHERE charging is.

App context: "You're at Rotterdam Centraal. Here are your options."

NOT: "Here are all chargers near you."

### 2. Transparent About Uncertainty

No fabricated data.

- Unknown prices: Show "Unknown"
- Stale data: Show "Cached from 30 min ago"
- Availability uncertain: Show "Availability may be outdated"

### 3. Mobile-First Interaction

User is traveling. App must work one-handed, fast.

- Minimal typing (search, slider only)
- Tap targets ≥48px
- Load time <2s
- Decisions in <30s

### 4. Cost Optimization First

User priority from research.

- Rank by price (cheapest first)
- Show alternatives (fastest, closest)
- Simple, explainable scoring

---

## Architecture

```
Frontend (React + TypeScript)
    ↓
FastAPI Backend (Python)
    ├─ Geocoding service (Nominatim)
    ├─ Charging search (PostGIS queries)
    ├─ Cost calculation
    ├─ Distance calculation (OSRM)
    └─ NDW data import (cron job)
    ↓
PostgreSQL + PostGIS
    └─ Charging point locations + tariffs
```

**Extends existing AI Starter** — reuses auth infrastructure, project structure, verification philosophy.

---

## Data Sources

### Charging Data: NDW (Dutch Government)

- **Source:** opendata.ndw.nu
- **Format:** GeoJSON + OCPI JSON
- **Update:** Every 3-5 minutes
- **Coverage:** All public chargers in Netherlands
- **License:** CC0 (public domain)
- **Cost:** Free

### Geocoding: Nominatim (OpenStreetMap)

- **Source:** OpenStreetMap + Nominatim
- **Format:** REST API
- **Cost:** Free

### Distances: OSRM (Open Source Routing Machine)

- **Source:** openstreetmap.org
- **Format:** REST API
- **Cost:** Free

**Total data cost: €0** (all public, open-source)

---

## User Interface

### Home Screen

```
ChargePark

Where to charge?
[Search: Rotterdam Centraal]
        ↓
[Select on Map]
```

### Results Screen

```
Rotterdam Centraal          [<]

Battery: 50% [●████░░░░░░]

[Map] [List]

RECOMMENDED - CHEAPEST
Q-Park Blaaktuin
€2.10 | 45 min | 280m
[Details >]

Allego Parkeergarage
€2.40 | 40 min | 150m
[Details >]

Shell Recharge
€4.50 | 8 min | 420m
[Details >]
```

### Detail Screen

```
Q-Park Blaaktuin
Blaaktuin 12, Rotterdam

€0.42/kWh
50% battery → €12.60 total
≈45 min @ 11kW

280m walk (≈3.5 min)

2 out of 8 available
Updated: 2 min ago

[Navigate] [Back]
```

**Design:** Clean, fast, mobile-optimized. See [design-brief.md](docs/design/design-brief.md).

---

## Implementation Timeline

| Week | Phase | Deliverable |
|------|-------|-------------|
| 1 | Data | NDW data in database, geographic queries working |
| 2 | Backend | APIs working, cost/distance calculations tested |
| 3 | Frontend | React UI complete, mobile responsive |
| 4 | Integration | End-to-end verified, data quality checked |

**Launch:** 4 weeks from start

---

## Verification Philosophy

**"It compiles" is NOT evidence that it works.**

Every feature verified on the running system:

1. ✅ Code compiles + lints + type-checks
2. ✅ Unit tests pass
3. ✅ Integration tests pass
4. ✅ **Real app running, real data**
   - Search Rotterdam Centraal → see real chargers
   - Prices match NDW data
   - Distances verified by map
   - Mobile UI tested
   - No console errors

See [verification-strategy.md](docs/implementation/verification-strategy.md).

---

## Product Documentation

All product decisions documented:

| Document | Purpose |
|----------|---------|
| [product-brief.md](docs/product/product-brief.md) | Vision, problem, user value |
| [user-personas.md](docs/product/user-personas.md) | Who we're building for |
| [user-flows.md](docs/product/user-flows.md) | How users interact |
| [mvp-scope.md](docs/product/mvp-scope.md) | What's in/out |
| [requirements.md](docs/product/requirements.md) | Detailed functional specs |
| [domain-model.md](docs/product/domain-model.md) | Data entities and relationships |
| [data-sources.md](docs/data/data-sources.md) | Where data comes from |
| [design-brief.md](docs/design/design-brief.md) | UX/visual direction |
| [implementation-plan.md](docs/implementation/implementation-plan.md) | How to build it |
| [verification-strategy.md](docs/implementation/verification-strategy.md) | How to verify it works |

---

## Key Decisions

| Decision | Why |
|----------|-----|
| **Destination-first** | Differentiates from generic charger maps |
| **Cost optimization** | User's stated priority |
| **Rotterdam MVP** | Manageable scope, good data, easy validation |
| **No parking MVP** | Parking data not in NDW; can add v2 |
| **Simple battery slider** | Minimal user input, fast decisions |
| **Mobile-first** | User is traveling |
| **Transparent unknowns** | Show "Unknown" > fabricate data |
| **NDW open data** | Free, official, real-time, public domain |
| **Extend AI Starter** | Reuse proven architecture, patterns, tooling |

---

## Success Metrics

### MVP Launch Success

- ✅ User can find charging in <30s
- ✅ Prices match NDW data (100% accuracy)
- ✅ Distances accurate (±10% of actual)
- ✅ Mobile load time <2s
- ✅ No critical bugs
- ✅ Users report high confidence

### Post-Launch (v2)

- Data freshness: 95%+ chargers updated <10 min
- User satisfaction: NPS >50
- Geographic expansion: Expand to 2-3 cities
- Feature requests: User voting drives roadmap

---

## Future Directions (After MVP)

### v1.1 (Stabilization)
- Performance optimization
- Bug fixes from user feedback
- Data quality improvements

### v2 (Expansion)
- Parking garage integration
- User accounts + favorites
- Session/connection fees
- Vehicle-specific charging curves
- Amsterdam + Utrecht support
- Price trends

### v3+ (Long-term)
- Nationwide Netherlands
- International expansion (EU)
- Fleet management features
- Smart charging (minimize cost over time)
- Integration with navigation apps

---

## Technology Stack

**Frontend**
- React 18 + TypeScript
- Vite (build)
- TailwindCSS (styling)
- Leaflet (maps)
- React Query (data fetching)
- Vitest (testing)

**Backend**
- FastAPI (web framework)
- Python 3.12+ (language)
- Pydantic (validation)
- PostgreSQL 15+ (database)
- PostGIS (geographic queries)

**External APIs**
- Nominatim (geocoding)
- OSRM (walking distance)
- NDW Open Data (charging data)

**Deployment**
- Frontend: Vercel
- Backend: Vercel / Supabase Functions
- Database: Supabase PostgreSQL

**All open-source / free (except Vercel hosting)**

---

## How to Use This Repository

### For Implementers

1. Read [product-brief.md](docs/product/product-brief.md) — understand the vision
2. Read [requirements.md](docs/product/requirements.md) — what to build
3. Read [implementation-plan.md](docs/implementation/implementation-plan.md) — how to build
4. Follow phases: data → backend → frontend → integration
5. Use [verification-strategy.md](docs/implementation/verification-strategy.md) to verify

### For Reviewers

1. Check [mvp-scope.md](docs/product/mvp-scope.md) — is this in scope?
2. Review against [requirements.md](docs/product/requirements.md) — does it meet specs?
3. Use [verification-strategy.md](docs/implementation/verification-strategy.md) — is it verified?

### For Product Decisions

1. See [domain-model.md](docs/product/domain-model.md) — what are the entities?
2. Check [data-sources.md](docs/data/data-sources.md) — what data is available?
3. Review [design-brief.md](docs/design/design-brief.md) — visual/UX direction

---

## Support & Questions

- **Product questions:** See [product-brief.md](docs/product/product-brief.md)
- **Data questions:** See [data-sources.md](docs/data/data-sources.md)
- **Implementation questions:** See [implementation-plan.md](docs/implementation/implementation-plan.md)
- **Architecture questions:** See domain model + implementation plan
- **Design questions:** See [design-brief.md](docs/design/design-brief.md)

---

## Status

**Phase:** Product Definition Complete ✅  
**Next:** Implementation (Week 1-4)  
**Target Launch:** 4 weeks from implementation start

**Sign-Off:** Awaiting approval to proceed with implementation
