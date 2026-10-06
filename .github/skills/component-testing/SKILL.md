---
applyTo: "frontend/**/*.{test,spec}.{ts,tsx}"
---

# Component Testing Skill

**Use this skill when:**
- Writing tests for React components
- Testing component variants and props
- Testing user interactions (click, type, submit)
- Testing loading, error, success, empty states
- Testing accessibility (keyboard navigation, ARIA, focus)
- Testing responsive behavior
- Verifying component behavior matches design system

**Goal**: Write meaningful tests that catch regressions and ensure components work as designed.

---

## Setup & Tools

**Test Runner**: Vitest (configured)
**Testing Library**: `@testing-library/react` (for user-centric tests)
**User Interaction**: `@testing-library/user-event` (simulates real user actions)

### Run Tests

```bash
npm run test         # Run all tests once
npm run test:watch   # Watch mode (re-run on changes)
npm run test:ui      # Browser UI (visualize test results)
```

### Test File Structure

```
components/
  Button.tsx
  Button.test.tsx      ← Test file (same folder as component)
  index.ts

components/
  ProjectForm.tsx
  ProjectForm.test.tsx ← Test file
  index.ts
```

---

## Part 1: Component Variant Testing

**Test different props and combinations.**

### Button Component Example

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  // Render check
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  // Variant prop
  describe('variants', () => {
    it('renders primary variant', () => {
      render(<Button variant="primary">Primary</Button>);
      const button = screen.getByText('Primary');
      expect(button).toHaveClass('btn-primary');
    });

    it('renders secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByText('Secondary');
      expect(button).toHaveClass('btn-secondary');
    });

    it('renders ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByText('Ghost');
      expect(button).toHaveClass('btn-ghost');
    });
  });

  // Size prop
  describe('sizes', () => {
    it('renders small size', () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByText('Small');
      expect(button).toHaveClass('px-3', 'py-1', 'text-sm');
    });

    it('renders large size', () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByText('Large');
      expect(button).toHaveClass('px-6', 'py-3', 'text-lg');
    });
  });

  // Disabled state
  it('renders disabled button', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByText('Disabled')).toBeDisabled();
  });

  // Children content
  it('renders with icon children', () => {
    render(
      <Button>
        <Icon />
        Click me
      </Button>
    );
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

**Pattern**: Test each prop combination and variant independently.

---

## Part 2: User Interaction Testing

**Test what happens when users click, type, or submit.**

### Form Component Example

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProjectForm } from './ProjectForm';

describe('ProjectForm', () => {
  it('renders form fields', () => {
    render(<ProjectForm onCreate={() => {}} isLoading={false} />);
    
    expect(screen.getByLabelText(/project name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
  });

  it('submits form with data', async () => {
    const onCreate = vi.fn();
    render(<ProjectForm onCreate={onCreate} isLoading={false} />);
    
    const user = userEvent.setup();
    
    // Type in form fields
    await user.type(screen.getByLabelText(/project name/i), 'My Project');
    await user.type(screen.getByLabelText(/description/i), 'A great project');
    
    // Submit
    await user.click(screen.getByRole('button', { name: /create/i }));
    
    // Verify callback was called with correct data
    expect(onCreate).toHaveBeenCalledWith({
      name: 'My Project',
      description: 'A great project'
    });
  });

  it('prevents submit when name is empty', async () => {
    const onCreate = vi.fn();
    render(<ProjectForm onCreate={onCreate} isLoading={false} />);
    
    const user = userEvent.setup();
    
    // Leave name empty, fill description
    await user.type(screen.getByLabelText(/description/i), 'No name project');
    
    // Try to submit
    await user.click(screen.getByRole('button', { name: /create/i }));
    
    // onCreate should NOT be called (validation prevented it)
    expect(onCreate).not.toHaveBeenCalled();
    
    // Error message should show
    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
  });

  it('clears form after successful submit', async () => {
    const onCreate = vi.fn().mockResolvedValue(undefined);
    render(<ProjectForm onCreate={onCreate} isLoading={false} />);
    
    const user = userEvent.setup();
    
    // Fill and submit
    await user.type(screen.getByLabelText(/project name/i), 'Test');
    await user.click(screen.getByRole('button', { name: /create/i }));
    
    // Wait for async submission to complete
    await vi.waitFor(() => {
      // Form should be cleared
      expect(screen.getByLabelText(/project name/i)).toHaveValue('');
    });
  });
});
```

**Pattern**: Use `userEvent` for realistic user interactions. Test the happy path, error cases, and form validation.

---

## Part 3: State Testing

**Test component behavior when data is loading, has errors, or is empty.**

### List Component Example

```typescript
import { render, screen } from '@testing-library/react';
import { ProjectList } from './ProjectList';

describe('ProjectList', () => {
  const mockProjects = [
    { id: '1', name: 'Project A', description: 'Desc A' },
    { id: '2', name: 'Project B', description: 'Desc B' }
  ];

  describe('loading state', () => {
    it('shows loading message', () => {
      render(
        <ProjectList 
          projects={[]} 
          isLoading={true}
          onDelete={() => {}}
        />
      );
      
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('disables delete buttons during loading', () => {
      render(
        <ProjectList 
          projects={mockProjects} 
          isLoading={true}
          onDelete={() => {}}
        />
      );
      
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      deleteButtons.forEach(btn => {
        expect(btn).toBeDisabled();
      });
    });
  });

  describe('empty state', () => {
    it('shows empty message when no projects', () => {
      render(
        <ProjectList 
          projects={[]} 
          isLoading={false}
          onDelete={() => {}}
        />
      );
      
      expect(screen.getByText(/no projects/i)).toBeInTheDocument();
    });

    it('shows action button in empty state', () => {
      render(
        <ProjectList 
          projects={[]} 
          isLoading={false}
          onDelete={() => {}}
        />
      );
      
      expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('shows error message', () => {
      render(
        <ProjectList 
          projects={[]} 
          isLoading={false}
          error="Failed to load projects"
          onDelete={() => {}}
        />
      );
      
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    });

    it('shows retry button on error', () => {
      render(
        <ProjectList 
          projects={[]} 
          isLoading={false}
          error="Network error"
          onRetry={() => {}}
          onDelete={() => {}}
        />
      );
      
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });

  describe('success state', () => {
    it('renders projects', () => {
      render(
        <ProjectList 
          projects={mockProjects} 
          isLoading={false}
          onDelete={() => {}}
        />
      );
      
      expect(screen.getByText('Project A')).toBeInTheDocument();
      expect(screen.getByText('Project B')).toBeInTheDocument();
    });

    it('renders delete button for each project', () => {
      render(
        <ProjectList 
          projects={mockProjects} 
          isLoading={false}
          onDelete={() => {}}
        />
      );
      
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      expect(deleteButtons).toHaveLength(2);
    });
  });
});
```

**Pattern**: Test all states: loading, empty, error, success. Each state tells a story about what the user sees.

---

## Part 4: Accessibility Testing

**Ensure components are keyboard and screen-reader accessible.**

### Accessible Form Testing

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProjectForm } from './ProjectForm';

describe('ProjectForm - Accessibility', () => {
  it('has associated labels for all inputs', () => {
    render(<ProjectForm onCreate={() => {}} />);
    
    const nameInput = screen.getByLabelText(/project name/i);
    const descInput = screen.getByLabelText(/description/i);
    
    // Labels must be properly associated
    expect(nameInput).toHaveAttribute('id');
    expect(descInput).toHaveAttribute('id');
  });

  it('is keyboard navigable', async () => {
    render(<ProjectForm onCreate={() => {}} />);
    
    const user = userEvent.setup();
    
    // Tab through form
    const nameInput = screen.getByLabelText(/project name/i);
    const descInput = screen.getByLabelText(/description/i);
    const submitBtn = screen.getByRole('button', { name: /create/i });
    
    // Initial focus is on name input (first focusable)
    await user.tab();
    expect(nameInput).toHaveFocus();
    
    // Tab to description
    await user.tab();
    expect(descInput).toHaveFocus();
    
    // Tab to button
    await user.tab();
    expect(submitBtn).toHaveFocus();
    
    // Shift+Tab goes backward
    await user.tab({ shift: true });
    expect(descInput).toHaveFocus();
  });

  it('button can be activated with Space', async () => {
    const onClick = vi.fn();
    render(<button onClick={onClick}>Click me</button>);
    
    const user = userEvent.setup();
    const button = screen.getByRole('button');
    
    await user.tab();  // Focus button
    expect(button).toHaveFocus();
    
    await user.keyboard(' ');  // Press Space
    expect(onClick).toHaveBeenCalled();
  });

  it('button can be activated with Enter', async () => {
    const onClick = vi.fn();
    render(<button onClick={onClick}>Click me</button>);
    
    const user = userEvent.setup();
    const button = screen.getByRole('button');
    
    await user.tab();     // Focus button
    await user.keyboard('{Enter}');  // Press Enter
    expect(onClick).toHaveBeenCalled();
  });

  it('disables autocomplete on password inputs', () => {
    render(<input type="password" />);
    
    const input = screen.getByDisplayValue('');
    // Should have autocomplete disabled for security
    expect(input).toHaveAttribute('autoComplete', 'off');
  });

  it('has proper heading hierarchy', () => {
    render(
      <div>
        <h1>Main Title</h1>
        <section>
          <h2>Section Heading</h2>
          <p>Content</p>
        </section>
      </div>
    );
    
    // h1 exists
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    // h2 exists (not skipping to h3)
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
  });

  it('buttons have visible focus state (class-based test)', () => {
    render(<ProjectForm onCreate={() => {}} />);
    
    const button = screen.getByRole('button', { name: /create/i });
    
    // Button should have focus ring class (defined in CSS)
    expect(button.className).toContain('focus-visible');
    // OR check for specific Tailwind classes
    expect(button.className).toMatch(/focus:ring|focus-visible/);
  });
});
```

**Pattern**: Test keyboard navigation (Tab, Shift+Tab, Space, Enter). Test labels are associated. Test semantic HTML. Test focus styles.

---

## Part 5: Responsive Behavior Testing

**Test component renders correctly at different viewport sizes.**

```typescript
import { render, screen } from '@testing-library/react';
import { ProjectGrid } from './ProjectGrid';

describe('ProjectGrid - Responsive', () => {
  const mockProjects = [
    { id: '1', name: 'A' },
    { id: '2', name: 'B' },
    { id: '3', name: 'C' }
  ];

  // Mock window.matchMedia for breakpoint testing
  const setViewport = (width: number) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width
    });
    window.dispatchEvent(new Event('resize'));
  };

  it('stacks cards in single column on mobile (< 768px)', () => {
    setViewport(375);
    
    render(<ProjectGrid projects={mockProjects} />);
    
    const grid = screen.getByRole('list');
    // Should have grid-cols-1 class (single column)
    expect(grid).toHaveClass('grid-cols-1');
  });

  it('shows two columns on tablet (768px+)', () => {
    setViewport(768);
    
    render(<ProjectGrid projects={mockProjects} />);
    
    const grid = screen.getByRole('list');
    // Should have md:grid-cols-2 behavior
    // Note: Testing Tailwind classes directly can be tricky
    // Better to test computed styles or mock CSS
    expect(grid).toHaveClass('md:grid-cols-2');
  });

  it('shows three columns on desktop (1024px+)', () => {
    setViewport(1024);
    
    render(<ProjectGrid projects={mockProjects} />);
    
    const grid = screen.getByRole('list');
    expect(grid).toHaveClass('lg:grid-cols-3');
  });
});
```

**Pattern**: Mock viewport width and test that responsive classes are applied. Or test with container queries if using modern CSS.

---

## Part 6: Common Testing Patterns

### Testing with Mock Data

```typescript
const mockProject = {
  id: 'uuid-123',
  name: 'Test Project',
  description: 'A test project',
  owner_id: 'user-uuid',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

describe('ProjectCard', () => {
  it('displays project data', () => {
    render(<ProjectCard project={mockProject} />);
    
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('A test project')).toBeInTheDocument();
  });
});
```

### Testing Async Operations

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('ProjectForm - Async', () => {
  it('calls onCreate and waits for completion', async () => {
    const onCreate = vi.fn().mockResolvedValue({ id: 'new-id' });
    render(<ProjectForm onCreate={onCreate} />);
    
    const user = userEvent.setup();
    
    await user.type(screen.getByLabelText(/name/i), 'New Project');
    await user.click(screen.getByRole('button', { name: /create/i }));
    
    // Wait for async operation
    await waitFor(() => {
      expect(onCreate).toHaveBeenCalled();
    });
  });

  it('handles async errors', async () => {
    const onCreate = vi.fn().mockRejectedValue(new Error('Network error'));
    render(<ProjectForm onCreate={onCreate} />);
    
    const user = userEvent.setup();
    
    await user.type(screen.getByLabelText(/name/i), 'New Project');
    await user.click(screen.getByRole('button', { name: /create/i }));
    
    // Error should display
    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });
});
```

### Testing Props Changes

```typescript
import { render, screen } from '@testing-library/react';

describe('Button - Props Changes', () => {
  it('updates when variant prop changes', () => {
    const { rerender } = render(
      <Button variant="primary">Click</Button>
    );
    
    let button = screen.getByText('Click');
    expect(button).toHaveClass('btn-primary');
    
    // Change variant
    rerender(<Button variant="secondary">Click</Button>);
    
    button = screen.getByText('Click');
    expect(button).toHaveClass('btn-secondary');
    expect(button).not.toHaveClass('btn-primary');
  });
});
```

---

## Part 7: Test File Template

**Copy this template for new component tests:**

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  describe('rendering', () => {
    it('renders', () => {
      render(<MyComponent />);
      // Add assertions
    });
  });

  describe('props', () => {
    it('accepts required prop', () => {
      render(<MyComponent requiredProp="value" />);
      // Add assertions
    });
  });

  describe('user interactions', () => {
    it('handles click', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<MyComponent onClick={onClick} />);
      
      await user.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalled();
    });
  });

  describe('states', () => {
    it('handles loading state', () => {
      render(<MyComponent isLoading={true} />);
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('handles error state', () => {
      render(<MyComponent error="Error message" />);
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('is keyboard navigable', async () => {
      const user = userEvent.setup();
      render(<MyComponent />);
      
      await user.tab();
      // Add focus assertions
    });
  });
});
```

---

## Part 8: Coverage & Best Practices

### What to Test (Meaningful Tests)

✅ **DO test:**
- User interactions (click, type, submit)
- Component variants and props
- Error and edge cases
- Accessibility (keyboard, labels, roles)
- State changes (loading, error, success)
- Conditional rendering (if statements)

❌ **DON'T test:**
- Implementation details (internal state, functions)
- Third-party libraries (trust they work)
- Simple CSS (trusts Tailwind works)
- Snapshots (brittle, hard to review)

### Test Organization

```typescript
describe('Component Name', () => {
  describe('Rendering', () => {
    it('renders', () => {});
  });

  describe('Props / Variants', () => {
    it('accepts prop', () => {});
  });

  describe('User Interactions', () => {
    it('handles click', () => {});
  });

  describe('States', () => {
    it('shows loading state', () => {});
  });

  describe('Accessibility', () => {
    it('is keyboard navigable', () => {});
  });
});
```

### Assertion Helpers

```typescript
// Preferred (user-centric)
expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
expect(screen.getByLabelText(/email/i)).toHaveValue('test@example.com');

// Less preferred (implementation-detail focused)
expect(component.find('.submit-btn')).toExist();
```

---

## When to Write Tests

**REQUIRED:**
- Complex components (more than one prop, multiple states)
- Custom hooks
- Form validation
- Conditional rendering logic

**OPTIONAL:**
- Simple components (Button, Badge, simple Card)
- Straightforward renders
- Style-only components

**NOT NEEDED:**
- Third-party components (react-query, lucide-react)
- Simple one-liners

---

## Tools & Debugging

### Run Specific Tests

```bash
npm run test -- ProjectForm.test.tsx     # Single file
npm run test -- --grep "button"          # Matching pattern
npm run test -- --ui                     # Browser UI
```

### Debug in Test

```typescript
it('debugging example', () => {
  render(<MyComponent />);
  
  // Print DOM to console
  screen.debug();
  
  // Print specific element
  screen.debug(screen.getByRole('button'));
});
```

---

## Resources

- [React Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [User Event Docs](https://testing-library.com/docs/user-event/intro/)
- [Vitest Docs](https://vitest.dev/)
- [Testing Accessibility](https://www.w3.org/WAI/test-evaluate/)
