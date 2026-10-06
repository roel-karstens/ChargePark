# Frontend Design Skill

**Use this skill when:**
- Building new UI components or pages
- Improving visual design and user experience
- Designing responsive layouts
- Creating accessible interfaces
- Ensuring design consistency
- Reviewing component architecture for quality
- **Establishing design direction BEFORE coding** ⭐ NEW
- **Auditing existing UI for visual quality** ⭐ NEW

---

## Part 1: Design Direction (Before You Code)

**REQUIRED FIRST STEP**: Establish visual direction before writing any code.

### The Design Direction Workflow

Do NOT jump straight to implementation. Instead:

#### Step 1: Understand the Product Context

Ask yourself:
- What is this feature trying to accomplish?
- Who are the users?
- What's the brand personality? (professional? playful? modern? warm?)
- What problem does this solve?
- What emotions should users feel?

**Example**:
> Building a "Create Project" form for a project management app
> - Users: Small teams, individuals planning projects
> - Brand: Professional, clear, minimal
> - Goal: Make project creation fast and intuitive
> - Emotion: Confident, ready to start

#### Step 2: Review Project's DESIGN.md

**CRITICAL**: Every project must have a `DESIGN.md` that defines:
- Visual identity (brand voice, direction)
- Design tokens (colors, typography, spacing)
- Component patterns (buttons, forms, cards)
- Accessibility requirements
- Do's and don'ts

**Read it first.** Your UI must follow the design system.

If DESIGN.md doesn't exist:
1. Copy `DESIGN.md.template` from repository root
2. Fill in your project's design direction
3. Commit it
4. Use it as reference while building

**Example DESIGN.md section**:
```
## Design Direction
Brand Voice: Modern & minimal
Colors: Blue primary, gray neutral, red destructive
Typography: 16px body, 20px headings
Spacing: 8px grid (multiples of 8)
Components: Simple cards, clean buttons, no decorations
```

#### Step 3: Establish Visual Direction

**Before designing the form, answer:**

1. **Visual Hierarchy**
   - What should users see first? (probably the project name field)
   - What's secondary? (description, optional fields)
   - What's tertiary? (help text, cancel button)

2. **Component Choices**
   - Text input for project name? (or something else?)
   - Textarea for description?
   - Are there other input types needed?
   - What button variants for primary/secondary?

3. **Layout**
   - Vertical form (stacked fields)?
   - Two columns? (name left, description right?)
   - What spacing between fields?
   - Button at bottom or inline?

4. **Visual Style**
   - Use existing DESIGN.md tokens
   - Primary color for submit button? (yes)
   - Card container? (maybe)
   - Empty vs filled form? (consider initial state)

**Example Vision**:
```
Create Project Form:
- Heading: "Create New Project"
- Name field: Full width, required, focus first
- Description field: Full width, optional, larger
- Buttons: Primary (Create) on left, Secondary (Cancel) on right
- Styling: Inside .card with 24px padding
- States: Empty (no placeholder), Loading (disabled), Error (red message)
```

#### Step 4: Identify Patterns (New vs Existing)

**Questions**:
- Is this a new component type? (e.g., first form in the app?)
- Can I reuse an existing component? (e.g., existing Button, Input?)
- What patterns exist in DESIGN.md? (follow them)
- Should I create a reusable Form component or inline?

**Decision Tree**:
```
Is this a one-off form?
  → YES: Build inline (ProjectForm.tsx)
  → NO: Create reusable FormField component

Are there existing buttons/inputs?
  → YES: Use .btn-primary, .input classes
  → NO: Create them in index.css using DESIGN.md tokens

Does DESIGN.md have form patterns?
  → YES: Follow them exactly
  → NO: Add them to DESIGN.md (create pattern first)
```

#### Step 5: Document Design Decisions

Before coding, write a brief design brief:

