# Design System - Project Management App

This document defines the visual design for the project management example application.

## Design Direction

**Brand Voice**: Modern & minimal. Clean, professional, approachable.

**Target Audience**: Teams and individuals managing projects (startups, small teams, freelancers)

**Visual Identity**: Blue-accent, clean white space, simple grid layouts. Focus on clarity over decoration.

**Avoid**: Gradients, decorative elements, icon overload, excessive cards

## Design Tokens

All tokens are defined in `tailwind.config.ts` and used via Tailwind classes.

### Colors

| Semantic | Color | Hex | HSL | Use |
|----------|-------|-----|-----|-----|
| primary | Blue | #3B82F6 | hsl(212 95% 58%) | Main actions, focus rings |
| primary-foreground | Very light | #F8FAFC | hsl(210 40% 98%) | Text on primary |
| secondary | Light gray | #F1F5F9 | hsl(210 40% 96%) | Secondary bg, buttons |
| destructive | Red | #E85D75 | hsl(0 84% 60%) | Delete, errors |
| border | Gray | #E5E7EB | hsl(214 31.8% 91.4%) | Borders, dividers |
| background | White | #FFFFFF | hsl(0 0% 100%) | Page bg |
| foreground | Dark gray | #0F172A | hsl(212 12% 3.9%) | Body text |
| muted | Light gray | #F1F5F9 | hsl(210 40% 96%) | Disabled, secondary text |

**Usage**:
- Primary for CTAs (Create, Save, Sign In)
- Secondary for optional actions (Cancel)
- Destructive only for Delete
- Max 2-3 colors per view

### Typography

- **H1 (Page Title)**: 32px, bold (700)
- **H2 (Section)**: 20px, semibold (600)
- **H3 (Subsection)**: 18px, semibold (600)
- **Body**: 16px, normal (400)
- **Body Small**: 14px, normal (400)
- **Caption**: 12px, normal (400)

**Line Height**: 1.5 for body, 1.2 for headings

**Font**: System stack: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif`

### Spacing (8px Grid)

All spacing in 8px multiples:
- 8px - Tight (rarely used)
- 16px - Default
- 24px - Comfortable
- 32px - Generous
- 48px - Section level

### Border Radius

- **sm**: 4px - Small elements
- **md**: 6px - Buttons, inputs
- **lg**: 8px - Cards, containers

### Shadows

- Light: Cards (subtle depth)
- None: Most elements (flat design)

## Components

### Buttons

**Variants**:

1. **Primary** (`.btn-primary`)
   - Use for: Main CTA (Create, Save, Sign In)
   - Background: Blue
   - Text: White
   - State: Hover = 90% opacity, Disabled = 50% opacity
   - Focus: 2px blue ring with 2px offset

2. **Secondary** (`.btn-secondary`)
   - Use for: Optional actions (Cancel, Clear)
   - Background: Light gray
   - Border: Gray
   - State: Hover = darker gray, Disabled = 50% opacity
   - Focus: 2px blue ring with 2px offset

3. **Ghost** (`.btn-ghost`)
   - Use for: Minimal actions (Learn more, Help)
   - Background: None
   - Text: Blue
   - State: Hover = light gray bg, Disabled = 50% opacity
   - Focus: 2px blue ring with 2px offset

**Sizes**:
- Default: 10px 16px padding (used everywhere)

### Inputs

**Styles** (`.input` class):
- Border: 1px gray
- Padding: 12px
- Focus: 2px blue ring, no outline
- Disabled: 50% opacity
- Placeholder: Muted gray

**Pattern**:
```tsx
<label htmlFor="name" className="label">Project Name</label>
<input id="name" type="text" className="input" placeholder="My project..." />
```

### Cards

**Style** (`.card` class):
- Background: White
- Border: 1px gray
- Radius: 8px
- Padding: 24px
- Shadow: Light (subtle)

**Use for**: Grouping content (project details, sections)

### Forms

**Field Spacing**:
- Gap between fields: 16px (`space-y-4`)
- Gap between label and input: 6px (in label style)
- Error message below input in red

**Pattern**:
```tsx
<div className="space-y-4">
  <div>
    <label htmlFor="name" className="label">Field Label</label>
    <input id="name" className="input" />
  </div>
  <div>
    <label htmlFor="desc" className="label">Description</label>
    <textarea id="desc" className="input" />
  </div>
