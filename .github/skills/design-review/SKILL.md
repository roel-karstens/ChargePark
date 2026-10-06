---
applyTo: "frontend/**/*.{ts,tsx}"
---

# Design Review Skill

**Use this skill when:**
- After implementing a UI component or page (before `verify-and-ship`)
- Before shipping any new UI (design review step)
- To audit existing UI for visual quality issues
- To identify why UI looks "generic" or "wrong"
- To ensure consistency with project's DESIGN.md
- To evaluate visual hierarchy, spacing, typography, and accessibility

**Goal**: Systematically evaluate UI against design principles and catch visual quality issues that code review alone won't find.

---

## The Design Review Workflow

### When to Review

**REQUIRED before shipping:**
- New page or major component
- Redesign of existing UI
- Multi-component feature

**OPTIONAL but recommended:**
- Button variant or simple component
- Bug fixes (if they affect appearance)

**The Goal**: Find issues like:
- ❌ Inconsistent spacing (not 8px multiples)
- ❌ Visual hierarchy broken (buttons same size as labels)
- ❌ Colors not from design system
- ❌ Focus states missing or invisible
- ❌ Responsive broken on mobile/tablet
- ❌ Empty/loading/error states missing
- ❌ Touch targets too small (< 44px)
- ❌ Contrast too low (< 4.5:1)

### The Review Process

```
1. CHECK: Does project have DESIGN.md?
2. AUDIT: Visual hierarchy, spacing, colors
3. VERIFY: Responsive behavior (mobile/tablet/desktop)
4. TEST: Keyboard navigation and focus states
5. IDENTIFY: Issues and their severity
6. RECOMMEND: Specific fixes with examples
```

---

## Part 1: Pre-Review Checklist

Before deep-diving, confirm the basics:

**Code Quality** (required):
- [ ] No TypeScript errors
- [ ] ESLint passes
- [ ] No hardcoded colors or sizes (only Tailwind classes)
- [ ] All interactive elements have semantic HTML (`<button>`, `<label>`, `<input>`)

**Project Setup** (required):
- [ ] Project has DESIGN.md (or use DESIGN.md.template)
- [ ] tailwind.config.ts defines design tokens
- [ ] frontend/src/index.css has @layer components

**Responsive Setup** (required):
- [ ] Code uses Tailwind responsive prefixes (sm:, md:, lg:)
- [ ] Mobile-first approach (base styles for mobile, add complexity)
- [ ] No hardcoded widths (use Tailwind max-w, w-full)

---

## Part 2: Visual Hierarchy Audit

**Question**: Do size, weight, color, and spacing clearly communicate importance?

### Checklist

#### Headings & Text

- [ ] Heading uses H1/H2/H3 (not all body text)
- [ ] H1 significantly larger than H2, H2 > H3
- [ ] Body text is 16px base (readable)
- [ ] Secondary text is noticeably grayed (muted color)
- [ ] Emphasis (bold, color) matches importance

**Issues to spot:**
- ❌ All text same size → no hierarchy
- ❌ H1 = 24px, H2 = 20px (difference too small)
- ❌ Body text = 14px (too small, hard to read)

**Fix Pattern:**
```tsx
// ❌ WRONG: All same size
<p>Project Name</p>
<p>Description text here</p>

// ✅ RIGHT: Clear hierarchy
<h2 className="text-xl font-semibold">Project Name</h2>
<p className="text-sm text-muted-foreground">Description text</p>
```

#### Buttons & Actions

- [ ] Primary action (CTA) is visually prominent
- [ ] Secondary action is noticeably less prominent
- [ ] Disabled state clearly indicates non-interactive
- [ ] All buttons on same row have similar visual weight (if equal importance)

**Issues to spot:**
- ❌ Cancel button same size as Save (confusing intent)
- ❌ Disabled button not obviously disabled (no opacity change)
- ❌ Too many primary buttons (conflicting CTAs)

**Fix Pattern:**
```tsx
// ❌ WRONG: Can't tell which matters
<button className="btn-primary">Maybe Important</button>
<button className="btn-secondary">Maybe Important</button>

// ✅ RIGHT: Clear visual hierarchy
<button className="btn-primary">Save Project</button>
<button className="btn-secondary">Cancel</button>
```

#### Color Usage

- [ ] Primary color used only for main actions (not scattered)
- [ ] Destructive (red) used only for delete/error (not casual)
- [ ] Color conveys meaning (blue = action, red = error, gray = disabled)
- [ ] At most 2-3 colors in single view (plus white/gray)