```markdown
## Create Project Form - Design Brief

### Goal
Allow users to quickly create new projects with name and description.

### Visual Direction
- Following project's "modern minimal" style
- Uses blue primary button, gray secondary
- 8px grid spacing
- 16px body text, 20px heading

### Layout
- Vertical stack (mobile-first)
- Card container with 24px padding
- Full-width fields
- Buttons at bottom (stacked mobile, inline desktop)

### States
- Empty: Placeholder text for guidance
- Loading: Disabled inputs, "Creating..." button text
- Error: Red message below field
- Success: "Project created" confirmation

### Accessibility
- Labels associated with inputs
- Focus rings visible on all fields
- Keyboard navigation: Tab through fields → button
- ARIA labels: aria-label="Create project"

### Responsive
- Mobile: Stacked fields, full-width button
- Desktop: Form centered, max-width 600px

### Existing Patterns Used
- .btn-primary, .btn-secondary (from index.css)
- .input class for fields
- .card for container
- .space-y-4 for field spacing

### New Patterns Created
- FormField composite component (label + input + error)
```

**Why write this?**
- Clarifies thinking before coding
- Prevents halfway changes
- Serves as reference while building
- Easier code review (reviewers understand intent)

---

## Part 2: Design Principles (Original)

### 1. Accessible First
- WCAG 2.1 AA compliance
- Proper semantic HTML (buttons, links, labels)
- Keyboard navigation support
- ARIA labels for complex interactions
- Color contrast ≥ 4.5:1 for text
- Focus states visible and clear

### 2. Component-Driven Design
- Small, single-responsibility components
- Composition over inheritance
- Props for customization, not CSS overrides
- Consistent interface across similar components
- Reusable patterns (buttons, forms, layouts)
- Clear separation of UI logic and presentation

### 3. Responsive by Default
- Mobile-first approach
- Tailwind breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Flexible layouts (flexbox, grid)
- Readable text on all screen sizes (16px+ base size)
- Touch-friendly interactive elements (44px+ tap targets)
- Test on mobile, tablet, desktop

### 4. Consistent Visual Hierarchy
- Intentional sizing (base 16px, scale by 1.25x or golden ratio)
- Intentional color usage (semantic colors for meaning)
- Intentional spacing (8px grid: 8, 16, 24, 32, 48px)
- Intentional typography (2-3 font sizes max)
- Visual weight matched to importance

### 5. Tailwind CSS Excellence
- Use Tailwind utility classes (avoid arbitrary CSS)
- Compose classes logically (position, layout, sizing, color, spacing)
- Use Tailwind's opacity modifiers (e.g., `bg-black/50`)
- Leverage Tailwind's responsive prefixes (sm:, md:, lg:, xl:)
- Use Tailwind's group and peer for related elements
- Dark mode support with `dark:` prefix

### 6. Delightful Interactions
- Smooth transitions (200-300ms for interactive elements)
- Meaningful animations (entrance, hover, loading states)
- Instant feedback on user action
- Loading states for async operations
- Error states that communicate clearly
- Success states that celebrate completion

## Component Architecture

### Structure

```
Component.tsx
├── Props interface with clear types
├── Component function
│   ├── Layout/structure (JSX)
│   ├── Conditional rendering
│   ├── Event handlers
│   └── Accessibility attributes
├── Styling (Tailwind classes)
└── Export with display name
```

### Component Types

#### 1. **Presentational Components**
Simple, reusable UI blocks. No business logic.

```typescript
interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  onClick?: (e: React.MouseEvent) => void
  className?: string
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  className,
}) => {
  const baseStyles = 'font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 disabled:bg-gray-100',
    ghost: 'text-blue-600 hover:bg-blue-50 disabled:text-gray-400',
  }
  
  const sizes = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className || ''}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

Button.displayName = 'Button'
```

#### 2. **Container Components**
Layout and structure. Manage spacing, alignment, responsive behavior.

