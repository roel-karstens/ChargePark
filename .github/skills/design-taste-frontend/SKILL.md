---
applyTo: "frontend/**/*.{ts,tsx}"
---

# Design Taste Skill (Frontend)

**Use this skill when:**
- Building UI that needs to feel premium and intentional
- Avoiding generic "AI-generated UI" aesthetic
- Making design choices beyond what code alone determines
- Creating distinctive visual identity
- Improving design quality from "okay" to "excellent"
- Reviewing UI and asking "why does this feel generic?"

**Goal**: Produce UIs that feel intentional, distinctive, and high-end—not template-like or generic.

---

## The Problem: Generic AI Aesthetics

**Generic UI Looks Like:**
- ❌ Purple or blue gradients (lazy default)
- ❌ Excessive cards stacked everywhere (no hierarchy)
- ❌ Every interaction has a bounce or animation (feels cheap)
- ❌ Colors don't coordinate (rainbow scattered)
- ❌ Serif typefaces everywhere (trying too hard)
- ❌ Rounded corners on everything (visual chaos)
- ❌ Shadows on shadows (layers without meaning)
- ❌ Lots of whitespace but no visual cohesion
- ❌ Same-sized buttons and text (no hierarchy)
- ❌ Identical cards for everything (no differentiation)
- ❌ No constraint or structure (anything goes)

**Why it happens:**
- No design direction before coding
- Using Tailwind defaults without intentional choices
- Copying patterns without understanding why
- No visual principle guiding decisions

---

## The Solution: Intentional Design Taste

### Principle 1: Constraint Creates Character

**Great design often comes from self-imposed constraints.**

#### Colors: 3 Maximum (Not 8)

```
Generic: Multiple colors scattered
  - Blue button
  - Green card
  - Orange badge
  - Red error
  - Purple heading
  → Chaotic, no cohesion

Intentional: 3 primary colors with purpose
  - Primary (Blue): Actions only
  - Secondary (Gray): Text, backgrounds
  - Accent (Orange): Emphasis or warnings only
  → Cohesive, controlled
```

**Apply This**:
- Limit yourself to 3 primary colors
- Define when each is used
- Break the rule ONLY for errors (red)
- Everything else: grayscale or primary

```tsx
// ❌ WRONG: Too many colors
<div className="text-green-600">Success</div>
<div className="text-blue-600">Info</div>
<div className="text-purple-600">Notice</div>

// ✅ RIGHT: Color hierarchy
<div className="text-primary">Primary action</div>
<div className="text-muted-foreground">Secondary text</div>
<div className="text-destructive">Error or warning</div>
```

#### Typography: 2-3 Sizes (Not 6)

```
Generic: Inconsistent type scale
  - 14px body text (too small)
  - 18px heading (confused)
  - 24px big heading
  - 28px really big heading
  → Messy, hard to scan

Intentional: Clear type hierarchy
  - 16px body (readable baseline)
  - 20px H2 (section heading)
  - 32px H1 (page title)
  → Clear, scannable, professional
```

**Apply This**:
- Use exactly 3 type sizes: body (16px), section (20px), page (32px)
- Never add sizes for decoration
- Use font weight for emphasis, not size

```tsx
// ❌ WRONG: Too many sizes
<h1 className="text-4xl">Title</h1>
<h2 className="text-2xl">Section</h2>
<h3 className="text-xl">Subsection</h3>
<p className="text-lg">Body variant</p>
<p className="text-base">Base body</p>
<p className="text-sm">Small text</p>

// ✅ RIGHT: 3-level hierarchy
<h1 className="text-3xl font-bold">Title</h1>
<h2 className="text-xl font-semibold">Section</h2>
<p className="text-base">Body text</p>
<p className="text-sm text-muted-foreground">Help text</p>
```

#### Spacing: 8px Grid (Not Random)

```
Generic: Random spacing
  - 10px gap here
  - 13px margin there
  - 20px padding elsewhere
  → Feels chaotic, no rhythm

Intentional: 8px multiples
  - 8px: tight
  - 16px: default
  - 24px: comfortable
  - 32px: generous
  → Predictable, professional, rhythm
```

**Apply This**:
- All spacing: 8, 16, 24, 32, 48px only
- No arbitrary 10px, 13px, 15px, 18px, 22px
- Use 8px grid as foundation

