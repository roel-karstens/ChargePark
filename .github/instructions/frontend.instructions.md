---
applyTo: "frontend/**/*.{ts,tsx}"
---

# Frontend Development Instructions

## Technology Stack

- React 18 with TypeScript
- Vite for builds
- Vitest for tests
- ESLint for code quality

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

- Semantic HTML
- ARIA labels where needed
- Keyboard navigation
- Color contrast
- Form labels and descriptions

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
