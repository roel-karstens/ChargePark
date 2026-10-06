---
applyTo: "frontend/**/*.{ts,tsx}"
---

# Responsive Verification Skill

**Use this skill when:**
- Implementing responsive layouts (grid, flex, breakpoints)
- Verifying mobile/tablet/desktop appearance after UI changes
- Testing touch interactions and tap targets
- Ensuring readability across screen sizes
- Validating responsive design before shipping

**Goal**: Systematically verify UI works and looks good on all device sizes.

---

## Responsive Design Verification Workflow

### 1. Setup: Open Browser DevTools

```
1. Press F12 to open DevTools
2. Press Ctrl+Shift+M to toggle device toolbar
3. Dock DevTools to side (easier to see mobile + sidebar)
```

### 2. Test Mobile (375px)

**Viewport**: 375px width (iPhone SE, iPhone 12 mini)

**Checklist**:

- [ ] **Layout**: Single column only (no multi-column grid)
  - Check: Grid uses `grid-cols-1` on mobile
  - Check: No horizontal scrollbar
  
- [ ] **Typography**: Readable without zoom
  - Check: Body text ≥ 16px (base size)
  - Check: Headings are clearly larger than body
  - Check: Line length ≤ 65 characters (for readability)
  
- [ ] **Spacing**: Appropriate padding and gaps
  - Check: Not cramped (page padding, card padding visible)
  - Check: Gap between items visible (not squished)
  - Check: Spacing follows 8px grid (8, 16, 24, 32px)
  
- [ ] **Interactive Elements**: Large enough to tap
  - Check: Buttons ≥ 44px tall
  - Check: Input fields ≥ 44px tall
  - Check: Tap targets have adequate spacing (not overlapping)
  - Check: No hover-only actions (mobile has no hover)
  
- [ ] **Images**: Fit viewport
  - Check: Images scale to 100% width
  - Check: No horizontal overflow
  - Check: Aspect ratio maintained
  
- [ ] **Navigation**: Mobile-friendly
  - Check: Menu collapses or is minimal
  - Check: Can access all features with thumb (bottom of screen reachable)
  
- [ ] **Forms**: Optimized for mobile
  - Check: One field per row
  - Check: Large enough to tap
  - Check: Keyboard type correct (`type="email"`, `type="number"`, etc.)
  - Check: No scroll needed to see form and button together
  
- [ ] **States**: All visible
  - Check: Loading state visible (spinner, "Loading..." text)
  - Check: Error messages readable (red, not hidden)
  - Check: Empty state message centered and readable
  - Check: Success state visible

**Take Screenshot**:
```
DevTools → ⋮ menu → Capture screenshot
Or: Right-click page → Take screenshot
```

**Issues to Fix**:

❌ **Multi-column on mobile**
```jsx
// WRONG: Shows 3 columns on mobile
<div className="grid grid-cols-3 gap-4">

// RIGHT: Responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

❌ **Text too small (14px or less)**
```jsx
// WRONG
<p className="text-sm">Body text</p>  // 14px, too small

// RIGHT
<p className="text-base">Body text</p>  // 16px
```

❌ **Buttons too small (< 44px)**
```jsx
// WRONG
<button className="px-2 py-1">Small button</button>  // 32px tall

// RIGHT
<button className="px-4 py-2">Button</button>  // 44px+ tall
```

❌ **Horizontal scrollbar visible**
```jsx
// WRONG: Image overflows
<img src="..." className="w-screen" />