```tsx
// ❌ WRONG: Random spacing
<div className="space-y-2.5 px-3 py-1.5">
<div className="mb-2.5 gap-3">
<div className="px-2 py-3">

// ✅ RIGHT: 8px multiples
<div className="space-y-4 px-4 py-2">
<div className="mb-4 gap-4">
<div className="px-4 py-2">
```

#### Rounded Corners: Strategic (Not Everywhere)

```
Generic: Everything rounded
  - Buttons: rounded-full
  - Cards: rounded-3xl
  - Inputs: rounded-2xl
  - Images: rounded-xl
  → Looks childish or scattered

Intentional: Radius matches purpose
  - Small elements: 4px (sm)
  - Medium elements: 6px (md)
  - Large elements: 8px (lg)
  - No full circles (unless icon)
  → Professional, intentional
```

**Apply This**:
- Define 3 radius values: sm/md/lg
- Larger elements get larger radius
- Keep radius subtle (not rounded-full)

```tsx
// ❌ WRONG: Inconsistent radius
<button className="rounded-full">Button</button>
<div className="rounded-3xl">Card</div>
<input className="rounded-2xl" />

// ✅ RIGHT: Consistent hierarchy
<button className="rounded-md">Button</button>
<div className="rounded-lg">Card</div>
<input className="rounded-md" />
```

---

### Principle 2: Visual Hierarchy Through Weight, Not Size

**Most design choices come from weight, not size.**

#### Use Weight (Font) for Emphasis

```
Generic: Size creep
  - Body: 16px normal
  - Important text: 18px (still normal)
  - More important: 20px (still normal)
  → Doesn't work, just harder to read

Intentional: Weight for hierarchy
  - Body: 16px normal (400)
  - Label: 16px semibold (600)
  - Heading: 20px semibold (600)
  → Clear hierarchy without confusion
```

**Apply This**:
- Keep size consistent (16px body, 20px heading)
- Use weight for emphasis (normal vs semibold)
- Don't stretch size range

```tsx
// ❌ WRONG: Size for hierarchy
<p className="text-base">Regular text</p>
<p className="text-lg font-semibold">Important</p>
<p className="text-xl font-bold">Very important</p>

// ✅ RIGHT: Weight for hierarchy
<p className="text-base font-normal">Regular text</p>
<p className="text-base font-semibold">Important label</p>
<h2 className="text-xl font-semibold">Section heading</h2>
```

#### Use Color (Opacity) for Importance

```
Generic: No opacity hierarchy
  - All text: full opacity (100%)
  - All backgrounds: full opacity (100%)
  → No visual depth or hierarchy

Intentional: Opacity for secondary information
  - Primary text: 100% opacity (foreground)
  - Secondary text: 70% opacity (muted-foreground)
  - Hints: 50% opacity (very muted)
  → Guides eye to important content
```

**Apply This**:
- Main text: 100% (foreground)
- Secondary text: use `text-muted-foreground` (gray, 70%)
- Help text: even more muted
- Never bury important info in low opacity

```tsx
// ❌ WRONG: Equal importance
<div className="text-gray-900">Title</div>
<div className="text-gray-900">Description</div>
<div className="text-gray-900">Help text</div>

// ✅ RIGHT: Opacity hierarchy
<div className="text-foreground font-semibold">Title</div>
<div className="text-foreground">Description</div>
<div className="text-muted-foreground text-sm">Help text</div>
```

---

### Principle 3: Purposeful Micro-Interactions

**Animation should earn its place. No bounces by default.**

#### When to Animate (Sparingly)

```
✅ DO animate:
- Buttons on hover (opacity shift, not bounce)
- Focus ring appearing (smooth transition)
- Loading indicator (subtle spin)
- Toast/notification appearing (fade-in)

❌ DON'T animate:
- Everything bouncing (juvenile)
- Pointless micro-interactions (distraction)
- Animations without purpose (wasted motion)
- Animations that repeat unnecessarily
```

**Apply This**:
- Only add animation if it serves a purpose
- Keep animations 200-300ms (fast)
- No bounciness (elastic easing)
- Disabled on mobile (respect prefers-reduced-motion)

```tsx
// ❌ WRONG: Gratuitous animation
<button className="hover:scale-110 hover:rotate-3">
  Bouncy button
</button>

// ✅ RIGHT: Purposeful animation
<button className="hover:opacity-90 transition-opacity">
  Subtle hover feedback
</button>
```

