# BuildTwin 360 — Frontend

React + TypeScript + Vite scaffold for BuildTwin 360's web client. Module boundaries are 1:1 with the backend's domain packages (`com.example.BuildTwin360.domain.*`) so a feature is easy to trace end-to-end: same folder name on both sides, same nav entry, same route prefix.

## Stack

- **React 18** + **TypeScript**, built with **Vite**
- **React Router v6** — route-per-module, nested under a protected app shell
- **TanStack Query** — server state / caching for every module's API calls
- **Zustand** — small client state (auth session) in `src/context`
- **React Hook Form + Zod** — forms and validation
- **Tailwind CSS** — styling, driven entirely by the design tokens in `tailwind.config.ts`
- **Axios** — HTTP client (`src/lib/apiClient.ts`), base URL from `VITE_API_BASE_URL`
- **Recharts** — charts (Construction Intelligence / analytics module)
- **lucide-react** — icon set

No test tooling or test files are included by design — this scaffold is frontend-dev only.

## Getting started

```bash
npm install
cp .env.example .env      # point VITE_API_BASE_URL at your backend, default http://localhost:8080/api
npm run dev
```

## Design system (`src/design-system`)

A small, self-contained component library, imported everywhere as `@/design-system`:

- **tokens/** — `status.ts` maps backend status enums (e.g. NCR status, DPR approval state) to a consistent color/label so every module renders status the same way. Color, spacing, radius, shadow, and type-scale tokens themselves live in `tailwind.config.ts` under the `brand`, `status`, `surface`, and `ink` palettes — navy/blue brand scale, a five-state status scale (success/warning/danger/critical/info/neutral), and a compact type scale suited to dense data tables.
- **components/** — 19 primitives, each in its own folder: `Button`, `Input`, `Textarea`, `Select`, `Checkbox`, `Card`, `StatusPill`, `Table`, `Modal`, `Tabs`, `Dropdown`, `Avatar`, `EmptyState`, `Pagination`, `ProgressBar`, `StatCard`, `Spinner`, `Breadcrumbs`, `Toast`, `FileUpload`.
- **utils/cn.ts** — `clsx` + `tailwind-merge` helper used by every component for className composition.
- **index.ts** — single import surface: `import { Button, Table, StatusPill } from '@/design-system'`.

Extend the library by adding a new folder under `components/`, exporting it from `index.ts`, and reusing the existing token set — don't hardcode colors/spacing in a module page.

## Module structure (`src/modules/*`)

Every module follows the same four-piece shape:

```
modules/<module-name>/
  api/         one file per module, thin axios wrappers over the module's REST endpoints
  pages/       route-level screens (list, detail, form)
  components/  module-local components not generic enough for the design system
  routes.tsx   this module's RouteObject[], plus an allowedRoles export where access is restricted
  types.ts     TypeScript interfaces mirroring the module's backend DTOs
```

The 16 modules, mapped to the backend's `domain` packages:

| Frontend module | Backend domain package | Notes |
|---|---|---|
| `identity` | `identity` | Auth (login/forgot-password are public routes), users, roles |
| `projects` | `projects` | Project & site master |
| `wbs-schedule` | `wbs` | WBS + schedule |
| `progress-dpr` | `dpr` | Daily Progress Reports |
| `labour-contractors` | `labour` | Labour & contractor management |
| `materials-inventory` | `materials` | Materials & inventory |
| `procurement` | `procurement` | Procurement & suppliers |
| `cost-control` | `cost` | Cost & budget — role-restricted (Director / PM / Cost Coordinator) |
| `quality` | `quality` | Quality & NCR |
| `issues-risks` | `issues` | Issues & risk register |
| `equipment` | `equipment` | Equipment tracking |
| `documents` | `documents` | Document management |
| `notifications` | `notifications` | In-app notifications |
| `analytics` | `analytics` | Construction Intelligence — role-restricted (Director / PM / Data Analyst) |
| `reports` | `reports` | Reporting |
| `audit` | `audit` | Audit trail — role-restricted |

Each module is registered once in `src/routes/AppRoutes.tsx` and once in `src/constants/navigation.ts` (`NAV_ITEMS`) — that's the whole wiring surface for adding a new module.

## App shell & routing

- `src/layouts/AppShell.tsx` — sidebar + topbar + content outlet, wraps all authenticated routes
- `src/layouts/Sidebar.tsx`, `Topbar.tsx` — read `NAV_ITEMS`, filter by the current user's role
- `src/layouts/AuthLayout.tsx` — unauthenticated shell for login/forgot-password
- `src/routes/ProtectedRoute.tsx` — redirects to login if unauthenticated; optionally gates a subtree by `roles`
- `src/routes/AppRoutes.tsx` — top-level route tree, imports every module's `routes.tsx`

## Roles (`src/constants/roles.ts`)

Ten roles from the requirements spec (Director, Project Manager, Site Engineer, Site Supervisor, Procurement/Store, Cost Coordinator, Quality Engineer, Data Analyst, System Admin, Auditor), plus `FIELD_ONLY_ROLES` and `COMMERCIAL_ROLES` groupings used to hide commercial data from field roles per FR-004.

## Other conventions

- `src/lib/apiClient.ts` — configured axios instance (base URL, auth header injection)
- `src/lib/queryClient.ts` — shared TanStack Query client
- `src/context/authStore.ts` — Zustand store for the logged-in session
- Path alias `@/*` → `src/*` (see `tsconfig.json` / `vite.config.ts`) — always import via `@/...`, never relative-path across modules
- `scripts/generate-modules.mjs` — scaffolds a new module (api/pages/components/routes.tsx/types.ts) from a name, so new domain modules stay consistent with the existing 16

## Adding a new module

```bash
node scripts/generate-modules.mjs <module-name>
```

Then register its `routes.tsx` export in `AppRoutes.tsx` and add a `NAV_ITEMS` entry in `navigation.ts`.