// RIGHT: Fits viewport
<img src="..." className="w-full" />
```

---

### 3. Test Tablet (768px)

**Viewport**: 768px width (iPad, tablet mode)

**Checklist**:

- [ ] **Layout**: Two-column or appropriate for tablet
  - Check: Grid uses `md:grid-cols-2` or similar
  - Check: Layout utilizes space (not still single column)
  - Check: No awkward wrapping or stretching
  
- [ ] **Spacing**: Increases from mobile
  - Check: Gaps wider than mobile (more breathing room)
  - Check: Padding appropriate (not cramped, not excessive)
  
- [ ] **Readability**: Still good
  - Check: Text size still readable
  - Check: Line length still reasonable (< 65 chars)
  
- [ ] **Touch Targets**: Still adequate
  - Check: Buttons still ≥ 44px
  - Check: Spacing adequate (not cramped)
  
- [ ] **Sidebar/Navigation** (if exists):
  - Check: Appears or remains hidden appropriately
  - Check: Content adjusts for sidebar width

**Issues to Fix**:

❌ **Still single column on tablet**
```jsx
// WRONG: No change from mobile
<div className="grid grid-cols-1 gap-4">

// RIGHT: Expands on tablet
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
```

❌ **Spacing inconsistent between mobile and tablet**
```jsx
// WRONG: Same spacing everywhere
<div className="space-y-4">

// RIGHT: Increases on tablet
<div className="space-y-4 md:space-y-6">
```

---

### 4. Test Desktop (1024px+)

**Viewport**: 1024px width (laptop, desktop)

**Checklist**:

- [ ] **Layout**: Full multi-column (3 columns typical)
  - Check: Grid uses `lg:grid-cols-3` or similar
  - Check: Uses available width effectively
  
- [ ] **Content Width**: Constrained if text-heavy
  - Check: Max-width container on text pages (prevents 100-char lines)
  - Check: Not stretched too wide (hard to read)
  
- [ ] **Spacing**: Generous, professional
  - Check: Section gaps are adequate (32px+ between sections)
  - Check: Card padding appropriate
  
- [ ] **Hover States**: Working
  - Check: Buttons have hover effects (opacity, color change)
  - Check: Cards have hover effects (lift, shadow) if interactive
  - Check: No hover-only critical actions
  
- [ ] **Sidebar/Navigation** (if exists):
  - Check: Fully visible and accessible
  - Check: Content adjusts properly for sidebar
  
- [ ] **Whitespace**: Intentional
  - Check: Not crowded
  - Check: Visual breathing room
  - Check: Clear visual hierarchy

**Issues to Fix**:

❌ **No max-width constraint on text**
```jsx
// WRONG: Text spans full width (hard to read)
<div className="space-y-4">
  <p>Long paragraph...</p>
</div>

// RIGHT: Constrained width
<div className="max-w-prose space-y-4">
  <p>Long paragraph...</p>
</div>
```

❌ **Three-column grid too cramped**
```jsx
// WRONG: Cards too narrow, text wraps badly
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">

// RIGHT: Better spacing
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

---

## Touch Interaction Testing

**Test on actual mobile device or use browser DevTools simulation.**

### Check Touch Targets

```
Requirement: ≥ 44px × 44px minimum touch target

Measure:
1. Open DevTools
2. Inspect button: Elements tab
3. Check height (should be 44px+)
4. Check width (should be 44px+)
5. Check spacing to other elements (should not overlap)
```

**Example Measurement**:
```
<button className="px-4 py-2">Click</button>
// Computes to: 16px padding-left + content + 16px padding-right
//              8px padding-top + 16px line-height + 8px padding-bottom
// Height: 32px + 16px = 48px ✓ (meets 44px requirement)
// Width: 32px + text-width (at least 44px) ✓
```

### Check Tap Spacing

```
No two interactive elements should be:
- Less than 8px apart vertically
- Less than 8px apart horizontally

This prevents accidental double-taps.
```

**Fix Pattern**:
```jsx
// WRONG: Buttons too close
<div className="space-y-1">
  <button>Action 1</button>
  <button>Action 2</button>
</div>

// RIGHT: Adequate spacing
<div className="space-y-2">
  <button>Action 1</button>
  <button>Action 2</button>
</div>
```

### Check Hover vs Touch

**Mobile has NO hover.** All actions must be:
- Tap to activate (buttons work with click)
- Visible without hover (label is visible, not hover-only)
- Not rely on hover for critical information