---

### Principle 4: Intentional Whitespace

**Whitespace is content. Not blank space.**

#### Whitespace Groups and Separates

```
Generic: Whitespace scattered randomly
  - Some sections have 16px gap
  - Some have 8px
  - Some have 32px
  → No visual logic, confusing

Intentional: Whitespace groups content
  - Within group: 8px (tight relationship)
  - Between groups: 24px (clear separation)
  - Between major sections: 32px+ (strong separation)
  → Visual structure emerges from spacing
```

**Apply This**:
- Use spacing to create sections
- Consistent spacing = consistent grouping
- More space = more separation
- Think: what belongs together?

```tsx
// ❌ WRONG: No visual grouping
<div>
  <input />
  <input />
  <input />
  <button>Submit</button>
  <div>Other content</div>
</div>

// ✅ RIGHT: Spacing creates groups
<div className="space-y-4">
  <div className="space-y-2">
    <input />
    <input />
    <input />
  </div>
  <button>Submit</button>
  
  <hr />
  
  <div>Other content</div>
</div>
```

---

### Principle 5: Type Selection = Brand

**Font choice is often the first thing that signals "premium" or "generic".**

#### System Font Stack (Modern & Trustworthy)

```
✅ Good choice (used in this starter):
-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif
→ Platform-native, recognizable, professional

❌ Avoid:
- Multiple Google Fonts (slow load, generic)
- Sans-serif serif mix (confusing)
- "Designer fonts" for body text (hard to read)
- Comic Sans, Papyrus (dated or childish)
```

