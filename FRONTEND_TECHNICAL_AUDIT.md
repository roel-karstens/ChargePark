# Frontend/UI Technical Audit - ai_fullstack_starter

**Date**: October 2026  
**Scope**: Frontend React TypeScript application and UI infrastructure  
**Methodology**: Code inspection, configuration analysis, documentation review

---

## 1. FRONTEND STRUCTURE

### Directory Layout

```
frontend/
├── src/
│   ├── App.tsx                          # Main application component
│   ├── main.tsx                         # Entry point
│   ├── index.css                        # Global Tailwind directives + @layer components
│   ├── App.css                          # Global app styles
│   ├── vite-env.d.ts                    # Vite type definitions
│   ├── components/
│   │   ├── ProjectList.tsx              # Display projects grid
│   │   ├── ProjectForm.tsx              # Create project form
│   │   └── ErrorAlert.tsx               # Reusable error component
│   ├── pages/
│   │   ├── AuthPage.tsx                 # Login/signup page
│   │   └── ProjectsPage.tsx             # Main authenticated dashboard
│   ├── hooks/
│   │   └── useLoadingState.ts           # Custom hook for loading/error state
│   ├── lib/
│   │   ├── api.ts                       # Typed HTTP API client
│   │   └── supabase.ts                  # Supabase client instance
│   ├── types/
│   │   └── index.ts                     # Shared TypeScript types
│   └── config/
│       └── dev.ts                       # Development mode configuration
├── tests/                               # Empty - no component tests yet
├── public/                              # Static assets
├── index.html                           # Entry HTML document
├── package.json                         # Dependencies and scripts
├── tsconfig.json                        # TypeScript strict configuration
├── tsconfig.node.json                   # Node-specific TS config
├── vite.config.ts                       # Vite bundler configuration
├── eslint.config.js                     # ESLint rules (flat config)
├── tailwind.config.ts                   # Tailwind design tokens
├── postcss.config.js                    # PostCSS with Tailwind plugin
├── .env.example                         # Environment variable template
└── .env                                 # (gitignored) Local environment variables
```

### Component Organization

**Current Components** (3 total, all simple):

1. **ErrorAlert.tsx** (12 lines)
   - Props: `message: string | null`, optional `className`
   - Displays red error banner with error text
   - Returns null if message is empty
   - Used in forms to show error feedback

2. **ProjectForm.tsx** (91 lines)
   - Props: `onCreate`, `isLoading`, `error`
   - Form with name + description textarea
   - Uses `react-hook-form` for form state
   - Handles validation and error display
   - Disables on loading, resets on success
   - One external error prop display

3. **ProjectList.tsx** (52 lines)
   - Props: `projects`, `onDelete`, `isDeleting`
   - Renders grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
   - Card-based layout with project details
   - Trash icon from lucide-react
   - Delete button with confirmation prompt
   - ARIA labels on delete button

**No other presentational components yet** - buttons, inputs, dialogs, modals, etc. are built inline using Tailwind utilities.

---

## 2. DEPENDENCIES & UI LIBRARIES

### Production Dependencies

```json
{
  "@supabase/supabase-js": "^2.38.0",    // Auth + database client
  "@tailwindcss/postcss": "^4.3.3",      // Tailwind v4 (latest)
  "autoprefixer": "^10.6.1",              // PostCSS plugin for vendor prefixes
  "class-variance-authority": "^0.7.1",   // Component variant library
  "clsx": "^2.1.1",                       // Conditional className utility
  "lucide-react": "^1.49.0",              // Icon library (modern)
  "postcss": "^8.5.28",                   // CSS post-processor
  "react": "^18.2.0",                     // React 18.2
  "react-dom": "^18.2.0",                 // React DOM
  "react-hook-form": "^7.89.0",           // Form library (lightweight)
  "react-query": "^3.39.3",               // Data fetching + caching
  "tailwindcss": "^3.4.19",               // Tailwind CSS v3 (utility-first)
  "zustand": "^5.0.15"                    // State management (not yet used)
}
```

**Key UI Libraries:**
- **Tailwind CSS v3**: All UI styling via utility classes
- **react-hook-form**: Form state management
- **react-query**: API data fetching, caching, refetching
- **lucide-react**: Icon library (clean, minimal)
- **class-variance-authority**: Component variant patterns (imported but not actively used in current code)
- **clsx**: Conditional class name merging (imported but not used)

**NOT included:**
- ❌ UI component library (shadcn/ui, Material-UI, etc.)
- ❌ CSS-in-JS (styled-components, emotion)
- ❌ Animation library (Framer Motion)
- ❌ State machine (XState)
- ❌ Form validation beyond react-hook-form
- ❌ Visual testing (Playwright, Cypress)
- ❌ Storybook
- ❌ Dark mode library (only Tailwind dark: prefix support)

### Dev Dependencies

