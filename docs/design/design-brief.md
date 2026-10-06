# ChargePark: Design Brief

## Design Principles

### 1. Mobile-First, One-Handed

The user is traveling, holding a coffee, or at a destination. Every interaction must work one-handed.

- Large tap targets (minimum 48px × 48px)
- Vertical scrolling only
- Thumb-reachable controls at bottom
- Minimize typing (sliders, taps preferred)

### 2. Clarity Over Features

The user needs ONE answer: "Where should I charge?"

- One clear recommended option
- Show alternatives without overload
- Hide unnecessary complexity
- Data transparency (Unknown > guessing)

### 3. Trust Through Data Transparency

The user is making a decision with real money.

- Show source of data (€0.42/kWh, updated 3 min ago)
- Show data limitations (availability may be outdated)
- Explain recommendations ("Recommended because...")
- No fabricated prices

### 4. Fast & Responsive

Traveling users expect snappy interactions.

- Home: <2s load
- Search results: <2s
- Map: <500ms interaction
- Battery slider: Instant
- No spinners waiting for data

### 5. Context-Aware

The app knows:
- Where the user is (searched destination)
- Their battery level
- How long they're staying (optional)

Use this context to prioritize information.

---

## Visual Direction

### Color Palette

| Purpose | Color | Usage |
|---------|-------|-------|
| **Primary** | Green (#10B981) | CTA, "Recommended", success states |
| **Secondary** | Blue (#3B82F6) | Links, secondary CTAs |
| **Neutral** | Gray (#6B7280) | Body text, dividers, secondary info |
| **Cost Ranking** | | |
| • Cheapest | Green (#10B981) | <€2.50 estimated cost |
| • Mid-range | Amber (#F59E0B) | €2.50-€5.00 |
| • Expensive | Red (#EF4444) | >€5.00 |
| **Warnings** | Amber (#F59E0B) | Data outdated, availability uncertain |
| **Errors** | Red (#EF4444) | No results, invalid input |

### Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Logo | Inter Bold | 24px | 700 |
| Page Title | Inter Bold | 20px | 700 |
| Card Title (Charger) | Inter Semi-Bold | 18px | 600 |
| Body Text | Inter Regular | 16px | 400 |
| Small / Metadata | Inter Regular | 14px | 400 |
| Emphasis (Price) | Inter Bold | 16px | 700 |

**Font Stack:** Inter, system-ui, sans-serif

### Spacing

- Padding around cards: 16px
- Gap between list items: 12px
- Margin below sections: 24px
- Touchable safe zone: 44px × 44px minimum

---

## Information Hierarchy

### Home Screen

```
┌─────────────────────────────────┐
│  ChargePark                     │  (Logo)
├─────────────────────────────────┤
│                                 │
│  Where to charge?               │  (Primary CTA)
│  ┌─────────────────────────────┐│
│  │ [Search]                  ▼ ││  (Search input)
│  │ Rotterdam Centraal       [×]││
│  └─────────────────────────────┘│
│                                 │
│  [📍 Select on Map]             │  (Alt entry point)
│                                 │
└─────────────────────────────────┘
```

### Results Screen

```
┌─────────────────────────────────┐
│ Rotterdam Centraal      [<] [×] │  (Destination + clear)
├─────────────────────────────────┤
│ Battery Level                   │
│ 50%                             │
│ [●████░░░░░░░]                 │  (Slider)
├─────────────────────────────────┤
│ 🗺️  [List]                      │  (Toggle view)
├─────────────────────────────────┤
│ [RECOMMENDED - CHEAPEST]        │  (Label)
│ Q-Park Blaaktuin                │  (Charger name)
│ €2.10 | 45 min | 280m walk      │  (Key info)
│ [Details >]                     │  (Expand action)
├─────────────────────────────────┤
│ Allego Parkeergarage            │
│ €2.40 | 40 min | 150m           │
│ [Details >]                     │
├─────────────────────────────────┤
│ Shell Recharge                  │
│ €4.50 | 8 min | 420m            │
│ [Details >]                     │
└─────────────────────────────────┘
```

### Detail Screen

```
┌─────────────────────────────────┐
│ [<] Charger Details             │  (Back nav)
├─────────────────────────────────┤
│ Q-Park Blaaktuin                │  (Name)
│ Blaaktuin 12                    │  (Address)
│ Rotterdam 3011 TA               │
├─────────────────────────────────┤
│ €0.42/kWh                       │  (Price)
│ Your battery: 50%               │
│ Total: €12.60                   │  (Calculated)
├─────────────────────────────────┤
│ Charging Time                   │  (Estimate)
│ ≈ 45 minutes @ 11kW             │
├─────────────────────────────────┤
│ Walking Distance                │  (Distance)
│ 280m (≈ 3.5 min walk)          │
├─────────────────────────────────┤
│ Availability                    │  (Status)
│ 2 out of 8 connectors available │
│ Last updated: 2 min ago         │
├─────────────────────────────────┤
│ [Navigate] [Back]               │  (Actions)
└─────────────────────────────────┘
```

---

## Component Library (Sketch)

### Card Component (Result Item)

```
┌────────────────────────────────┐
│ Q-Park Blaaktuin      [Cheapest]│
│ ────────────────────────────────│
│ €2.10 | 45 min | 280m walk      │
│                                │
│ [Details >]                    │
└────────────────────────────────┘
```

**States:**
- Normal (default)
- Hover (slightly elevated)
- Selected (border highlight)
- Loading (skeleton)

### Battery Slider Component

```
Current Battery: 50%
[●████░░░░░░░░░░]
  0%              100%

• Draggable
• Live update
• Accessible (keyboard support)
```

### Search Autocomplete

```
[Where to charge?        ] ✕
 ┌──────────────────────┐
 │ Rotterdam Centraal   │
 │ Rotterdam Centraal S │
 │ Rotterdam Centraal U │
 │ Rotterdam Slaak      │
 └──────────────────────┘
```

**Behavior:**
- Shows top 5 results
- Keyboard navigation
- Touch selection

---

## Interaction Patterns

### Search Flow

1. User taps search input
2. Keyboard appears (mobile)
3. Type destination
4. Autocomplete suggestions appear
5. User selects from dropdown
6. Destination confirmed
7. Results load

### Battery Adjustment

1. User sees slider at 50%
2. Drag slider left/right
3. Results update in real-time
4. Cost and time recalculate
5. Ranking may shift

### Result Selection

1. User sees ranked list
2. Tap any card to expand
3. Detail view slides up
4. Full information visible
5. Tap "Navigate" to leave app

### Error Handling

```
Search: "Xyz Random Place"

❌ No results found

Please check:
• Spelling
• Try nearby city
• Select on map instead

[Select on Map]
```

---

## Loading & Empty States

### Loading (Initial)

```
┌─────────────────────────────────┐
│  ChargePark                     │
├─────────────────────────────────┤
│                                 │
│  ⟳ Finding charging options...  │
│                                 │
│  (Small spinner animation)      │
│                                 │
└─────────────────────────────────┘
```

### No Results

```
┌─────────────────────────────────┐
│  Rotterdam Centraal    [<] [×]  │
├─────────────────────────────────┤
│                                 │
│  ⚠️  No charging options found   │
│                                 │
│  Try:                           │
│  • Expand search distance       │
│  • Choose different destination │
│  • Check back later             │
│                                 │
│  [Expand Search] [New Search]   │
└─────────────────────────────────┘
```

### API Error

```
┌─────────────────────────────────┐
│  Error Loading Results          │
├─────────────────────────────────┤
│                                 │
│  ⚠️  Unable to reach data service│
│                                 │
│  Please check:                  │
│  • Internet connection          │
│  • Try again in a moment        │
│                                 │
│  [Try Again] [Back to Search]   │
└─────────────────────────────────┘
```

---

## Accessibility

### Color Contrast
- Body text: 4.5:1 (WCAG AA)
- Labels: 3:1 minimum
- Not relying on color alone for meaning

### Touch Targets
- Minimum 48px × 48px
- Minimum 8px gap between targets
- Adequate padding for fat-finger tolerance

### Text
- Readable font size (16px minimum)
- Line height 1.5 minimum
- Sufficient whitespace

### Forms
- Labels associated with inputs
- Error messages clear and linked
- Form validation feedback immediate

### Semantic HTML
- Proper heading hierarchy (H1, H2, H3)
- Landmark regions (header, main, footer)
- Proper button/link semantics
- ARIA labels where needed

---

## Platform-Specific Considerations

### iOS

- Safe area insets respected (notch, home indicator)
- Native keyboard styling
- Tap feedback (haptic vibration if available)
- Share extension (optional v2)

### Android

- Material Design principles where sensible
- Status bar integration
- Back button behavior
- Proper resource scaling (density buckets)

### Desktop (Optional v2)

- Responsive to wider screens
- Keyboard navigation support
- Mouse hover states
- Window resizing handled

---

## Design Specs

### Canvas Size
- Mobile: 375px (iPhone SE baseline)
- Safe area: 360px content width
- Responsive: 100% width on larger screens

### Breakpoints
- Mobile: ≤600px (primary)
- Tablet: 601px-1024px (secondary, future)
- Desktop: >1024px (optional, future)

### Animations
- Page transitions: 200ms ease
- Slider drag: 100ms update (no animation)
- Card tap: 100ms scale feedback
- Loading spinner: Smooth rotation

---

## Brand Guidelines (Provisional)

### Logo & Name
- "ChargePark" (two words or one, TBD)
- Green accent (trust, sustainability, charging)
- Lightning bolt optional icon (electricity reference)

### Tagline (Provisional)
- "Charge smart, save more"
- "Find your charge"
- "Smart charging for your destination"

### Brand Voice
- Helpful, not preachy
- Clear, not technical
- Trustworthy, not salesey
- Action-oriented, not passive

---

## Prototype

**Status:** Design system and components ready for implementation.

**Next:** Frontend developer builds in React using this design system.

**Future:** Collect user feedback during verification phase and iterate.
