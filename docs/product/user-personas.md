# ChargePark: User Personas

## Primary Persona: Cost-Conscious Destination Visitor

**Name:** Alex (age 35)  
**Status:** EV owner, lives in Netherlands  
**Motivation:** Minimize charging costs when away from home

### Context

- Drives to destinations regularly (shopping, meetings, restaurants, attractions)
- Owns EV with ~60 kWh battery
- Current battery varies (20%-80%)
- Usually stays 1-3 hours at destination
- Price-sensitive but also values convenience

### Goals

1. Find the cheapest charging nearby quickly
2. Understand total cost before deciding
3. Get realistic estimate of charging time
4. Know walking distance to destination

### Pain Points

- Existing charging apps show all chargers, not just "best for my trip"
- Prices vary significantly (€0.20/kWh to €0.80/kWh)
- Unclear how long charging will take
- Time wasted searching through options

### Behaviors

- Uses phone while traveling or at destination
- Wants fast, decisive information
- Doesn't want to create accounts
- Prefers simplicity over features
- Checks price before deciding

### Technology

- Smartphone user (iOS/Android)
- Comfortable with apps
- Expects 2-3 seconds response time
- Prefers minimal typing

### Sample Interaction

> "I'm at Rotterdam Centraal with 35% battery. I want to grab coffee for an hour. Where's the cheapest place to charge? How much will it cost? How far do I need to walk?"

---

## Secondary Persona: Regular Commuter

**Name:** Jordan (age 45)  
**Status:** EV owner, regular commuter  
**Motivation:** Reliable charging at predictable stops

### Context

- Regular route with known charging stops
- Charges during lunch breaks or work trips
- Battery management is planned (not spontaneous)
- Values reliability over price (willing to pay premium for certainty)

### Goals

1. Find reliable charging at known locations
2. Minimize downtime
3. Know exact charging duration

### Behaviors

- May revisit same locations repeatedly
- Values saved/favorited chargers
- Less price-sensitive than primary persona
- Appreciates consistent experience

### Note for MVP

**Not the primary focus for MVP.** If product works for Alex (cost-conscious destination visitor), Jordan's needs are largely addressed. Favorites/history can come in v2.

---

## Tertiary Persona: Tourist/Visitor

**Name:** Sam (age 28)  
**Status:** Rental EV in Netherlands  
**Motivation:** Navigate unfamiliar charging landscape

### Context

- Visiting Netherlands for 1-2 weeks
- Rented EV, unfamiliar with charging
- Often at tourist destinations
- May not speak Dutch fluently

### Goals

1. Find ANY charging quickly
2. Understand payment/card requirements
3. Get clear pricing
4. Navigate to charger

### Pain Points

- Unfamiliar with Dutch charging ecosystem
- May not have local payment card
- Language barriers
- Uncertain about charger compatibility

### Note for MVP

**Out of scope for MVP.** International payment, language support, rental-specific features are v2+ considerations.

---

## Persona Alignment with MVP

The MVP is optimized for **Alex**: cost-conscious, at-destination, wants quick decision support.

| Feature | Alex | Jordan | Sam |
|---------|------|--------|-----|
| Find cheap charging | ✅ Core | ✅ Secondary | ✅ Secondary |
| Quick destination search | ✅ Core | ✅ | ✅ |
| Price display | ✅ Core | ✅ | ✅ |
| Charging time | ✅ Core | ✅ Core | ✅ Secondary |
| Walking distance | ✅ Core | ✅ | ✅ |
| Saved favorites | ⭕ v2 | ✅ v2 | ⭕ v2 |
| International payment | ⭕ v2+ | - | ✅ v2+ |

---

## User Demographics (Hypothesis for Validation)

- **Age:** 25-55 (EV owners, tech-comfortable)
- **Geography:** Netherlands (Rotterdam focus)
- **Income:** Middle to upper-middle (EV owners)
- **Tech:** Smartphone users, app-familiar
- **Frequency:** Occasional to regular (destination-based, not daily)

---

## Decision: Why Primary Persona?

**Why "cost-conscious visitor" not "commuter" or "tourist"?**

1. **Largest addressable market** — Many EV drivers make spontaneous trips
2. **Simplest MVP** — No accounts, no subscription, no saved locations needed
3. **Clearest problem** — Cost optimization is explicit and measurable
4. **Easiest validation** — Can test with Rotterdam locals + visitors

Other personas are secondary priorities for future versions.
