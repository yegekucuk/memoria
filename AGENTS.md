# Memoria — Agent Guidelines

## Project Overview

Memoria is a **Next.js 16** (App Router) application built with **React 19**, **TypeScript** (strict), **Prisma 7** (PostgreSQL), and **Tailwind CSS v4**. Authentication is custom JWT stored in httpOnly cookies. There is no external state management library; the app uses React Context exclusively.

---

## Commands

### Development
```bash
npm run dev        # Start dev server (also runs prisma generate)
npm run build      # Production build (also runs prisma generate)
npm start          # Production server
```

### Linting
```bash
npm run lint       # Run ESLint (flat config, ESLint 9)
```

### Testing
```bash
npm test                                          # Run all tests
npx jest src/tests/utils/format.test.ts          # Run a single test file
npx jest src/tests/components/SessionsTable.test.tsx
npx jest --testNamePattern "formatDuration"       # Run tests matching a name pattern
npx jest --watch                                  # Watch mode
```

Test files live in `src/tests/` mirroring the `src/` structure. Use `.test.ts` for pure logic and `.test.tsx` for components. If a test requires a Node.js environment (e.g., middleware), add the inline directive `/** @jest-environment node */` at the top of the file — the default environment is `jsdom`.

---

## Architecture

```
src/
├── app/             # Next.js App Router — pages, layouts, API routes
│   └── api/         # Route handlers (route.ts per segment)
├── components/      # React client components
├── context/         # Global state via React Context (Auth, Session, Settings)
├── hooks/           # Custom hooks (feature-scoped local state)
├── lib/             # Server-side utilities (auth, prisma, rateLimit, apiUtils, validations)
├── mocks/           # Static mock data for tests
├── tests/           # All test files (mirrors src/ structure)
├── types.ts         # Shared TypeScript interfaces (Session, Tag, User)
├── constants.ts     # App-wide constants (APP_NAME, localStorage keys)
└── utils/           # Pure utility/helper functions
```

Context nesting order in root layout:
```
AuthProvider → SettingsProvider → SessionProvider
```

---

## TypeScript

- **Strict mode is enabled** (`strict: true`). Do not disable it or use `@ts-ignore`.
- Use the `@/` path alias (maps to `./src/`) for all absolute imports. Do not use deep relative paths like `../../../../`.
- Prefer `unknown` over `any` for caught errors and untyped values.
- Define prop types as interfaces immediately above the component:
  ```ts
  interface DashboardProps {
    sessions: Session[];
    onStartSession: () => void;
    isLoading: boolean;
  }
  ```
- Use `React.FC<Props>` for all components (named exports).
- All interfaces and types are PascalCase (`Session`, `Tag`, `User`, `AuthContextType`).
- Constants are SCREAMING_SNAKE_CASE (`APP_NAME`, `RATE_LIMITS`, `TIME_TARGET_KEY`).

---

## File & Naming Conventions

| Artifact | Convention | Example |
|---|---|---|
| React components | PascalCase `.tsx` | `Dashboard.tsx`, `AuthModal.tsx` |
| Context files | PascalCase + `Context` suffix `.tsx` | `AuthContext.tsx` |
| Hooks | camelCase with `use` prefix `.ts` | `useAnalyticsData.ts` |
| Utility/helper files | camelCase `.ts` | `analyticsHelpers.ts`, `format.ts` |
| Server lib files | camelCase `.ts` | `apiUtils.ts`, `auth.ts`, `prisma.ts` |
| API routes | always `route.ts` inside segment dirs | `app/api/sessions/[id]/route.ts` |
| Test files | mirror source path `.test.ts/.tsx` | `tests/utils/format.test.ts` |
| Global types | `types.ts` (flat, no `types/` directory) | — |
| Next.js pages | always `page.tsx` and `layout.tsx` | — |

---

## Import Order

Maintain this order (no blank lines between groups unless a linter enforces it):

1. React and Next.js (`react`, `next/*`)
2. Third-party libraries (`lucide-react`, `recharts`, `react-hook-form`, etc.)
3. Internal absolute imports via `@/` (context, components, hooks, lib, utils, types, constants)
4. Relative imports (only when `@/` cannot be used)

---

## Component Patterns

- All client components must have `'use client'` at the very top of the file.
- Use **named exports** for all components. Only `page.tsx` and `layout.tsx` files use `export default`.
- Small sub-components that are only used within one file may be defined in the same file, above the main component.
- Inline arrow functions for simple event handlers in JSX (`onClick={() => setIsOpen(false)}`).
- Context hooks throw if called outside their provider:
  ```ts
  export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
    return context;
  };
  ```

---

## Error Handling

### API Routes (Server-side)
All route handlers use the centralized pattern from `src/lib/apiUtils.ts`:

```ts
export async function GET(_req: Request) {
  try {
    const user = await requireAuth();       // throws ApiError(401) if unauthenticated
    // ... business logic
    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error, 'Context string for logging');
  }
}
```

- `ApiError` carries an HTTP `statusCode` and is returned as a structured JSON response.
- Unknown errors are logged with `console.error()` and returned as `500 Internal Server Error`.
- Validation/business-logic errors (400, 409, etc.) return early before the `catch` block.
- Prefix unused request parameters with `_` (e.g., `_req`) to satisfy the ESLint unused-vars rule.

### Client-side (Contexts / Hooks)
- Use `try/catch/finally` for all async operations.
- Set loading/error state in `finally` to ensure UI consistency.
- Store errors in state (`setError(message)`) for display; use `react-hot-toast` for user-facing notifications (`toast.error(...)`, `toast.success(...)`).
- For unknown caught errors, narrow the type before accessing `.message`:
  ```ts
  } catch (err: unknown) {
    if (err instanceof Error) setError(err.message);
    else setError('An unknown error occurred');
  }
  ```
- Implement optimistic updates with rollback on failure where appropriate (see `SettingsContext`).

---

## Styling

- Use **Tailwind CSS** utility classes throughout. Do not write standalone CSS files except for global styles in `app/globals.css`.
- Support dark mode via the `dark:` prefix on all interactive and background elements.
- Use the custom design tokens defined in the project: `bg-primary`, `bg-surface-dark`, `bg-background-light`, `bg-background-dark`, `bg-mesh`.
- Avoid inline `style` props unless animating with `framer-motion` or setting truly dynamic values.

---

## Testing Guidelines

- Tests live in `src/tests/` and mirror the source structure.
- Import from `@testing-library/react` and `@testing-library/jest-dom` for component tests.
- Use mock data from `src/mocks/` (`sessions.ts`, `tags.ts`) rather than creating new fixtures inline when possible.
- Wrap components in required context providers when testing components that depend on `AuthContext`, `SessionContext`, or `SettingsContext`.
- Prefer `screen.getByRole` and `screen.getByText` over `getByTestId` for queries.

---

## Database

- All DB access goes through the Prisma singleton in `src/lib/prisma.ts`. Never instantiate `PrismaClient` directly.
- Schema is in `prisma/schema.prisma`. After schema changes, run `npx prisma migrate dev` and `npx prisma generate`.
- The generated Prisma client is in `prisma/generated/client/` — do not edit it manually.

---

## Security Notes

- Never expose `JWT_SECRET`, `DATABASE_URL`, or other secrets. All secrets are read from environment variables (see `.env.example`).
- Do not weaken or bypass the rate limiter in `src/lib/rateLimit.ts` or the auth middleware in `src/middleware.ts`.
- Passwords are hashed with `bcryptjs` — never store or log plain-text passwords.
- JWT tokens are stored in httpOnly cookies managed in `src/lib/auth.ts`.