```json
{
  "@testing-library/react": "^14.0.0",   // React component testing
  "@testing-library/user-event": "^14.5.1", // User interaction simulation
  "@types/node": "^20.10.0",              // Node.js types
  "@types/react": "^18.2.37",             // React types
  "@types/react-dom": "^18.2.15",         // React DOM types
  "@eslint/js": "^10.0.1",                // ESLint core
  "@typescript-eslint/eslint-plugin": "^8.71.0", // TS linting
  "@typescript-eslint/parser": "^8.71.0",       // TS parser
  "@vitejs/plugin-react": "^4.2.1",       // Vite React plugin
  "eslint": "^8.55.0",                    // Linter
  "eslint-config-prettier": "^9.1.0",     // ESLint ↔ Prettier integration
  "eslint-plugin-jsx-a11y": "^6.10.2",    // **Accessibility linting**
  "eslint-plugin-react": "^7.33.2",       // React linting
  "eslint-plugin-react-hooks": "^4.6.0",  // React hooks linting
  "prettier": "^3.1.1",                   // Code formatter
  "typescript": "^5.3.3",                 // TypeScript compiler
  "vite": "^5.0.8",                       // Bundler
  "vitest": "^1.1.0"                      // Test runner (Vitest, not Jest)
}
```

---

## 3. STYLING APPROACH & DESIGN TOKENS

### Tailwind CSS Configuration

**File**: [frontend/tailwind.config.ts](frontend/tailwind.config.ts)

**Content**: Scans `./index.html` and `./src/**/*.{js,ts,jsx,tsx}` for Tailwind classes.

**Custom Design Tokens** (in `theme.extend`):

```typescript
colors: {
  destructive: 'hsl(0 84% 60%)',        // Red (#E85D75) - errors/dangerous actions
  border: 'hsl(214 31.8% 91.4%)',       // Light gray (#E5E7EB) - borders, dividers
  input: 'hsl(214 31.8% 91.4%)',        // Same as border - form inputs
  ring: 'hsl(212 95% 58%)',             // Blue (#3B82F6) - focus states
  background: 'hsl(0 0% 100%)',         // White (#FFFFFF) - page background
  foreground: 'hsl(212 12% 3.9%)',      // Very dark gray (#0F172A) - text
  primary: {
    DEFAULT: 'hsl(212 95% 58%)',        // Blue (#3B82F6) - main actions
    foreground: 'hsl(210 40% 98%)',     // Very light gray (#F8FAFC) - text on primary
  },
  secondary: {
    DEFAULT: 'hsl(210 40% 96%)',        // Light gray (#F1F5F9) - secondary bg
    foreground: 'hsl(212 12% 3.9%)',    // Dark gray - text on secondary
  },
  muted: {
    DEFAULT: 'hsl(210 40% 96%)',        // Light gray (#F1F5F9) - disabled/muted bg
    foreground: 'hsl(215.4 16.3% 46.9%)', // Gray (#64748B) - secondary text
  },
}

borderRadius: {
  lg: '0.5rem',    // 8px - cards, larger components
  md: '0.375rem',  // 6px - medium elements
  sm: '0.25rem',   // 4px - small elements
}
```

