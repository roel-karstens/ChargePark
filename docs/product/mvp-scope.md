# ChargePark: MVP Scope Definition

## In Scope (Must Have)

### Core Functionality
- ✅ Destination search (address autocomplete)
- ✅ Interactive map for destination selection
- ✅ Battery % adjustment (slider 1-100%)
- ✅ Charging location search (nearby chargers)
- ✅ Cost calculation (€/kWh × battery %)
- ✅ Charging time estimation
- ✅ Walking distance calculation
- ✅ Ranked results (cost + time + distance)
- ✅ Detail view per charger
- ✅ Navigate link (to Google Maps)

### Data
- ✅ Real-time charging locations (NDW OCPI)
- ✅ Real-time charger tariffs (NDW OCPI)
- ✅ Charger availability status
- ✅ Walking distance (OSRM)
- ✅ Geocoding (address → coordinates)

### UX
- ✅ Mobile-responsive design
- ✅ Map + list view toggle
- ✅ Loading states
- ✅ Error states (no results, API down, etc.)
- ✅ Empty state (initial screen)
- ✅ Missing data communication ("Unknown" for unavailable prices)

### Quality
- ✅ <2s page load time
- ✅ <30s user flow (search → recommendation)
- ✅ Mobile-first responsive
- ✅ Price accuracy verification
- ✅ Charging time realism verification

### Geographic Scope
- ✅ Rotterdam metropolitan area
- ✅ NDW data availability

---

## Explicitly Out of Scope (v2+)

### Parking Integration
- ❌ Parking garage locations
- ❌ Parking tariffs
- ❌ Parking duration-based cost calculation
- ❌ Parking availability

**Reason:** Parking tariff data not available in NDW. Requires municipal API integration (future scope).

### User Management
- ❌ User registration
- ❌ User login
- ❌ User profiles
- ❌ User accounts
- ❌ Password reset

**Reason:** Not needed for MVP. No personalization or history required yet.

### Advanced Features
- ❌ Charger reservations / booking
- ❌ In-app payment
- ❌ Charger reviews / ratings
- ❌ Favorites / saved chargers
- ❌ Trip history
- ❌ Multiple destination planning
- ❌ Price trends / historical data
- ❌ Charger filters (connector type, power)
- ❌ Session/connection fees
- ❌ EV model database (pre-configured profiles)

**Reason:** Increases complexity without solving core problem for MVP.

### Expansion
- ❌ Other Dutch cities
- ❌ International markets
- ❌ Parking integration

**Reason:** Validate Rotterdam MVP first.

### Administrative
- ❌ Admin dashboard
- ❌ Charger operator tools
- ❌ Analytics/reporting
- ❌ Content management

**Reason:** Future business features.

---

## MVP vs. Future Versions

| Feature | MVP | v1.1 | v2 | v3 |
|---------|-----|------|----|----|
| **Core** | | | | |
| Destination search | ✅ | ✅ | ✅ | ✅ |
| Battery slider | ✅ | ✅ | ✅ | ✅ |
| Charging finder | ✅ | ✅ | ✅ | ✅ |
| Cost calculation | ✅ | ✅ | ✅ | ✅ |
| | | | | |
| **Enhancement** | | | | |
| Charger availability | ✅ | ✅ | ✅ | ✅ |
| Parking integration | - | - | ✅ | ✅ |
| User accounts | - | - | ✅ | ✅ |
| Favorites | - | - | ✅ | ✅ |
| Charger filters | - | - | ✅ | ✅ |
| | | | | |
| **Geographic** | | | | |
| Rotterdam | ✅ | ✅ | ✅ | ✅ |
| Amsterdam | - | ⭕ | ✅ | ✅ |
| Full Netherlands | - | - | ⭕ | ✅ |
| International | - | - | - | ⭕ |

---

## Success Criteria for MVP Release

The MVP is ready to launch when:

1. **Functionality**
   - [ ] All "In Scope" features implemented and tested
   - [ ] All critical user flows work end-to-end
   - [ ] No data loss in normal operation

2. **Data Quality**
   - [ ] Charging prices match NDW data (100% accuracy check on sample)
   - [ ] Charging times realistic (validation against known chargers)
   - [ ] Walking distances reasonable (spot checks in Rotterdam)
   - [ ] Charger availability reflects reality

3. **Performance**
   - [ ] Home page loads in <2s
   - [ ] Search results display in <2s
   - [ ] Mobile responsiveness verified (iOS/Android)
   - [ ] No console errors

4. **Security & Privacy**
   - [ ] No secrets in code
   - [ ] HTTPS enabled
   - [ ] No unnecessary data collection
   - [ ] Error messages don't leak internal details

5. **Testing**
   - [ ] Happy path verified (end-to-end in real app)
   - [ ] Error cases handled gracefully
   - [ ] Edge cases identified and documented
   - [ ] Mobile-specific issues resolved

6. **Deployment**
   - [ ] CI/CD pipeline working
   - [ ] Staging environment mirrors production
   - [ ] Rollback plan defined
   - [ ] Monitoring/alerts in place

---

## Decision Rationale

**Why Rotterdam?**
- Manageable geographic scope for validation
- NDW data complete and reliable
- Good EV infrastructure
- Feasible to verify pricing/distances manually
- Can expand to other cities after validation

**Why no user accounts?**
- MVP solves single-use-case problem
- No need for history/personalization initially
- Reduce onboarding friction
- Add in v2 if usage patterns warrant

**Why no parking?**
- Parking tariff data not available in NDW
- Would require municipal APIs (future negotiation)
- Charging alone is sufficient first problem
- Parking can layer on top later

**Why simple battery slider?**
- Most users don't know exact % anyway
- Slider fast to adjust (no typing)
- Reduces cognitive load
- Accuracy improves with real data over time

**Why link to Maps, not embed?**
- Native navigation app is better
- Reduces app complexity
- Better UX (native routing)
- No need to maintain turn-by-turn