```typescript
interface CardProps {
  children: React.ReactNode
  className?: string
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
    {children}
  </div>
)

Card.displayName = 'Card'
```

#### 3. **Composite Components**
Multiple parts working together (e.g., Form.Root, Form.Field, Form.Error).

```typescript
// Form component family
export const Form = {
  Root: ({ children, onSubmit }: { children: React.ReactNode; onSubmit?: (e: React.FormEvent) => void }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      {children}
    </form>
  ),

  Field: ({ children, label }: { children: React.ReactNode; label: string }) => (
    <div className="flex flex-col">
      <label className="font-medium text-gray-700 mb-2">{label}</label>
      {children}
    </div>
  ),

  Error: ({ message }: { message?: string }) => (
    message && <p className="text-red-600 text-sm mt-1">{message}</p>
  ),
}
```

## Design Patterns

### Loading State
- Show spinner or skeleton while loading
- Disable form submission during load
- Clear loading state on success/error

```typescript
const [isLoading, setIsLoading] = useState(false)

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsLoading(true)
  try {
    await submitForm(data)
  } finally {
    setIsLoading(false)
  }
}

return (
  <Button disabled={isLoading}>
    {isLoading ? 'Saving...' : 'Save'}
  </Button>
)
```

### Error State
- Display error message near the field
- Highlight the problematic field
- Provide actionable guidance

```typescript
<div className="flex flex-col">
  <input
    className={`border rounded px-3 py-2 ${
      error ? 'border-red-500 bg-red-50' : 'border-gray-300'
    }`}
    aria-invalid={!!error}
    aria-describedby={error ? 'error-message' : undefined}
  />
  {error && (
    <p id="error-message" className="text-red-600 text-sm mt-1">
      {error}
    </p>
  )}
</div>
```

### Empty State
- Show when no data available
- Provide action to create first item
- Use illustration or icon

```typescript
{items.length === 0 ? (
  <div className="text-center py-12">
    <p className="text-gray-500 mb-4">No projects yet</p>
    <Button onClick={() => setShowCreateModal(true)}>
      Create your first project
    </Button>
  </div>
) : (
  <ProjectList items={items} />
)}
```

### Responsive Layouts
- Use Tailwind grid for multi-column
- Stack on mobile, side-by-side on desktop

```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map((item) => (
    <Card key={item.id}>{item.name}</Card>
  ))}
</div>
```

## Accessibility Checklist

- [ ] Semantic HTML (use `<button>`, not `<div onClick>`)
- [ ] Form labels associated with inputs (`<label htmlFor>`)
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Focus states visible (outline, ring, or highlight)
- [ ] Color not the only indicator (use icons, text, patterns)
- [ ] Contrast ratio ≥ 4.5:1 for normal text, 3:1 for large text
- [ ] ARIA labels for icon-only buttons
- [ ] ARIA descriptions for complex interactions
- [ ] Alt text for images
- [ ] Avoid auto-playing media

## Tailwind CSS Best Practices

### Do's
- ✅ Use Tailwind's color palette (blue-600, gray-200, etc.)
- ✅ Use responsive prefixes (sm:, md:, lg:, xl:)
- ✅ Use opacity modifiers (bg-black/50)
- ✅ Use group for related elements (group-hover)
- ✅ Use dark mode (dark:bg-gray-800)
- ✅ Use custom utilities in tailwind.config.ts for brand colors
- ✅ Compose classes logically

### Don'ts
- ❌ Don't write custom CSS for common layouts
- ❌ Don't use arbitrary values excessively (only for one-offs)
- ❌ Don't nest Tailwind classes in CSS
- ❌ Don't hardcode pixel values that should use scale
- ❌ Don't ignore dark mode needs

### Example: Well-Styled Component