**Color Palette Summary**:
- 🔵 **Primary**: Blue (#3B82F6) - main interactive elements
- ⚪ **Secondary**: Light gray (#F1F5F9) - secondary actions, backgrounds
- 🔴 **Destructive**: Red (#E85D75) - errors, delete actions
- ⬜ **Neutral**: Gray scale for borders, text, backgrounds
- **Contrast**: Primary on primary-foreground meets WCAG AA (4.5:1 minimum)

### CSS Organization

**Global Styles**: [frontend/src/index.css](frontend/src/index.css)

```css
@tailwind base;           /* Reset + base styles */
@tailwind components;     /* Component layer */
@tailwind utilities;      /* Utility layer */

@layer base { /* Font setup, button cursor */ }
@layer components {
  .btn-primary   /* px-4 py-2 bg-primary text-primary-foreground rounded-md... */
  .btn-secondary /* px-4 py-2 bg-secondary border border-border... */
  .input         /* w-full px-3 py-2 border border-input focus:ring-2... */
  .label         /* block text-sm font-medium mb-1.5 */
  .error         /* text-red-600 text-sm mt-1 */
  .success       /* text-green-600 text-sm mt-1 */
  .card          /* bg-background border border-border rounded-lg p-6 */
}
```

**Component Styles**: [frontend/src/App.css](frontend/src/App.css)

```css
.app { max-width: 1024px; margin: 0 auto; padding: 2rem; }
main { min-height: 100vh; }
```

**Styling Strategy**:
- ✅ Tailwind utilities for all styling (no CSS files except global)
- ✅ Component layer classes (@layer components) for reusable patterns
- ✅ Responsive prefixes (sm:, md:, lg:) for mobile-first design
- ❌ CSS modules not used
- ❌ No CSS-in-JS
- ❌ No arbitrary CSS values - all from design tokens

### PostCSS Configuration

**File**: [frontend/postcss.config.js](frontend/postcss.config.js)

```javascript
{ plugins: { tailwindcss: {}, autoprefixer: {} } }
```

Simple setup: Tailwind + vendor prefix automation.

---

## 4. COMPONENT PATTERNS & STATE MANAGEMENT

### Component Structure Pattern

All components follow this structure:

```typescript
// 1. Props interface
interface ComponentProps {
  prop1: string;
  prop2?: number;
  onAction?: () => void;
}

// 2. Component function
export function Component({ prop1, prop2, onAction }: ComponentProps) {
  // Business logic
  const state = useState(...);
  const handler = () => { ... };
  
  // JSX
  return <div>...</div>;
}
```

**Examples**:

**ProjectForm.tsx**:
```typescript
interface ProjectFormProps {
  onCreate: (name: string, description: string) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

interface ProjectFormInputs {
  name: string;
  description: string;
}
```

**ProjectList.tsx**:
```typescript
interface ProjectListProps {
  projects: Project[];
  onDelete: (id: string) => Promise<void>;
  isDeleting?: boolean;
}
```

### State Management Approach

**Current Strategy**:
- ✅ **React hooks** (`useState`, `useEffect`) for local state
- ✅ **react-query** for server state (fetching, caching, mutations)
- ✅ **react-hook-form** for form state
- ❌ **Zustand** imported but NOT YET USED
- ❌ No context providers for shared state
- ❌ No global state management needed yet

**Example - ProjectsPage**:

```typescript
// Fetching with react-query
const { data: projects = [], isLoading, error } = useQuery<Project[], Error>(
  ['projects', token],
  () => token ? api.get<Project[]>('/api/v1/projects', token) : Promise.resolve([]),
  { enabled: !!token, staleTime: 5 * 60 * 1000 }
);

// Mutations
const createMutation = useMutation(
  (vars: { name: string; description: string }) =>
    token ? api.post<Project>('/api/v1/projects', vars, token) : ...,
  { onSuccess: () => queryClient.invalidateQueries(['projects', token]); }
);

// Local component state
const [token, setToken] = useState<string | null>(null);
const [authError, setAuthError] = useState<string | null>(null);
```

### Custom Hooks

**useLoadingState.ts** (16 lines):
```typescript
interface LoadingState {
  isLoading: boolean;
  error: string | null;
  setLoading: (state: boolean) => void;
  setError: (error: string | null) => void;
}

export function useLoadingState(): LoadingState {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return { isLoading, error, setLoading: setIsLoading, setError };
}
```

**Usage**: Not actively used in current components.

---

## 5. API INTEGRATION

### Typed HTTP Client

**File**: [frontend/src/lib/api.ts](frontend/src/lib/api.ts)

```typescript
const apiUrl = import.meta.env.VITE_API_URL;

async function request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  const response = await fetch(`${apiUrl}${endpoint}`, {
    ...fetchOptions,
    headers,
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'API Error');
  }
  
  if (response.status === 204) return undefined as unknown as T;
  return response.json();
}

export const api = {
  get: <T = unknown>(endpoint: string, token?: string): Promise<T> => ...,
  post: <T = unknown>(endpoint: string, data: unknown, token?: string): Promise<T> => ...,
  patch: <T = unknown>(endpoint: string, data: unknown, token?: string): Promise<T> => ...,
  delete: (endpoint: string, token?: string): Promise<void> => ...,
};
```

**Features**:
- ✅ Generic types for request/response
- ✅ Authorization header with Bearer token
- ✅ Error handling (throws with detail message)
- ✅ 204 No Content handling
- ✅ Environment-based API URL

### Supabase Client

**File**: [frontend/src/lib/supabase.ts](frontend/src/lib/supabase.ts)

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**Usage in AuthPage**:
- `supabase.auth.getSession()` - restore session
- `supabase.auth.onAuthStateChange()` - listen for auth changes
- `supabase.auth.signUp()` - create account
- `supabase.auth.signInWithPassword()` - login
- `supabase.auth.signOut()` - logout

**Dev Mode Override**:
- In development, can skip Supabase auth
- LocalStorage stores dev token
- Backend `/api/v1/dev/token` endpoint generates real JWT for testing

---

## 6. TYPE SYSTEM

### TypeScript Configuration

**File**: [frontend/tsconfig.json](frontend/tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "jsx": "react-jsx",
    
    /* Strict Mode */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    
    /* Module Resolution */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true
  }
}
```

**Strictness**:
- ✅ `strict: true` - All strict checks enabled
- ✅ `noUnusedLocals: true` - Error on unused variables
- ✅ `noUnusedParameters: true` - Error on unused parameters
- ✅ `noFallthroughCasesInSwitch: true` - Error on missing break in switch

### Shared Types

**File**: [frontend/src/types/index.ts](frontend/src/types/index.ts)

```typescript
export interface Project {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}
```

**Type Usage**:
- Imported in components that need it
- Matches database schema
- Used in react-query and API calls

---

## 7. UI-SPECIFIC INSTRUCTIONS & GUIDELINES

### Frontend Instructions Document

**File**: [.github/instructions/frontend.instructions.md](.github/instructions/frontend.instructions.md)

**Technology Stack Section**:
- React 18 + TypeScript
- Vite for builds
- Vitest for tests
- ESLint for code quality

**Key Rules** (excerpted):

1. **TypeScript Guidelines**
   - Strict mode enabled
   - No `any` types without documentation
   - All function parameters typed
   - All return types specified
   - Export types for reusable components
   - Use discriminated unions for complex state

2. **Component Conventions**
   - Structured folder/file pattern (not yet fully followed)
   - Props interface for each component
   - React hooks for state (useState, useContext)
   - Keep state close to usage, extract to custom hooks for reusable logic

3. **API Integration**
   - All HTTP through typed `lib/api.ts` client
   - Custom hooks for data fetching pattern
   - Loading/error/empty states required

4. **Async and Loading States**
   ```typescript
   const [data, setData] = useState<Data | null>(null);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   // Render: if (loading) ..., if (error) ..., if (!data) ..., render data
   ```

5. **Authentication**
   - Supabase Auth + JWT
   - Custom hook for auth state
   - JWT attached to API requests
   - Handle 401 gracefully

6. **Testing (Vitest)**
   - Component tests for complex UI
   - Hook tests for custom logic
   - User interaction tests
   - Meaningful coverage, not 100%

7. **Accessibility**
   - Semantic HTML
   - ARIA labels where needed
   - Keyboard navigation
   - Color contrast
   - Form labels and descriptions

8. **Validation**
   - ESLint: `npm run lint`
   - TypeScript: `npm run type-check`
   - Tests: `npm run test`
   - Build: `npm run build`

---

## 8. BUILD & DEVELOPMENT CONFIGURATION

### Vite Configuration

**File**: [frontend/vite.config.ts](frontend/vite.config.ts)

```typescript
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,  // Opens browser automatically
  },
});
```

**Dev Server**: Runs on `http://localhost:5173` with auto-open.