**Apply This**:
- Use system fonts (they're designed for screens)
- One typeface for entire app (not 3 different ones)
- Only serif for brand/heading if intentional

```tsx
// ❌ WRONG: Multiple fonts
<h1 className="font-serif">Serif heading</h1>
<p className="font-sans">Sans body</p>
<button className="font-mono">Mono button</button>

// ✅ RIGHT: Single typeface, varied weight
<h1 className="font-bold">Bold heading</h1>
<p>Regular body</p>
<button className="font-semibold">Semibold button</button>
```

---

### Principle 6: No Decoration, Only Function

**Every visual element should serve a purpose.**

#### What to Avoid

```
❌ Decorative elements:
- Gradient backgrounds on buttons
- Animated icons everywhere
- Unnecessary shadows (shadows on shadows)
- Lines and dividers everywhere
- Colored badges with no meaning

✅ Functional elements:
- One shadow: indicates depth/elevation
- One gradient: indicates state (disabled)
- Icons: communicate meaning
- Color: indicates category or state
```

**Apply This**:
- If it doesn't communicate, remove it
- Shadows indicate layers (not decoration)
- Color indicates state (not just pretty)
- Icons communicate, not decorate

```tsx
// ❌ WRONG: Decorated
<div className="bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg shadow-blue-300">
  <button className="bg-gradient-to-b from-green-400 to-green-600">
    Decorated
  </button>
</div>

// ✅ RIGHT: Functional
<div className="bg-primary text-primary-foreground p-6">
  <button className="btn-primary">
    Action
  </button>
</div>
```

---

## Concrete Examples: Generic vs Intentional

### Example 1: Create Form

**Generic**:
```tsx
<div className="bg-gradient-to-r from-purple-500 to-blue-500 p-8 rounded-3xl">
  <h1 className="text-5xl text-white font-black mb-4">Create Project</h1>
  <input className="w-full p-4 rounded-full mb-4" placeholder="Name" />
  <input className="w-full p-4 rounded-full mb-4" placeholder="Description" />
  <button className="w-full py-3 bg-green-500 text-white rounded-full font-bold hover:scale-105 hover:rotate-1">
    Create Now! 🎉
  </button>
</div>
```

**Problems**:
- Gradient is decorative, not functional
- Too many sizes (5xl heading, normal text)
- Rounded-full everywhere (childish)
- Emoji in button (casual, not professional)
- Hover animation (bouncy)
- Green button (color not intentional)

**Intentional**:
```tsx
<div className="card">
  <h1 className="text-3xl font-bold mb-6">Create Project</h1>
  
  <div className="space-y-4">
    <div>
      <label htmlFor="name" className="label">Project Name</label>
      <input id="name" type="text" className="input" placeholder="My project..." />
    </div>
    
    <div>
      <label htmlFor="desc" className="label">Description</label>
      <textarea id="desc" className="input" placeholder="What's this project about?" />
    </div>
  </div>
  
  <div className="flex gap-4 mt-6">
    <button className="btn-primary">Create</button>
    <button className="btn-secondary">Cancel</button>
  </div>
</div>
```

**Why it's better**:
- Uses design system tokens (.card, .input, .btn-primary)
- Clear hierarchy (32px h1, body text, labels)
- Consistent spacing (space-y-4, gap-4)
- Professional appearance (no decorations)
- Button colors are intentional (primary vs secondary)
- Accessible (labels, semantic HTML)

---

### Example 2: Project Card

**Generic**:
```tsx
<div className="bg-white rounded-3xl shadow-2xl shadow-blue-500/50 p-8 border-t-4 border-purple-500 hover:scale-110 transition-transform">
  <div className="text-6xl mb-4">📋</div>
  <h3 className="text-3xl font-black text-purple-600 mb-2">
    {project.name}
  </h3>
  <p className="text-gray-400 text-sm mb-4">{project.description}</p>
  <button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-full font-bold mb-2">
    Open
  </button>
  <button className="w-full bg-red-500 text-white py-3 rounded-full font-bold hover:bg-red-600">
    Delete
  </button>
</div>
```

**Problems**:
- Large emoji (amateurish)
- Colored top border (arbitrary decoration)
- Full-width buttons (cramped, not mobile-friendly)
- Purple and blue mixed (no coordination)
- Hover scale animation (too bouncy)
- Icon-only instead of icon + text

**Intentional**:
```tsx
<div className="card">
  <div className="flex items-start justify-between mb-3">
    <div>
      <h3 className="text-lg font-semibold">{project.name}</h3>
      <p className="text-sm text-muted-foreground">{project.description}</p>
    </div>
  </div>
  
  <div className="flex gap-2">
    <button className="btn-primary flex-1">Open</button>
    <button 
      className="btn-secondary"
      aria-label={`Delete ${project.name}`}
      onClick={() => handleDelete(project.id)}
    >
      Delete
    </button>
  </div>
</div>
```

**Why it's better**:
- Consistent with design system
- Proper hierarchy (h3 for card title)
- Buttons sized appropriately
- No decorative animation
- Accessible delete button (aria-label)
- Uses gray text for secondary info
- No emoji (professional)

---

## Design Taste Checklist

Before shipping a component, ask:

- [ ] **Colors**: Using ≤3 primary colors intentionally?
- [ ] **Typography**: 2-3 sizes? Weight for emphasis, not size?
- [ ] **Spacing**: All 8px multiples? Creates visual groups?
- [ ] **Radius**: sm/md/lg consistent? No rounded-full except icons?
- [ ] **Shadows**: Only for elevation, not decoration?
- [ ] **Animations**: Purpose-driven? 200-300ms? No bouncing?
- [ ] **Decorations**: Everything functional, nothing gratuitous?
- [ ] **Font**: System stack? Consistent? One typeface?
- [ ] **Whitespace**: Intentional? Groups related content?
- [ ] **Hierarchy**: Clear importance through weight, color, opacity?
- [ ] **Accessibility**: All interactive elements accessible?
- [ ] **Professional**: Would this work in a Fortune 500 app? Or does it feel "AI-made"?

---

## When Intentional Design Matters Most

1. **Buttons & CTAs** — Easiest way to signal "premium" or "cheap"
2. **Cards** — Default component, often overused
3. **Forms** — First impression of quality
4. **Color** — 3 colors chosen well > 8 colors scattered
5. **Spacing** — Rhythm of whitespace indicates precision
6. **Type** — Font choice is instant credibility signal

---

## Further Reading

- [Laws of Design](https://www.nngroup.com/articles/design-laws/)
- [Hierarchy in Design](https://www.smashingmagazine.com/2020/01/css-cascade-inheritance-specificity/)
- [Whitespace in UI](https://dribbble.com/stories/2019/09/24/the-power-of-whitespace)
- [Design Systems](https://www.designsystems.com/)
- [Constraint-Based Design](https://www.invisionapp.com/inside-design/design-constraints/)