**Check Pattern**:
```jsx
// WRONG: Help text only shows on hover (not visible on mobile)
<div className="group">
  <input placeholder="Email" />
  <span className="hidden group-hover:block text-xs">
    Enter your email
  </span>
</div>

// RIGHT: Help text always visible
<div>
  <input placeholder="Email" />
  <span className="text-xs text-muted-foreground">
    Enter your email (required)
  </span>
</div>
```

---

## Breakpoint-Specific Testing

### Mobile Breakpoints

| Device | Width | Typical Tailwind |
|--------|-------|------------------|
| Mobile | 375px | base (no prefix) |
| Phablet | 425px | base |
| Tablet | 768px | `md:` |

**Test at 375px and 425px for mobile coverage.**

### Tablet Breakpoints

| Device | Width | Typical Tailwind |
|--------|-------|------------------|
| iPad Mini | 768px | `md:` |
| iPad | 820px | `md:` |

**Test at 768px for tablet coverage.**

### Desktop Breakpoints

| Device | Width | Typical Tailwind |
|--------|-------|------------------|
| Laptop | 1024px | `lg:` |
| Desktop | 1280px | `xl:` |
| Large Desktop | 1536px | `2xl:` |

**Test at 1024px minimum.**

---

## Responsive Layout Patterns

### Grid Pattern (Most Common)

**Mobile**: Single column
**Tablet**: Two columns
**Desktop**: Three columns

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id}>{item}</Card>)}
</div>
```

**Verify**:
- ✓ At 375px: 1 column visible
- ✓ At 768px: 2 columns visible
- ✓ At 1024px+: 3 columns visible

### Sidebar Pattern

**Mobile**: No sidebar (stack vertically or hidden menu)
**Desktop**: Sidebar + main content

```jsx
<div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
  <aside className="hidden md:block">Sidebar</aside>
  <main>Content</main>
</div>
```

**Verify**:
- ✓ At 375px: Sidebar not visible, full-width content
- ✓ At 1024px+: Sidebar visible, content beside it

### Stacked vs Inline Pattern

**Mobile**: Stack vertically
**Desktop**: Inline (next to each other)

```jsx
// For buttons
<div className="flex flex-col md:flex-row gap-4">
  <button className="btn-primary">Primary</button>
  <button className="btn-secondary">Secondary</button>
</div>
```

**Verify**:
- ✓ At 375px: Buttons stack vertically
- ✓ At 1024px+: Buttons side-by-side

---

## Responsive Typography

### Type Scale

**Mobile** (base):
- H1: 24px (2xl)
- H2: 18px (lg)
- Body: 16px (base)
- Caption: 12px (xs)

**Desktop** (optional enhancements):
- H1: 32px (can use 2xl or 3xl)
- H2: 20px (can use xl or 2xl)
- Body: 16px (stays same)

**Pattern**:
```jsx
// Same size on all devices
<h1 className="text-2xl md:text-3xl font-bold">Title</h1>
<p className="text-base">Body</p>
<p className="text-sm">Small</p>
```

**Verify**:
- ✓ Body text is 16px (readable on mobile)
- ✓ Headings are noticeably larger
- ✓ No text smaller than 14px (hard to read)

### Line Length

**Target**: 45-75 characters per line (best is 65)

```jsx
// Too long: Full viewport width on desktop
<div>
  <p>Paragraph text...</p>
</div>

// Right: Constrained width
<div className="max-w-prose">
  <p>Paragraph text...</p>
</div>
```

**Verify**:
- ✓ At 1024px+: No line exceeds 75 characters
- ✓ Text is readable without moving head side-to-side

---

## Responsive Image Testing

**Images must scale to viewport.**

```jsx
// WRONG: Fixed size (may overflow or be tiny)
<img src="..." className="w-500" />