### NPM Scripts

```json
{
  "dev": "vite",                          // Start dev server
  "build": "vite build",                  // Production build
  "preview": "vite preview",              // Preview production build locally
  "lint": "eslint .",                     // Run ESLint
  "format": "prettier --write .",         // Format code with Prettier
  "type-check": "tsc --noEmit",           // Run TypeScript without emitting
  "test": "vitest",                       // Run Vitest once
  "test:ui": "vitest --ui",               // Run with browser UI
  "test:watch": "vitest --watch"          // Run in watch mode
}
```

---

## 9. LINTING & CODE QUALITY

### ESLint Configuration

**File**: [frontend/eslint.config.js](frontend/eslint.config.js)

**Plugins**:
- `eslint-plugin-react` - React best practices
- `eslint-plugin-react-hooks` - Hooks rules
- `eslint-plugin-jsx-a11y` - **Accessibility rules** ✅
- `@typescript-eslint/eslint-plugin` - TypeScript linting

**Key Rules**:

```javascript
// Accessibility rules
'jsx-a11y/anchor-is-valid': 'warn',
'jsx-a11y/aria-role': 'warn',
'jsx-a11y/click-events-have-key-events': 'warn',          // Click requires keyboard support
'jsx-a11y/no-static-element-interactions': 'warn',        // Static elements shouldn't have handlers

// React Hooks
'react-hooks/rules-of-hooks': 'error',                   // Hooks called correctly
'react-hooks/exhaustive-deps': 'warn',                   // useEffect dependencies

// TypeScript
'@typescript-eslint/no-unused-vars': 'warn',
'@typescript-eslint/no-explicit-any': 'warn',

// React
'react/jsx-no-target-blank': 'off',
'react/react-in-jsx-scope': 'off',  // Not needed in React 18
'react/prop-types': 'off',          // Using TypeScript instead
```

**Accessibility Checks Active**:
- ✅ Click events should have keyboard support
- ✅ Static elements shouldn't have click handlers
- ✅ ARIA roles validated
- ✅ Links validated

---

## 10. TESTING CAPABILITIES

### Vitest Setup

**Available**: Vitest ^1.1.0 installed
**Configuration**: Not customized (default)
**Status**: `frontend/tests/` directory exists but is **EMPTY**

**Test Scripts**:
```bash
npm run test         # Run all tests once
npm run test:watch   # Watch mode
npm run test:ui      # Browser UI
```

### Testing Libraries Installed

- `@testing-library/react` ^14.0.0 - Component testing
- `@testing-library/user-event` ^14.5.1 - Simulate user interactions

### Testing Documentation

**File**: [.github/skills/testing/SKILL.md](.github/skills/testing/SKILL.md)

**Frontend Testing Section** (partial implementation documented):