**Issues to spot:**
- ❌ Multiple blue buttons (looks like all primary)
- ❌ Red used for warnings (should be orange or yellow)
- ❌ Too many different colors (rainbow effect)

**Fix Pattern:**
```tsx
// ❌ WRONG: Colorful but confusing
<button className="bg-blue-500">Action 1</button>
<button className="bg-green-500">Action 2</button>
<button className="bg-purple-500">Action 3</button>

// ✅ RIGHT: Clear color meaning
<button className="btn-primary">Primary Action</button>
<button className="btn-secondary">Secondary Action</button>
<button className="bg-destructive">Delete</button>
```

---

## Part 3: Spacing & Composition Audit

**Question**: Are gaps, padding, and layout consistent with 8px grid?

### Checklist

#### Gaps & Padding

- [ ] All padding/margin are 8px multiples (8, 16, 24, 32, 48)
- [ ] Gaps between items are consistent (e.g., all 16px or all 24px)
- [ ] No awkward spacing like 13px or 18px
- [ ] Card padding matches design system (typically 24px)
- [ ] Section margins create breathing room (32px+ between sections)

**How to spot issues:**
- Look at Tailwind classes: `p-3` (12px), `gap-2.5` (10px) = wrong
- Check browser DevTools: Inspect element → Computed styles → margins/padding
- Use browser grid overlay (if available) to visualize alignment

**Issues to spot:**
- ❌ `p-3 gap-2.5 mb-1.5` (not 8px multiples)
- ❌ Card has `p-4` (16px) when design says 24px
- ❌ Section gaps vary (some 16px, some 24px, some 32px)

**Fix Pattern:**
```tsx
// ❌ WRONG: Arbitrary spacing
<div className="p-3 mb-1.5">
  <input className="mb-2.5" />
  <button className="mt-3" />
</div>

// ✅ RIGHT: 8px multiples
<div className="p-6 mb-6">
  <input className="mb-4" />
  <button className="mt-4" />
</div>
```

#### Alignment & Density

- [ ] Elements align to a grid (visual alignment, not random)
- [ ] Information density is moderate (not cramped, not sparse)
- [ ] Whitespace serves a purpose (groups related items)
- [ ] Lists have consistent item spacing
- [ ] Grid cards have consistent gaps between them

**Issues to spot:**
- ❌ One card has 16px padding, another has 20px (inconsistent)
- ❌ Project cards crowded (no space to breathe)
- ❌ Grid gap = 12px on mobile, 16px on tablet (should be consistent at given breakpoint)

**Fix Pattern:**
```tsx
// ❌ WRONG: Inconsistent spacing
<div className="space-y-3">
  <Card className="p-4" />
  <Card className="p-6" />  ← Different padding!
</div>

// ✅ RIGHT: Consistent spacing
<div className="space-y-4">
  <Card className="p-6" />
  <Card className="p-6" />
</div>
```

---

## Part 4: Typography Audit

**Question**: Does typography follow the system? Are sizes, weights, and line-height consistent?

### Checklist

#### Font Scale

- [ ] Page title (H1) = 32px (2xl)
- [ ] Section heading (H2) = 20px (xl)
- [ ] Subheading (H3) = 18px (lg)
- [ ] Body text = 16px (base)
- [ ] Small text (help, metadata) = 14px (sm)
- [ ] Captions = 12px (xs)
- [ ] No arbitrary sizes (15px, 22px, etc.)

**Issues to spot:**
- ❌ Heading = 24px (between 2xl and xl; not standard)
- ❌ Body text = 14px (should be 16px)
- ❌ Mix of 16px and 15px in same component

**Fix Pattern:**
```tsx
// ❌ WRONG: Arbitrary sizes
<h1 className="text-3xl">Title</h1>
<p className="text-lg">Body</p>  ← Should be text-base
<span className="text-sm">Help</span>

// ✅ RIGHT: From design system
<h1 className="text-2xl font-bold">Title</h1>
<p className="text-base">Body</p>
<span className="text-xs text-muted-foreground">Help</span>
```

#### Font Weight

- [ ] Headings are semibold (600) or bold (700), not normal (400)
- [ ] Body text is normal (400), not bold
- [ ] Emphasis (labels, strong text) is semibold (600)
- [ ] No mixing weights for similar-importance items

**Issues to spot:**
- ❌ Heading = normal weight (looks like body text)
- ❌ Body text = semibold (too heavy, creates visual noise)

