---
applyTo: "frontend/DESIGN.md"
---

# Design System Management Skill

**Use this skill when:**
- Adding new design tokens (colors, sizes, spacing)
- Creating reusable UI components
- Updating DESIGN.md as the app evolves
- Auditing design system for inconsistencies
- Deciding: "Should I add a new token or use an existing one?"
- Deprecating unused design decisions
- Maintaining consistency as team grows

**Goal**: Keep the design system current, intentional, and useful.

---

## What is a Design System?

**Project DESIGN.md is a contract that says:**
- "Here are the colors we use and when"
- "Here are the font sizes and their purposes"
- "Here are the spacing values we follow"
- "Here are the components we reuse"
- "These are the rules we follow (the do's and don'ts)"

**Without DESIGN.md:**
- Every developer makes own choices
- Color palette drifts (5 blues instead of 1)
- Components diverge (button looks different in different pages)
- Design becomes inconsistent

**With DESIGN.md:**
- Single source of truth
- "Should I use 16px or 18px?" → DESIGN.md says 16px
- New developers understand visual rules
- Design evolves intentionally (not accidentally)

---

## Part 1: When to Add a Token

### Color Token

**Question**: "Should I add a new color to our design system?"

**Answer: NO most of the time. Use existing tokens.**

```
Existing: primary (blue), secondary (gray), destructive (red)

DON'T add:
- warning (orange) — use primary or secondary + icon
- success (green) — use primary + checkmark icon
- info (light blue) — use secondary + icon

DO add only:
- If genuinely new category (e.g., premium tier = gold)
- If exists in multiple places (not one-off)
- If documented in DESIGN.md first (before implementing)
```

**Process**:
1. Check DESIGN.md: Do existing tokens work?
2. Ask: Is this truly new, or a variant of existing?
3. If new: Add to DESIGN.md (document why)
4. Then update `tailwind.config.ts`
5. Commit both changes together

**Example: When to Add**

```markdown
## When I Added "premium" Color

Existed: primary (blue), secondary (gray)
Problem: Premium features need visual distinction (not just icon)
Solution: Added premium = gold (#F59E0B)

When to use:
- Premium badge on features
- Premium tier highlight
- Upgrade calls-to-action

When NOT to use:
- Primary actions (use primary blue)
- Secondary content (use gray)
```

### Typography Token

**Question**: "Do we need a new font size?"

**Answer: Very rarely.**

```
Existing: H1 (32px), H2 (20px), body (16px), caption (12px)

DON'T add:
- 28px (between H1 and H2 — confusing)
- 18px (between H2 and body — redundant)
- 14px body variant (use existing body or caption)

DO add only:
- If serves distinct purpose (e.g., large touch target = 18px)
- If used in multiple places (not one-off)
- If makes hierarchy clearer (not muddier)
```

**Process**:
1. Check DESIGN.md type scale
2. Use existing size that fits best
3. If different size needed: use weight instead (e.g., `text-base font-semibold`)
4. Only add if truly needed

**Example: Why We Don't Have 5 Type Sizes**

```
Question: My modal heading should be 28px (between H1 and H2)
Answer: NO. Use H1 (32px) or H2 (20px)

If H1 is too big:
  → Use H2 (20px) instead
  → Or use body (16px) font-bold

If H2 is too small:
  → Use H1 (32px) instead
  → Or use H2 with more top margin (add space)

Result: Stay within 3-4 size system. No 28px.
```

### Spacing Token

**Question**: "Can I use 12px gap instead of 8px or 16px?"

**Answer: NO. Stay on the grid.**

```
Established: 8px, 16px, 24px, 32px

DON'T use:
- 12px (not on grid)
- 10px (not on grid)
- 20px (not on grid)

DO use:
- 8px (tight)
- 16px (default)
- 24px (comfortable)
- 32px (generous)
- 48px (extra generous)
```

**Why?**
- 8px grid is foundation (all other sizes build on it)
- Rhythm and pattern emerge
- Professional appearance
- Easy for developers to predict

**If 12px "looks right":**
- Use 8px (might look tighter but correct)
- Use 16px (might look looser but correct)
- Adjust component size/padding instead
- Let layout rhythm matter more than pixel-perfect

```tsx
// ❌ WRONG: 12px (off-grid)
<div className="gap-3">

// ✅ RIGHT: Stay on grid (8px or 16px)
<div className="gap-2">  {/* 8px */}
<div className="gap-4">  {/* 16px */}
```

---

## Part 2: When to Create a Component

**Question**: "Should I make this a reusable component, or build it inline?"

### The Decision Tree