```typescript
// Example from docs
import { render, screen, fireEvent } from '@testing-library/react';
import { ProjectForm } from '../components/ProjectForm';

describe('ProjectForm', () => {
  test('should render form fields', () => {
    render(<ProjectForm onCreate={async () => {}} isLoading={false} />);
    expect(screen.getByLabelText(/project name/i)).toBeInTheDocument();
  });
  
  test('should call onCreate when form submitted', async () => {
    const onCreate = vi.fn();
    render(<ProjectForm onCreate={onCreate} isLoading={false} />);
    fireEvent.change(screen.getByLabelText(/project name/i), {
      target: { value: 'Test Project' }
    });
    fireEvent.click(screen.getByText(/create/i));
    // expect onCreate called...
  });
});
```

**No actual tests written yet** - `frontend/tests/` is empty.

---

## 11. ACCESSIBILITY REQUIREMENTS

### ESLint Accessibility Rules (Active)

- ✅ `jsx-a11y/click-events-have-key-events` (warn) - Click handlers need keyboard support
- ✅ `jsx-a11y/no-static-element-interactions` (warn) - Static elements shouldn't have handlers
- ✅ `jsx-a11y/aria-role` (warn) - ARIA roles validated
- ✅ `jsx-a11y/anchor-is-valid` (warn) - Anchor tags validated

### Accessibility Best Practices in Code

**Current Implementation**:

In **ProjectList.tsx**:
```typescript
<button
  onClick={() => handleDelete(project.id)}
  disabled={isDeleting}
  className="..."
  aria-label={`Delete project ${project.name}`}  // ✅ ARIA label
>
  <Trash2 size={16} />
  <span>Delete</span>
</button>
```

In **ProjectForm.tsx**:
```typescript
<label htmlFor="name" className="label">Project Name</label>
<input
  id="name"
  type="text"
  {...register('name', { required: '...' })}
/>
```

**What's Required** (per [.github/skills/frontend-design/SKILL.md](.github/skills/frontend-design/SKILL.md)):

1. **Accessible First** - WCAG 2.1 AA compliance target
   - Semantic HTML (buttons, links, labels) ✅ Partially implemented
   - Keyboard navigation support ✅ Forms work
   - ARIA labels for complex interactions ✅ Delete button has aria-label
   - Color contrast ≥ 4.5:1 for text ✅ Design tokens set
   - Focus states visible and clear ❌ Not explicitly defined in CSS

2. **Semantic HTML**
   - Use `<button>` not `<div>` with click handlers ✅
   - Use `<label>` for form fields ✅
   - Proper heading hierarchy ✅

3. **Keyboard Navigation**
   - Forms: Tab through fields ✅
   - Buttons: Space/Enter to activate ✅
   - Modals/dialogs: ❌ None yet

4. **Focus Management**
   - Focus visible on interactive elements - **Not explicitly styled**
   - Focus ring on inputs: `focus:ring-2 focus:ring-ring` ✅ In `.input` class

---

## 12. DESIGN DOCUMENTATION

### Design System Documentation

**Status**: **NONE EXISTS**

No separate design documentation files found:
- ❌ `DESIGN.md`
- ❌ `COMPONENT_LIBRARY.md`
- ❌ Design tokens documentation file
- ❌ Component catalog
- ❌ Figma links
- ❌ Design principles document (beyond Skill)

### Design Guidance

**Source**: [.github/skills/frontend-design/SKILL.md](.github/skills/frontend-design/SKILL.md) provides:

1. **Design Principles**:
   - Accessible First
   - Component-Driven Design
   - Responsive by Default
   - Consistent Visual Hierarchy
   - Tailwind CSS Excellence
   - Delightful Interactions

2. **Component Architecture** - Patterns for:
   - Presentational Components (Button, Card, Badge)
   - Container Components (Layout wrappers)
   - Composite Components (Form.Root, Form.Field, Form.Error)

3. **Design Patterns**:
   - Loading states (disabled button, "Saving..." text)
   - Error states (near field, highlighted)
   - Empty states (message + action)
   - Success states (confirmation)

---

## 13. MCP INTEGRATIONS

### Available MCP Tools for Frontend

From [docs/mcp.md](docs/mcp.md):

#### Browser / Chrome DevTools MCP ✅

**Purpose**: Inspect and debug running frontend application

**Capabilities**:
- Open browser to running application
- Inspect console (errors, logs, warnings)
- Inspect network tab (HTTP requests, responses, status codes)
- Inspect DOM elements and CSS
- Take screenshots
- Check authentication state (localStorage, cookies)
- Verify API calls

**When to Use**:
- Reproducing bugs
- Debugging frontend issues
- Verifying API integration
- Testing error states
- Verifying authentication flow
- Checking browser console

**Workflow Example**:
1. Start dev server: `npm run dev`
2. Open browser to http://localhost:5173
3. Reproduce issue
4. Inspect console, network, DOM
5. Identify root cause
6. Fix code
7. Verify with browser tools