**Fix Pattern:**
```tsx
// ❌ WRONG: Wrong weights
<h2 className="text-xl font-normal">Heading</h2>  ← Too light
<p className="text-base font-semibold">Body text</p>  ← Too heavy

// ✅ RIGHT: Proper weights
<h2 className="text-xl font-semibold">Heading</h2>
<p className="text-base font-normal">Body text</p>
```

#### Line Height & Text Width

- [ ] Body text line-height = 1.5 (150%)
- [ ] Line length ≤ 65 characters (readability)
- [ ] Headings line-height = 1.2 (120%)

**Issues to spot:**
- ❌ Single-column text goes full page width (hard to read)
- ❌ Paragraph line-height too tight (lines squished)

**Fix Pattern:**
```tsx
// ❌ WRONG: Full width, hard to read
<div className="w-full">
  <p className="leading-tight">Body text</p>
</div>

// ✅ RIGHT: Constrained width, good line-height
<div className="max-w-prose">
  <p className="text-base leading-relaxed">Body text</p>
</div>
```

---

## Part 5: Color & Contrast Audit

**Question**: Do colors come from the design system? Is contrast adequate?

### Checklist

#### Color System Usage

- [ ] All colors are from design tokens (in tailwind.config.ts)
- [ ] No hardcoded hex colors in components (use Tailwind classes)
- [ ] Primary (blue) used for main actions only
- [ ] Destructive (red) used for errors/delete only
- [ ] Muted gray used for secondary text
- [ ] No arbitrary colors like `bg-purple-300`

**Issues to spot:**
- ❌ `className="bg-blue-400"` (not from design system)
- ❌ `style={{ color: '#1234AB' }}` (hardcoded)
- ❌ Multiple blues (primary at 50%, another at 100%)

**Fix Pattern:**
```tsx
// ❌ WRONG: Arbitrary colors
<button className="bg-blue-400 text-white">Action</button>
<p className="text-blue-300">Text</p>

// ✅ RIGHT: From design system
<button className="btn-primary">Action</button>
<p className="text-muted-foreground">Text</p>
```

#### Contrast Ratio

- [ ] Body text on background ≥ 4.5:1 (WCAG AA)
- [ ] Large text (18px+) on background ≥ 3:1 (WCAG AA)
- [ ] All text readable in grayscale (not color-only)