```
Is this used in:
  ├─ One page only?
  │  └─ → Build inline (maybe extract later)
  │
  ├─ Two pages?
  │  └─ → Consider component (will be used 3x eventually)
  │
  └─ Three+ places?
     └─ → Make component, add to DESIGN.md
```

### Reusable Component Checklist

Before extracting to component, verify:

- [ ] Used in 2+ places (proven reusability)
- [ ] Clear props interface (not 10 optional props)
- [ ] Consistent styling (not wildly customizable)
- [ ] Documented in DESIGN.md
- [ ] Variants are clear (primary vs secondary, not size variants)

### Avoid Over-Abstraction

**Don't** make components too generic:

```tsx
// ❌ WRONG: Tries to do too much
<Box bg={color} p={padding} size={size} variant={variant} transform={transform}>
  Too flexible, confusing to use
</Box>

// ✅ RIGHT: Clear, single purpose
<Card>Displays project info</Card>
<Button variant="primary">Calls action</Button>
<Badge>Shows status</Badge>
```

---

## Part 3: Evolving DESIGN.md

As your app grows, DESIGN.md should grow with it.

### When to Update DESIGN.md

**ADD to DESIGN.md when:**
- You add a new component to the codebase (add to component section)
- You add a new token (document it with usage rules)
- You create a new pattern (form layout, card style, etc.)
- You deprecate an old pattern (mark as deprecated)

**UPDATE DESIGN.md when:**
- Token values change (e.g., primary color changes)
- Component patterns shift (e.g., button sizes change)
- Accessibility requirements change
- Responsive breakpoints adjust

**Example: Adding New Component**

```markdown
### New: Tag Component

**When to use**: Show labels, skills, categories

**Variants**:
- Primary: Blue background, white text
- Secondary: Gray background, dark text
- Outline: No background, border only

**Code**:
<Tag variant="primary">Feature</Tag>
<Tag variant="secondary">bug</Tag>

**Accessibility**:
- If clickable: Use <button> with aria-label
- If static: Use <span> (not clickable)
```

### Deprecation Pattern

When phasing out old patterns:

```markdown
### Deprecated: Old Badge Component

**Status**: Deprecated as of v2.0 (use Tag instead)

**Old code**:
<Badge variant="pill">Label</Badge>

**New code**:
<Tag variant="primary">Label</Tag>

**Migration**:
1. Replace Badge with Tag
2. "pill" variant → Tag with small size
3. Update styles: Badge used red, Tag uses primary
```

---

## Part 4: Design System Audit

Periodically audit your design system:

### Audit Checklist

