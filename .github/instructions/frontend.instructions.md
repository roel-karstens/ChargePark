---
applyTo: "frontend/**/*.{ts,tsx}"
---

# Frontend Development Instructions

## Technology Stack

- React 18 with TypeScript
- Vite for builds
- Vitest for tests
- ESLint for code quality

## Design System

**Every project must have a `DESIGN.md`** that documents:
- Visual identity and brand direction
- Design tokens (colors, typography, spacing)
- Component patterns and variants
- Accessibility rules and focus states
- Responsive breakpoint behavior
- Do's and don'ts for visual consistency

**Before implementing UI:**
1. Review the project's `DESIGN.md`
2. Use design tokens from `tailwind.config.ts`
3. Follow component patterns documented

**After implementing UI:**
1. Use the [design-review skill](../.github/skills/design-review/SKILL.md) to audit visual quality
2. Verify: hierarchy, spacing, colors, typography, accessibility
3. Check responsive behavior (mobile/tablet/desktop)
4. Document visual verification evidence (screenshots)

**See also:**
- [DESIGN.md.template](../../DESIGN.md.template) - Copy this for new projects
- [Design-Review Skill](../.github/skills/design-review/SKILL.md) - How to review UI quality
- [Visual Verification](../.github/skills/verification/SKILL.md#visual-verification-frontend-changes) - How to verify appearance

## TypeScript Guidelines

- Strict mode enabled
- No `any` types without documentation
- All function parameters typed
- All return types specified
- Export types for reusable components
- Use discriminated unions for complex state

## Component Conventions

### Structure

```
components/
  ComponentName/
    ComponentName.tsx         # Main component
    ComponentName.types.ts    # Props and types
    index.ts                  # Exports
```

### Props

```typescript
interface MyComponentProps {
  title: string;
  onClose: () => void;
  isLoading?: boolean;
}

export function MyComponent({ title, onClose, isLoading }: MyComponentProps) {
  // ...
}
```

### State Management

- Use React hooks (`useState`, `useContext`)
- Keep state close to where it's used
- Avoid unnecessary prop drilling
- Extract to custom hooks for reusable logic

## API Integration

All HTTP calls go through a typed API client:

```typescript
// lib/api.ts
const api = {
  get: async <T>(url: string): Promise<T> => { /* ... */ },
  post: async <T>(url: string, data: unknown): Promise<T> => { /* ... */ },
  patch: async <T>(url: string, data: unknown): Promise<T> => { /* ... */ },
  delete: async (url: string): Promise<void> => { /* ... */ },
};
```

Use it in custom hooks:

```typescript
function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api.get<Project[]>('/api/v1/projects')
      .then(setProjects)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { projects, loading, error };
}
```

## Async and Loading States

Every async operation needs states:

```typescript
const [data, setData] = useState<Data | null>(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

// Render:
if (loading) return <div>Loading...</div>;
if (error) return <div>Error: {error}</div>;
if (!data) return <div>No data</div>;
return <div>{/* render data */}</div>;
```

## Authentication

- Supabase Auth integration via custom hook
- Store auth state in context
- Attach JWT to API requests in the API client
- Handle 401 responses gracefully

## Testing (Vitest)

- Component tests for complex UI
- Hook tests for custom logic
- User interaction tests using `@testing-library/react`
- Meaningful coverage, not 100%

```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders title', () => {
    render(<MyComponent title="Test" onClose={() => {}} />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

## Accessibility

All UI must meet WCAG 2.1 AA standards:

- **Semantic HTML**: Always use `<button>` for actions, `<input>` for forms, `<label htmlFor>` for fields
- **Focus States**: All buttons and inputs must have visible focus rings (blue ring with offset)
  - Use `.btn-primary`, `.btn-secondary`, `.btn-ghost` classes (already have focus states)
  - Use `.input` class for inputs (already has focus ring)
  - For custom elements, add class `focus-ring` or manually add `focus-visible:ring-2 focus-visible:ring-offset-2`
- **ARIA Labels**: Icon buttons must have `aria-label="description"` (e.g., `<button aria-label="Delete project">`)
- **Keyboard Navigation**: Tab through page must work in logical order (left-to-right, top-to-bottom)
- **Color Contrast**: Text must have ≥ 4.5:1 contrast ratio (our design tokens meet this)
- **Touch Targets**: Interactive elements must be ≥ 44px tall (buttons have padding for this)

**Test keyboard navigation:**
```bash
1. Open page in browser
2. Press Tab repeatedly
3. Verify all interactive elements have focus ring
4. Verify order makes logical sense
```

## Build and Validation

- ESLint: `npm run lint`
- TypeScript check: `npm run type-check`
- Tests: `npm run test`
- Build: `npm run build`

All must pass before committing.

## No Backend Secrets

- Never import or reference `.env` variables directly
- Use only `VITE_*` prefixed public variables
- Never hardcode API endpoints that aren't public