</div>
```

## States

### Empty State
- Centered message with optional icon
- Message: "No projects yet"
- Action: Button to create first item
- Padding: `py-8` for vertical centering

### Loading State
- Form inputs disabled
- Button shows "Saving..." text
- No spinner (too decorative)

### Error State
- Red text (`text-destructive` or `.error` class)
- Positioned below field
- Keep input value (user can edit and retry)
- Example: "Project name is required"

### Success State
- Green checkmark (optional)
- Message: "Project created"
- Auto-dismiss after 3 seconds (optional)

## Responsive Behavior

### Breakpoints

| Device | Width | Grid | Changes |
|--------|-------|------|---------|
| Mobile | 375px | 1 column | Stack cards, full width |
| Tablet | 768px | 2 columns | Two-column grid |
| Desktop | 1024px+ | 3 columns | Three-column grid |

### Rules

- **Mobile First**: Design for mobile, enhance for larger screens
- **Touch Targets**: All buttons ≥ 44px tall (our buttons have padding for this)
- **Text Width**: Max 65 characters per line
- **Spacing**: Scales with breakpoint:
  - Mobile: `gap-4` (16px)
  - Tablet: `gap-4` (consistent)
  - Desktop: `gap-4` (consistent)

### Example

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {projects.map(project => (
    <Card key={project.id}>
      {/* Card content */}
    </Card>
  ))}
</div>
```

## Accessibility

### Keyboard Navigation

- All actions via keyboard
- Tab order: logical (left-to-right, top-to-bottom)
- Focus visible on all interactive elements (blue ring)

### Semantic HTML

```tsx
<button>Action</button>           // Not <div onClick>
<label htmlFor="id">Label</label>  // Never orphan labels
<input type="text" id="id" />      // Associated with label
<a href="/path">Link</a>           // For navigation
```

### Focus States

- **Required**: All buttons, inputs, links must show focus ring
- **Style**: 2px blue outline, 2px offset (automatic via `.btn-*` and `.input` classes)
- **Test**: Tab through page, all elements must show focus

### ARIA Labels

- Icon buttons must have `aria-label`:
  ```tsx
  <button aria-label="Delete project">
    <Trash2 size={16} />
  </button>
  ```

### Color Contrast

- All text ≥ 4.5:1 contrast (design tokens guarantee this)
- Meaning not conveyed by color alone (use icons, labels)

## Do's and Don'ts

### ✅ DO

- Use design token colors (primary, secondary, destructive)
- Follow 8px grid for all spacing
- Use semantic HTML (`<button>`, `<label>`, `<input>`)
- Test keyboard navigation (Tab through page)
- Show loading/error/empty states
- Make interactive elements ≥ 44px tall
- Use consistent spacing between components

### ❌ DON'T

- Hardcode colors (use Tailwind classes)
- Use arbitrary spacing (10px, 13px, 18px)
- Use `<div onClick>` for actions (use `<button>`)
- Remove focus rings (never do `outline-none` alone)
- Mix button styles inconsistently
- Forget error states (users need feedback)
- Make buttons smaller than 44px
- Use more than 3 colors in one view

## Implementation Checklist

Before marking UI complete:

- [ ] All colors from design tokens (no hardcoded hex)
- [ ] All spacing is 8px multiples
- [ ] All headings use correct size (H1/H2/H3)
- [ ] Body text is 16px (readable)
- [ ] All buttons use `.btn-primary`, `.btn-secondary`, or `.btn-ghost`
- [ ] All inputs use `.input` class
- [ ] All interactive elements have visible focus rings
- [ ] Keyboard navigation works (Tab through page)
- [ ] Empty state message shown when list is empty
- [ ] Loading state disables form inputs
- [ ] Error state shows red message
- [ ] Mobile layout uses `grid-cols-1` (stacks)
- [ ] Tablet layout uses `md:grid-cols-2` or similar
- [ ] Desktop layout uses `lg:grid-cols-3` or similar
- [ ] ARIA labels on icon buttons
- [ ] Semantic HTML used throughout
- [ ] Contrast ≥ 4.5:1 for all text

## Questions?

Refer to [design-review skill](../../.github/skills/design-review/SKILL.md) for detailed visual quality guidelines.