- [ ] **Colors**
  - [ ] All used? (Remove unused)
  - [ ] Consistent? (Don't have 3 blues)
  - [ ] Sufficient? (All needs covered)
  
- [ ] **Typography**
  - [ ] All sizes used? (Remove unused)
  - [ ] Hierarchy clear? (Size differences obvious)
  - [ ] Consistent? (No 28px that shouldn't be 20px or 32px)
  
- [ ] **Spacing**
  - [ ] All multiples of 8px? (Code review for off-grid values)
  - [ ] Pattern clear? (8, 16, 24, 32...)
  - [ ] Applied consistently? (Card padding vs section gaps)
  
- [ ] **Components**
  - [ ] Used? (Remove unused components)
  - [ ] Documented? (DESIGN.md has usage rules)
  - [ ] Consistent? (Button in one page matches another)
  
- [ ] **Patterns**
  - [ ] Form pattern clear? (label + input + error structure)
  - [ ] Card pattern clear? (padding, border, shadow)
  - [ ] List pattern clear? (spacing, dividers)

### Audit Process

```
1. List all colors in use (grep codebase)
2. Cross-reference with DESIGN.md
3. Remove unused, add missing
4. Repeat for typography, spacing

1. List all components
2. Check: used 1x or 2x? → consider removing
3. Check: used 3x+ but not in DESIGN.md? → add it

Result: DESIGN.md matches reality
```

---

## Part 5: Adding to Tailwind Config

When you add a new token to DESIGN.md, update `tailwind.config.ts`:

### Color Token Example

**In DESIGN.md:**
```markdown
## Colors

| Name | Hex | Use |
|------|-----|-----|
| Premium | #F59E0B | Premium features |
```

**In tailwind.config.ts:**
```typescript
theme: {
  colors: {
    primary: 'hsl(212 95% 58%)',      // Blue
    premium: 'hsl(38 92% 50%)',       // Gold (NEW)
  }
}
```

**In code:**
```tsx
<div className="text-premium">Premium feature</div>
<button className="bg-premium text-white">Upgrade</button>
```

### Typography Token Example

**In DESIGN.md:**
```markdown
## Typography

| Level | Size | Use |
|-------|------|-----|
| H1 | 32px | Page title |
| H2 | 20px | Section heading |
| Body | 16px | Paragraph text |
```

**In tailwind.config.ts:**
```typescript
theme: {
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '32px',
  }
}
```

**In code:**
```tsx
<h1 className="text-2xl">Page Title</h1>
<h2 className="text-xl">Section</h2>
<p className="text-base">Body text</p>
```

---

## Part 6: Common Mistakes

### ❌ Mistake 1: Design System Becomes Too Flexible

**Wrong Approach:**
```tsx
// Too many options
<Button 
  variant="primary" | "secondary" | "ghost" | "outline" | "text" | "link"
  size="xs" | "sm" | "md" | "lg" | "xl"
  disabled={bool}
  loading={bool}
  icon={icon}
  ...
/>
```

**Problem**: 5 × 6 = 30 possible combinations. Developers confused. Not consistent.

**Right Approach**:
```tsx
// Limited, intentional options
<Button 
  variant="primary" | "secondary" | "ghost"  // 3 options
  disabled={bool}
/>
```

**Lesson**: Constraint = better design. Limited options force consistency.

### ❌ Mistake 2: Design System Not Documented

**Wrong**: DESIGN.md has colors but not rules

```markdown
## Colors
- Primary: Blue
- Secondary: Gray
- Destructive: Red
```

**Problem**: Developers don't know WHEN to use each. Colors end up scattered.

**Right**: DESIGN.md explains usage

```markdown
## Colors

| Name | Use |
|------|-----|
| Primary | Main CTAs (Create, Save, Login) |
| Secondary | Optional actions, secondary text |
| Destructive | Errors, delete actions ONLY |

**RULE**: Max 2 colors per view (primary + one other)
**RULE**: Color always indicates meaning (not decoration)
```

### ❌ Mistake 3: DESIGN.md Gets Out of Sync

**Problem**: DESIGN.md says "16px body" but code uses "14px"

**Prevention**:
- Review DESIGN.md in every code review
- Update DESIGN.md when adding new patterns
- Audit design system quarterly
- Link to DESIGN.md in instructions

**Solution if Out of Sync**:
```
1. Run audit: grep -r "text-sm" src/ | wc -l
   (Count how many violations exist)
2. Decide: Fix code or update DESIGN.md?
3. Update DESIGN.md to match reality
4. Commit with message: "Audit: align DESIGN.md with codebase"
```

---

## Part 7: Design System Versioning

As app scales, design system may versioning:

### Versioning Pattern

```
Version 1.0 (MVP):
- 3 colors (primary, secondary, destructive)
- 4 type sizes (H1, H2, body, caption)
- 4 spacing sizes (8, 16, 24, 32px)
- 3 components (Button, Card, Input)

Version 1.1 (Growth):
- Add new component (Form, Modal)
- Add new color (maybe)
- No breaking changes

Version 2.0 (Major Update):
- Redesign brand
- New color palette
- New typography scale
- Breaking changes documented
```

### Breaking Change Example

```markdown
## Design System v2.0 Migration Guide

### Colors Changed
- Old primary (blue #3B82F6) → New primary (teal #14B8A6)
- Old secondary (gray) → removed, use foreground/muted instead

### Typography Changed
- Old: 5 sizes → New: 3 sizes
- Old body (16px) → stays same
- Old H1 (32px) → stays same
- Old H3 (18px) → removed, use H2 + smaller container

### Migration Steps
1. Update tailwind.config.ts
2. Search/replace old class names
3. Review each page visually
4. Commit with message: "Upgrade to design system v2.0"
```

---

## Maintenance Checklist

Keep design system healthy:

- [ ] **Monthly**: Review new colors in code (any off-palette?)
- [ ] **Monthly**: Review new font sizes (any off-scale?)
- [ ] **Quarterly**: Full audit (colors, sizes, spacing, components)
- [ ] **Quarterly**: Update DESIGN.md if needed
- [ ] **Annually**: Consider design system refresh (new brand direction?)
- [ ] **Every PR**: Check DESIGN.md adherence in code review

---

## Resources

- [Design Systems Thinking](https://www.designsystems.com/)
- [Living Style Guides](https://alistapart.com/article/creating-style-guides/)
- [Design Tokens](https://www.figma.com/blog/design-tokens/)
- [Component Patterns](https://www.smashingmagazine.com/design-patterns-ebooks/)