**How to test:**
1. Use WebAIM Contrast Checker (https://webaim.org/resources/contrastchecker/)
2. Or use browser DevTools: Inspect element → Styles → run Contrast check
3. Input foreground color and background color
4. Check ratio ≥ 4.5:1

**Issues to spot:**
- ❌ `text-gray-400` on white (contrast = 2.8:1, too low)
- ❌ `text-primary` on `bg-secondary` (need to verify ratio)
- ❌ Color-only indication (red text without icon or label)

**Fix Pattern:**
```tsx
// ❌ WRONG: Low contrast
<p className="text-gray-400">Secondary text</p>

// ✅ RIGHT: Adequate contrast
<p className="text-muted-foreground">Secondary text</p>  ← From design tokens
```

---

## Part 6: Focus State & Keyboard Navigation Audit

**Question**: Are all interactive elements keyboard-accessible with visible focus?

### Checklist

#### Focus States

- [ ] All buttons have visible focus ring (2px blue outline)
- [ ] All inputs have visible focus ring (blue ring, not just underline)
- [ ] All links have visible focus state
- [ ] Focus ring is offset (not hidden behind element)
- [ ] Focus ring is NEVER removed with `outline-none` alone

**How to test:**
1. Open browser DevTools
2. Press Tab repeatedly
3. Watch for visible focus ring on each element
4. All interactive elements must show focus

**Issues to spot:**
- ❌ `outline-none` without `focus:ring-2` (focus invisible)
- ❌ Focus ring barely visible (low contrast color)
- ❌ Focus ring hidden behind element (no offset)
- ❌ Some buttons focused, others not (inconsistent)

**Fix Pattern:**
```tsx
// ❌ WRONG: No focus ring
<button className="px-4 py-2 bg-blue-500 text-white">Click me</button>
<input className="border border-gray-300" />

// ✅ RIGHT: Visible focus rings
<button className="btn-primary focus:ring-2 focus:ring-offset-2">Click me</button>
<input className="input" />  ← Already has focus:ring-2
```

#### Keyboard Navigation

- [ ] Tab through page moves focus in logical order (left-to-right, top-to-bottom)
- [ ] No elements skipped (all interactive elements focusable)
- [ ] No focus trap (focus can escape all sections)
- [ ] Buttons activate with Space or Enter
- [ ] Forms fill in logical order

**How to test:**
1. Press Tab to move forward
2. Press Shift+Tab to move backward
3. Verify order is logical
4. No jumps or missing elements

**Issues to spot:**
- ❌ Tab order jumps around (confusing)
- ❌ Interactive div not focusable (should use `<button>`)
- ❌ Modal doesn't trap focus (can tab behind it)

**Fix Pattern:**
```tsx
// ❌ WRONG: Not focusable
<div onClick={handleClick} className="cursor-pointer">Delete</div>

// ✅ RIGHT: Proper semantic HTML
<button onClick={handleClick}>Delete</button>
```

---

## Part 7: Responsive Design Audit

**Question**: Does the UI work well on mobile (375px), tablet (768px), and desktop (1024px+)?

### Checklist

#### Mobile (375px)

- [ ] Single column layout (not multi-column)
- [ ] Text readable without horizontal scroll
- [ ] Buttons and touch targets ≥ 44px tall
- [ ] Font size ≥ 16px (prevents auto-zoom on iOS)
- [ ] Padding appropriate (not cramped)
- [ ] Images scale to 100% width (no overflow)

**How to test:**
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Set viewport to 375px width
4. No horizontal scrollbars should appear

**Issues to spot:**
- ❌ Multi-column grid on mobile (should stack)
- ❌ Buttons `h-8` (32px, too small for touch)
- ❌ Text `text-sm` (14px, may trigger auto-zoom)
- ❌ Overflow-x due to full-width elements

**Fix Pattern:**
```tsx
// ❌ WRONG: Grid on mobile
<div className="grid grid-cols-3 gap-4">
  <Card />
  <Card />
  <Card />
</div>

// ✅ RIGHT: Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card />
  <Card />
  <Card />
</div>
```

#### Tablet (768px)

- [ ] Two-column or three-column layout begins
- [ ] Spacing increases (more breathing room)
- [ ] Sidebar appears (if applicable)
- [ ] No awkward gaps or wrapping

**Issues to spot:**
- ❌ Still single column (should have md: breakpoint changes)
- ❌ Gaps change inconsistently (some 16px, some 24px)

#### Desktop (1024px+)

- [ ] Full multi-column layout
- [ ] Max-width container prevents excessive line length
- [ ] All features available
- [ ] Hover states work well

**Issues to spot:**
- ❌ No max-width (text goes to screen edge, hard to read)
- ❌ Awkward spacing on wide screens

**Fix Pattern:**
```tsx
// ✅ CORRECT: Responsive with max-width
<div className="max-w-4xl mx-auto">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {items.map(item => <Card key={item.id}>{item}</Card>)}
  </div>
</div>
```

---

## Part 8: Component State Audit

**Question**: Are empty, loading, error, and success states handled?

### Checklist

#### Empty State

- [ ] Empty list shows friendly message (not blank page)
- [ ] Icon or illustration present (optional but good)
- [ ] Call-to-action button visible (e.g., "Create first project")
- [ ] Message explains what should be here

**Example**:
```tsx
{projects.length === 0 ? (
  <div className="text-center py-8">
    <p className="text-lg font-semibold mb-2">No projects yet</p>
    <p className="text-sm text-muted-foreground mb-4">Create your first project to get started</p>
    <button className="btn-primary">Create Project</button>
  </div>
) : (
  <ProjectList projects={projects} />
)}
```

#### Loading State

- [ ] Loading indicator visible (spinner, text, or skeleton)
- [ ] Submit button disabled (no double-submit)
- [ ] Form inputs disabled during submission
- [ ] Clear "Loading..." message

**Example**:
```tsx
<button 
  className="btn-primary" 
  disabled={isLoading}
>
  {isLoading ? 'Creating...' : 'Create'}
</button>
```

#### Error State

- [ ] Error message displayed (not silent failure)
- [ ] Message is red and clear
- [ ] Error positioned near the field (form errors)
- [ ] User can retry or fix the issue

**Example**:
```tsx
{error && <div className="error">{error}</div>}
<button onClick={retry} className="btn-secondary">Try Again</button>
```

#### Success State

- [ ] Success message shown (toast, banner, or message)
- [ ] Visual confirmation (green color, checkmark icon)
- [ ] Message disappears after 3-5 seconds (or stays if important)

**Example**:
```tsx
{success && (
  <div className="success">✓ Project created successfully</div>
)}
```

---

## Part 9: Accessibility Audit

**Question**: Can users navigate and understand the UI without sight?

### Checklist

#### Semantic HTML

- [ ] Buttons use `<button>` (not `<div onclick>`)
- [ ] Links use `<a href>` (not `<div onclick>`)
- [ ] Form fields use `<input>`, `<textarea>`, `<select>`
- [ ] Labels use `<label htmlFor="id">`
- [ ] Headings use `<h1>`, `<h2>`, `<h3>` (never skip levels)

**Issues to spot:**
- ❌ `<div onClick={delete} className="cursor-pointer">Delete</div>`
- ❌ No `<label>` associated with inputs
- ❌ `<h1>`, then `<h3>` (missing `<h2>`)

**Fix Pattern:**
```tsx
// ❌ WRONG: Not semantic
<div onClick={handleDelete} className="cursor-pointer">Delete</div>

// ✅ RIGHT: Semantic
<button onClick={handleDelete}>Delete</button>
```

#### ARIA Labels

- [ ] Icon buttons have `aria-label` (e.g., "Delete project")
- [ ] Form fields with help text have `aria-describedby`
- [ ] Dynamic errors have `role="alert"`
- [ ] Modals have `role="dialog"` and are labeled

**Issues to spot:**
- ❌ `<button><Trash2 /></button>` (icon only, no label)
- ❌ Help text not associated with input
- ❌ Error appears but not announced to screen readers

**Fix Pattern:**
```tsx
// ❌ WRONG: No ARIA
<button><Trash2 size={16} /></button>

// ✅ RIGHT: ARIA label
<button aria-label="Delete project">
  <Trash2 size={16} />
</button>
```

#### Color Contrast (See Part 5)

- [ ] All text meets 4.5:1 contrast ratio
- [ ] Meaning not conveyed by color alone (use icons, text labels)

---

## Part 10: Common Issues Checklist

Quick reference for the most common visual problems:

- [ ] ❌ **Inconsistent spacing** (not 8px multiples) → Fix: Use Tailwind p-4, p-6, gap-4
- [ ] ❌ **Missing focus states** → Fix: Add `focus:ring-2 focus:ring-offset-2` to buttons/inputs
- [ ] ❌ **Wrong text color** (hardcoded, not from design) → Fix: Use `text-muted-foreground`, `text-destructive`
- [ ] ❌ **All buttons look the same** → Fix: Use `.btn-primary`, `.btn-secondary`, `.btn-ghost`
- [ ] ❌ **Touch targets too small** (< 44px) → Fix: Increase padding/height
- [ ] ❌ **No empty state message** → Fix: Show "No items yet" when list empty
- [ ] ❌ **Form doesn't show errors** → Fix: Render error message below input
- [ ] ❌ **No loading feedback** → Fix: Disable button, show "Saving..." text
- [ ] ❌ **Mobile layout broken** → Fix: Add `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- [ ] ❌ **Text too small** (14px or less) → Fix: Use `text-base` (16px)
- [ ] ❌ **Heading hierarchy broken** → Fix: Use `text-2xl` (H1), `text-xl` (H2), `text-lg` (H3)
- [ ] ❌ **No keyboard navigation** → Fix: Use `<button>`, `<a>`, `<input>` (not `<div onclick>`)
- [ ] ❌ **Low contrast text** → Fix: Verify 4.5:1 ratio, use darker colors
- [ ] ❌ **Responsive design ignored** → Fix: Add `md:` and `lg:` prefixes
- [ ] ❌ **ARIA labels missing** → Fix: Add `aria-label` to icon buttons

---

## How to Report Issues

When you find a design problem, identify:

1. **What's wrong** (specific issue, not "looks bad")
2. **Where** (component name, which page)
3. **Why** (which design principle violated)
4. **Severity** (BLOCKER / HIGH / MEDIUM / LOW)

**Example Report:**

> **Issue**: Missing focus ring on "Delete" button
> **Location**: ProjectList.tsx, line 42
> **Why**: Violates accessibility (keyboard nav needs focus)
> **Severity**: BLOCKER
> **Fix**: Add `focus:ring-2 focus:ring-offset-2` to button class

---

## When to Use This Skill

**This skill is invoked:**
- After implementing a new component or page (before `verify-and-ship`)
- When reviewing existing UI (audit for issues)
- When UI looks "off" but code is correct (identify why)
- Before shipping (final design review)

**Related skills:**
- **Frontend-Design**: Principles and patterns (design guidance)
- **Verification**: Functional verification (does it work?)
- **This**: Visual verification (does it look good?)

Use all three for complete quality assurance.