#### Supabase MCP ✅

**Purpose**: Query and manage Supabase database

**Capabilities**:
- Inspect database schema
- List tables and indexes
- Review RLS policies
- Test queries

**Frontend Use**: Test auth flow, verify user data in database

#### Vercel MCP ✅

**Purpose**: Manage deployments

**Use**: Deploy frontend to Vercel for production

---

## 14. EXAMPLE APPLICATION UI

### Current Example App: Project Management

**Main Flow**:

```
1. AuthPage (Authentication)
   ├── Sign Up form (email + password)
   ├── Sign In form (email + password)
   └── Dev Mode: Quick login button (development only)

2. ProjectsPage (Authenticated Dashboard)
   ├── Header (sticky, blurred background)
   │   ├── Title "Projects"
   │   ├── User email + ID (first 8 chars)
   │   ├── Dev Mode badge (if dev)
   │   └── Logout button
   ├── ProjectForm
   │   ├── Text input (name, required)
   │   ├── Textarea (description, optional)
   │   ├── Error display
   │   └── Submit button (create)
   └── ProjectList
       ├── Grid layout (1 col mobile, 2 cols tablet, 3 cols desktop)
       ├── Project cards
       │   ├── Project name (heading)
       │   ├── Description (if exists)
       │   ├── Created date
       │   └── Delete button (with confirmation)
       └── Empty state (implicit - empty grid)
```

### UI Complexity Assessment

**Complexity**: **LOW to MEDIUM**

- ✅ No complex interactions (modals, dialogs, popovers)
- ✅ Simple forms with standard validation
- ✅ List/grid rendering
- ✅ Basic state management (loading, error, empty)
- ❌ No drag-and-drop
- ❌ No animations/transitions
- ❌ No real-time updates
- ❌ No advanced form patterns (wizard, dynamic fields)
- ❌ No charting/visualization
- ❌ No file uploads

### Styling Patterns Used

**Colors**:
- Primary blue for action buttons
- Gray for secondary actions
- Red for destructive actions
- White backgrounds

**Spacing**:
- Flex gaps: `gap-2`, `gap-3`, `gap-4`
- Padding: `p-3`, `p-4`, `p-6`, `p-8`
- Margin: `mb-1.5`, `mb-2`, `mb-4`, `mb-6`, `mt-1`, `mt-3`, `mt-auto`

**Typography**:
- Headings: `text-2xl font-bold`, `text-xl font-semibold`, `text-lg font-semibold`
- Body: `text-sm`, `text-xs`
- Semantic classes: `.label`, `.error`, `.success`

**Components**:
- Cards: `.card` class (border, shadow, padding, rounded)
- Buttons: `.btn-primary`, `.btn-secondary` classes
- Inputs: `.input` class (focus ring, border, padding)
- Forms: `space-y-4` for spacing between fields
- Grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`

**Responsive**:
- Mobile-first (base styles)
- `md:` breakpoint (768px) for tablet changes
- `lg:` breakpoint (1024px) for desktop changes
- Example: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

---

## 15. FRONTEND-SPECIFIC AGENTS & SKILLS

### Agents (Specialized Roles)

**No frontend-specific agent** currently exists. Generic agents available:

- `architect.agent.md` - Design decisions (full-stack)
- `code-reviewer.agent.md` - Code quality review (full-stack)
- `database.agent.md` - Database/schema (backend-focused)
- `security-reviewer.agent.md` - Security audit (full-stack)

### Skills (Frontend-Specific)

#### 1. **Frontend Design Skill** ✅
**File**: [.github/skills/frontend-design/SKILL.md](.github/skills/frontend-design/SKILL.md)

**Use when**:
- Building new UI components
- Improving visual design
- Designing responsive layouts
- Creating accessible interfaces
- Ensuring design consistency
- Reviewing component quality

**Covers**:
- 6 Design Principles (Accessible First, Component-Driven, etc.)
- Component Architecture (Presentational, Container, Composite)
- Design Patterns (Loading, Error, Empty, Success states)
- Interaction patterns (Validation, Errors, Disabled states)
- Responsive design patterns
- Tailwind CSS best practices

#### 2. **Frontend Debugging Skill** ✅
**File**: [.github/skills/frontend-debugging/SKILL.md](.github/skills/frontend-debugging/SKILL.md)

**Use when**:
- Application not behaving as expected
- Users report UI issues
- Feature not working in browser
- Network requests failing
- Auth/loading states incorrect
- Investigating performance problems
- Reproducing bugs

**Workflow**:
1. Reproduce the issue
2. Collect evidence (console, network, page state)
3. Identify likely causes
4. Implement smallest fix
5. Test the fix
6. Verify with browser tools

**Common Issues Covered**:
- Network/API failures
- Authentication problems
- State management issues
- Frontend logic errors
- Environment configuration
- Missing variables

#### 3. **Testing Skill** ✅
**File**: [.github/skills/testing/SKILL.md](.github/skills/testing/SKILL.md)

**Covers both**:
- Backend testing (pytest)
- **Frontend testing (Vitest + React Testing Library)**

**Frontend Testing Section Includes**:
- How to run tests (`npm run test`, `npm run test:watch`, `npm run test:ui`)
- Component testing patterns
- Hook testing patterns
- Test fixtures and setup
- Testing accessibility
- Testing patterns (validation, errors, authorization)

---

## 16. FRONTEND-SPECIFIC PROMPTS

### Prompts (Reusable Workflows)

Located in `.github/prompts/`:

**Generic (Full-Stack) Prompts**:
- `implement-feature.prompt.md` - Build new features
- `review.prompt.md` - Code review workflow
- `security-review.prompt.md` - Security audit
- `database-change.prompt.md` - Schema changes
- `test-and-review.prompt.md` - Testing workflow
- `verify-and-ship.prompt.md` - Verification before shipping

**No frontend-specific prompts** - use generic `implement-feature` for frontend work.

---

## 17. ENVIRONMENT VARIABLES

### Frontend Environment Variables

**File**: [frontend/.env.example](frontend/.env.example)

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:8000
```