// RIGHT: Responsive
<img src="..." className="w-full max-w-2xl" />
```

**Verify**:
- ✓ At 375px: Image fits width
- ✓ At 1024px: Image doesn't stretch excessively
- ✓ Aspect ratio maintained (not squished)

---

## Screenshot Evidence Collection

### How to Take Screenshots

**Chrome DevTools**:
```
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Set viewport (375px, 768px, 1024px)
4. Right-click page → Capture screenshot
Or: DevTools menu (⋮) → Capture → Full page screenshot
```

**Browser Built-in**:
```
1. Press Ctrl+Shift+S
2. Select area or full page
3. Save
```

### Document Evidence

**Create a report showing**:

```markdown
## Responsive Verification Evidence

### Mobile (375px)
![screenshot of mobile view]

- ✓ Single column layout
- ✓ Text readable (16px body)
- ✓ Buttons 44px+ tall
- ✓ No horizontal scroll
- ✓ Empty state message visible

### Tablet (768px)
![screenshot of tablet view]

- ✓ Two-column layout
- ✓ Spacing increased (breathing room)
- ✓ All features accessible

### Desktop (1024px+)
![screenshot of desktop view]

- ✓ Three-column layout
- ✓ Max-width constraint on text
- ✓ Hover states visible and working
- ✓ Professional spacing and whitespace

### Issues Found & Fixed
None - responsive design verified.
```

---

## Common Responsive Issues

| Issue | Symptom | Fix |
|-------|---------|-----|
| **Mobile multi-column** | Grid shows 2+ columns on 375px | Add `grid-cols-1` to base classes |
| **Text too small** | Body text 14px or less | Use `text-base` (16px) |
| **No max-width** | Text spans full screen (100+ chars per line) | Add `max-w-prose` or similar |
| **Buttons too small** | < 44px tall | Add padding: `py-2` (8px) minimum |
| **Horizontal scroll** | Overflow visible on mobile | Check images, use `w-full`, avoid `w-screen` |
| **Cramped on tablet** | Same spacing as mobile | Add `md:` prefix for increased gaps/padding |
| **Hover-only action** | Button only works on hover (mobile breaks) | Make action tappable and visible without hover |
| **Touch targets overlap** | Buttons close together | Add spacing: `space-y-2` or `gap-4` |
| **Image stretches** | Aspect ratio broken | Add `object-cover` or `object-contain` |
| **Font too large on desktop** | H1 is 48px (too big) | Cap heading size with `max-w` or use smaller classes |

---

## Testing Checklist (Before Shipping)

- [ ] **Mobile (375px)**
  - [ ] Single column layout
  - [ ] Text readable (16px+)
  - [ ] Buttons ≥ 44px tall
  - [ ] No horizontal scrollbar
  - [ ] All states visible (loading, error, empty)

- [ ] **Tablet (768px)**
  - [ ] Two-column or appropriate layout
  - [ ] Spacing increased
  - [ ] All features accessible

- [ ] **Desktop (1024px+)**
  - [ ] Multi-column or full layout
  - [ ] Max-width constraint (text readable)
  - [ ] Hover states visible
  - [ ] Professional spacing

- [ ] **Touch Interactions**
  - [ ] Tap targets ≥ 44px × 44px
  - [ ] No hover-only critical actions
  - [ ] 8px+ spacing between interactive elements

- [ ] **Screenshots Collected**
  - [ ] Mobile screenshot
  - [ ] Tablet screenshot
  - [ ] Desktop screenshot

- [ ] **No Issues**
  - [ ] No horizontal scrollbars
  - [ ] No text overflow
  - [ ] No images stretching
  - [ ] Responsive classes used (sm:, md:, lg:)

---

## References

- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Mobile-First Design](https://www.nngroup.com/articles/mobile-first-web-design/)
- [Touch Target Size Guidelines](https://www.smashingmagazine.com/2020/11/mobile-first-framework/)
- [Responsive Typography](https://www.nngroup.com/articles/responsive-web-design-typography/)