```typescript
export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onEdit,
  onDelete,
}) => {
  return (
    <article className="bg-white dark:bg-gray-900 rounded-lg shadow hover:shadow-lg transition-shadow p-6 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {project.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {new Date(project.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2 ml-4">
          <button
            onClick={onEdit}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-800 rounded transition-colors"
            aria-label="Edit project"
          >
            ✏️
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-gray-800 rounded transition-colors"
            aria-label="Delete project"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
          {project.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
          Project
        </span>
      </div>
    </article>
  )
}
```

## Workflow

### When Building a New Component

1. **Understand Requirements**
   - What's the purpose? (button, form, list, layout)
   - What states does it need? (default, hover, focus, disabled, loading, error)
   - What data does it display? (props)
   - Who uses it? (parents, siblings, children)

2. **Check Existing Components**
   - Does this component exist already?
   - Can we reuse similar components?
   - Can we compose existing components?

3. **Design the Interface**
   - Define props interface with clear types
   - Make customization explicit (variant, size, className)
   - Provide sensible defaults
   - Document expected props in comments or Storybook

4. **Implement Accessibility**
   - Use semantic HTML
   - Add ARIA attributes where needed
   - Ensure keyboard navigation works
   - Test with screen reader

5. **Style with Tailwind**
   - Create base styles for the component
   - Add variant styles (primary, secondary, etc.)
   - Add size styles (sm, md, lg)
   - Support dark mode with dark: prefix
   - Use opacity and group for interactions

6. **Add Interactions**
   - Smooth transitions (200-300ms)
   - Meaningful hover/focus states
   - Loading indicators
   - Error messages

7. **Test**
   - Component tests (render, props, events)
   - Accessibility tests (keyboard, screen reader)
   - Visual tests (different screen sizes, dark mode)
   - User interaction tests

### When Reviewing Design

**Visual Quality**
- [ ] Consistent spacing and alignment
- [ ] Proper color usage (contrast, semantic meaning)
- [ ] Typography hierarchy clear
- [ ] Responsive layout works on all sizes
- [ ] Dark mode support if applicable
- [ ] Animations smooth and purposeful

**Component Quality**
- [ ] Single responsibility
- [ ] Props are clear and typed
- [ ] Reusable in different contexts
- [ ] No hardcoded colors/strings
- [ ] No unnecessary nesting

**Accessibility**
- [ ] Semantic HTML used
- [ ] Focus states visible
- [ ] ARIA labels where needed
- [ ] Keyboard navigation works
- [ ] Color isn't only indicator
- [ ] Touch targets ≥ 44px

**Code Quality**
- [ ] Uses Tailwind utilities (not custom CSS for common patterns)
- [ ] No utility sprawl (extract to components)
- [ ] Follows project's component patterns
- [ ] TypeScript types are correct
- [ ] No `any` types

## Common Mistakes to Avoid

❌ **Over-engineering components**
- Too many props
- Too much logic
- Props that are never used
- ✅ Keep components small and focused

❌ **Inconsistent styling**
- Different button styles in different places
- Colors not from design system
- Spacing not following grid
- ✅ Use components consistently, define design tokens in tailwind.config.ts

❌ **Inaccessible interactions**
- Click handlers on divs instead of buttons
- No focus states
- Color-only meaning
- ✅ Use semantic HTML, always include focus states, use ARIA

❌ **Unresponsive layouts**
- Fixed widths
- No mobile breakpoints
- Unreadable on small screens
- ✅ Test on mobile first, use responsive prefixes

❌ **Performance issues**
- Unnecessary re-renders
- Large bundle size from UI library
- Unoptimized images
- ✅ Use React.memo, lazy-load, optimize images

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Radix UI Primitives](https://www.radix-ui.com/)
- [React ARIA Hooks](https://react-aria.adobe.com/)

## Tools

- **Tailwind CSS IntelliSense** — VS Code plugin for Tailwind autocomplete
- **Headwind** — VS Code plugin for Tailwind class sorting
- **Accessibility Insights** — Browser extension for accessibility testing
- **Contrast Checker** — Verify color contrast ratios