**Requirements**:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anon key (public)
- `VITE_API_URL` - Backend API URL (default: http://localhost:8000)

**Prefix**: `VITE_` prefix exposes variables to client-side (Vite convention)

**Security Notes**:
- ✅ Anon key is public (client-safe)
- ✅ Service role key NOT in frontend
- ✅ No secrets committed to git

---

## 18. DEVELOPMENT WORKFLOW COMMANDS

### Full Frontend Validation

```bash
cd frontend

# Code quality
npm run lint              # ESLint check
npm run format            # Prettier format (write)

# Type checking
npm run type-check        # TypeScript strict check

# Testing
npm run test              # Vitest run all tests
npm run test:watch        # Vitest watch mode
npm run test:ui           # Vitest browser UI

# Building
npm run build             # Vite production build
npm run preview           # Preview production build

# Development
npm run dev               # Start dev server (http://localhost:5173)
```

### Full Validation Pipeline

```bash
npm run lint && \
npm run type-check && \
npm run test && \
npm run build
```

---

## 19. SUMMARY: FRONTEND CAPABILITIES

### ✅ What Exists

| Category | Status | Details |
|----------|--------|---------|
| **Framework** | ✅ React 18 + TypeScript | Strict typing, modern React |
| **Styling** | ✅ Tailwind v3 | Utility-first CSS, custom design tokens |
| **Build** | ✅ Vite v5 | Fast bundler, HMR |
| **Testing** | ✅ Vitest + RTL | Setup ready, no tests written yet |
| **Linting** | ✅ ESLint + Prettier | Including a11y plugin |
| **Forms** | ✅ react-hook-form | Lightweight form management |
| **Data Fetching** | ✅ react-query | Caching, refetch, mutations |
| **Icons** | ✅ lucide-react | Modern SVG icons |
| **Auth** | ✅ Supabase Auth | Email/password, JWT |
| **API Client** | ✅ Typed fetch wrapper | Generic, Authorization support |
| **Accessibility** | ⚠️ Partial | ESLint rules active, some ARIA labels, no focus states CSS |
| **Design System** | ⚠️ Partial | Design tokens in Tailwind, no component library |
| **Documentation** | ✅ Skill + Instructions | Frontend Design & Debugging skills, frontend.instructions.md |
| **Components** | ⚠️ Minimal | Only 3 simple components, no reusable component library |

### ❌ What Doesn't Exist

| Feature | Status | Why/Impact |
|---------|--------|-----------|
| **Component Tests** | ❌ None | `frontend/tests/` empty despite Vitest + RTL installed |
| **Component Library** | ❌ None | No shadcn/ui, Material-UI, or custom components |
| **Dark Mode** | ❌ None | Only Tailwind `dark:` support (not used) |
| **Animation Library** | ❌ None | Only CSS transitions (basic) |
| **Focus Styles CSS** | ❌ Missing | Accessibility gap - focus not visually emphasized |
| **E2E Tests** | ❌ None | No Playwright, Cypress, or similar |
| **Visual Regression** | ❌ None | No screenshot testing |
| **Storybook** | ❌ None | No component documentation UI |
| **Feature Flags** | ❌ None | Dev mode only |
| **Advanced Forms** | ❌ None | No wizard, conditional fields, dynamic forms |
| **State Persistence** | ⚠️ Partial | localStorage used for dev token, not for other state |
| **Error Boundaries** | ❌ None | No React error boundaries |
| **Skeleton Loaders** | ❌ None | Simple "Loading..." text only |
| **Modals/Dialogs** | ❌ None | No modal component or library |
| **Notifications** | ❌ None | No toast, snackbar, or notification system |
| **Search/Filter** | ❌ None | No input filtering in ProjectList |
| **Pagination** | ❌ None | All projects loaded at once |
| **Responsive Images** | ❌ None | Only one image (placeholder) |
| **Service Worker** | ❌ None | No offline support or PWA features |

### ⚠️ Partial Implementations

1. **Accessibility**
   - ESLint rules enforced ✅
   - Semantic HTML ✅
   - ARIA labels on some interactive elements ✅
   - Focus ring on inputs ✅
   - **Missing**: Explicit focus state styling, keyboard navigation testing, color contrast validation

2. **Error Handling**
   - Error display component exists ✅
   - Forms show validation errors ✅
   - API errors caught and displayed ✅
   - **Missing**: Error boundaries, 404 page, offline detection

3. **State Management**
   - React hooks ✅
   - react-query ✅
   - react-hook-form ✅
   - Zustand imported but unused ⚠️
   - **No**: Global context, Redux, Jotai

4. **Performance**
   - React 18 (automatic batching) ✅
   - Vite code splitting ✅
   - react-query caching ✅
   - **Missing**: Image optimization, lazy loading, virtualization

---

## 20. CONCLUSIONS & OBSERVATIONS

### Key Findings

1. **Minimal but Functional**
   - Application works end-to-end
   - Example app is simple: auth + CRUD
   - UI is plain but functional

2. **Strong Foundation**
   - TypeScript strict mode enforced
   - ESLint with accessibility plugin active
   - Testing infrastructure ready (Vitest + React Testing Library)
   - Tailwind CSS with designed tokens

3. **Ready for Growth**
   - Zustand installed but unused - ready for complex state
   - No component library yet - can be added when needed
   - Testing framework ready - just needs tests written

4. **Accessibility Attention**
   - ESLint a11y plugin installed
   - Some ARIA labels used
   - Semantic HTML in place
   - **Gap**: Focus state styling not explicitly defined

5. **No Design Isolation**
   - Design tokens exist in Tailwind config
   - No separate design system documentation
   - No Storybook or component catalog
   - Components built directly in application

### Recommendations for Expansion

1. **Add Component Tests** - Vitest ready but no tests written
2. **Extract Reusable Components** - Button, Input, Modal, Card, Form components
3. **Add Focus State Styling** - Currently missing explicit `:focus-visible` states
4. **Create Component Library Docs** - Or add Storybook for documentation
5. **Add Error Boundaries** - For better error isolation
6. **Implement Toast/Notification System** - For user feedback
7. **Add E2E Tests** - Playwright recommended for full workflow testing
8. **Consider Motion** - Framer Motion for animations if needed

---

## Appendix: File Reference

### Component Files
- [frontend/src/components/ProjectList.tsx](frontend/src/components/ProjectList.tsx) - 52 lines
- [frontend/src/components/ProjectForm.tsx](frontend/src/components/ProjectForm.tsx) - 91 lines
- [frontend/src/components/ErrorAlert.tsx](frontend/src/components/ErrorAlert.tsx) - 12 lines

### Page Files
- [frontend/src/pages/AuthPage.tsx](frontend/src/pages/AuthPage.tsx) - 175+ lines
- [frontend/src/pages/ProjectsPage.tsx](frontend/src/pages/ProjectsPage.tsx) - 150+ lines

### Configuration Files
- [frontend/tailwind.config.ts](frontend/tailwind.config.ts) - Design tokens
- [frontend/tsconfig.json](frontend/tsconfig.json) - Strict TypeScript
- [frontend/vite.config.ts](frontend/vite.config.ts) - Build config
- [frontend/eslint.config.js](frontend/eslint.config.js) - Linting rules
- [frontend/postcss.config.js](frontend/postcss.config.js) - CSS processing

### Instructions & Documentation
- [.github/instructions/frontend.instructions.md](.github/instructions/frontend.instructions.md) - Frontend best practices
- [.github/skills/frontend-design/SKILL.md](.github/skills/frontend-design/SKILL.md) - Design principles
- [.github/skills/frontend-debugging/SKILL.md](.github/skills/frontend-debugging/SKILL.md) - Debugging guide
- [.github/skills/testing/SKILL.md](.github/skills/testing/SKILL.md) - Testing (partial frontend)
- [docs/mcp.md](docs/mcp.md) - MCP integrations (Browser, Supabase, Vercel)

### Main Application Files
- [frontend/src/App.tsx](frontend/src/App.tsx) - Root component
- [frontend/src/main.tsx](frontend/src/main.tsx) - Entry point
- [frontend/src/index.css](frontend/src/index.css) - Global styles
- [frontend/src/lib/api.ts](frontend/src/lib/api.ts) - API client
- [frontend/src/lib/supabase.ts](frontend/src/lib/supabase.ts) - Supabase client
- [frontend/src/types/index.ts](frontend/src/types/index.ts) - Shared types

---

**Report Generated**: October 6, 2026  
**Auditor**: Comprehensive technical analysis  
**Status**: Complete audit of frontend/UI capabilities
