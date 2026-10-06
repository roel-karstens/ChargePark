# ChargePark: Product Brief

## Problem Statement

EV drivers arriving at a destination face a fragmented decision:

- Where can I charge?
- How much will it cost?
- How long will it take?
- How far do I need to walk?

**Current state:** Generic charging-station maps show locations and prices, but treat charging as an isolated choice. They don't answer: "Where should I leave my car while I'm at THIS destination?"

**Market gap:** No app optimizes parking + charging as a combined decision around a specific destination.

---

## Product Vision

**ChargePark helps EV drivers make the right charging decision for their destination.**

Not "find charging stations." 
Rather: "I'm at Rotterdam Centraal with 35% battery. What's my cheapest charging option? How long? How far to walk?"

---

## User Need

A cost-conscious EV driver **at a destination** needs to find and evaluate nearby charging options quickly, with clear pricing and realistic charging times.

**Context:**
- User is already at their destination
- They need to charge before leaving
- They want to minimize cost and friction
- They want accurate information (price, time, distance)

---

## Core Value Proposition

**Three things users want:**

1. **Cheapest option first** — Show the lowest cost charging nearby
2. **Time & distance** — How long to charge? How far to walk?
3. **Simple interface** — Destination → slider → answer (minimal clicks)

---

## Product Principle

This is a **destination-based decision tool**, not a map exploration tool.

- User specifies WHERE they are
- App shows optimal charging FOR THAT LOCATION
- Ranking balances cost + charging speed + walk distance
- Focus: quick, reliable decision support

**NOT:**
- A generic charging-station map
- A route planner (charging doesn't happen during driving)
- A reservation system
- A fleet management tool

---

## Market Scope: Netherlands First

### Why Netherlands?

- High EV adoption rate
- Mature public charging infrastructure
- Open data available (NDW, municipalities)
- Rotterdam as initial test market
- Small enough for MVP validation
- Potential for geographic expansion later

### Geographic Rollout Strategy

1. **Rotterdam MVP** — Validate product fit, test data quality, verify algorithm
2. **Amsterdam / Utrecht / The Hague** — v2 rollout to major cities
3. **Nationwide** — Full Netherlands coverage (v3+)

**Rationale:** Smaller initial scope → better data quality → faster validation → easier expansion

---

## Competitive Positioning

| Aspect | Allego | Plugsurfing | ChargePark |
|--------|--------|------------|-----------|
| **Focus** | Charger network | B2B roaming | Destination decision |
| **User Entry** | Browse map | Browse map | Specific destination |
| **Ranking** | By location | By price/distance | By cost + time + distance |
| **Parking** | No | No | Planned (v2) |
| **Primary User** | Any EV driver | Fleet/business | Traveler/commuter |
| **Price Display** | Yes | Yes | Yes (transparent) |

**Differentiation:** ChargePark answers "where should I charge for THIS trip?" rather than "where can I charge?"

---

## Success Definition

**MVP is successful if:**

1. User can find cheapest charging in Rotterdam in <30 seconds
2. Prices match NDW data accurately
3. Charging time estimates are realistic
4. Walking distances are accurate
5. Mobile UI is fast (<2s load)
6. Missing data is clearly communicated

---

## Future Directions (Not MVP)

- Parking garage locations + tariffs
- Parking duration cost calculation
- Charger reservation/booking
- User accounts + history
- Session/connection fees
- Charger filters (connector type, power)
- Price trends / historical data
- Multi-city expansion

---

## Decision Log

| Decision | Rationale | Status |
|----------|-----------|--------|
| **Destination-first** | Differentiates from existing maps | ✅ Confirmed |
| **Cost optimization** | User priority | ✅ Confirmed |
| **No parking costs MVP** | Data not available in NDW | ✅ Confirmed |
| **Rotterdam pilot** | Manageable scope, good data | ✅ Confirmed |
| **Mobile-first** | User is traveling | ✅ Confirmed |
| **No accounts needed** | Reduce friction for MVP | ✅ Confirmed |
| **Simple battery slider** | Minimize user input | ✅ Confirmed |

---

## Success Metrics (Future)

- Time to find charging recommendation
- Accuracy of cost estimates
- Accuracy of charging times
- User satisfaction with recommendation
- Mobile conversion rate
- Geographic expansion rate
- Data freshness / reliability

*Baseline measurement comes during verification phase.*
