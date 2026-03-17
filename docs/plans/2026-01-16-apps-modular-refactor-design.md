# Apps Modular Refactor Design

## Goal
Restructure the codebase so shared infrastructure lives under `src/components/`, while each app becomes a standalone module under `src/apps/<app>/` with its own components, store, hooks, utils, and types. Behavior should remain unchanged; this is a structural refactor.

## Scope
- Move app-specific UI, store, hooks, utils, and types into app directories.
- Move shared infrastructure (contexts, global store, global hooks, shared lib, shared types) under `src/components/`.
- Split app-specific state so blog/profile data can move into app stores while shared OS state stays centralized.
- Preserve entrypoint filenames (e.g., `BlogsApp.tsx`).
- Keep `NewProfileApp` reusing profile domain types/store.

## Target Structure (Selected)
- `src/apps/blogs/`
  - `BlogsApp.tsx`
  - `components/` (BlogPostEditor/View/Search/TagFilter/TagInput)
  - `store/` (blog atoms + actions)
  - `hooks/` (useBlogPosts)
  - `utils/` (url helpers)
  - `types/` (BlogPost types)
- `src/apps/profile/`
  - `ProfileApp.tsx`
  - `components/` (ProfileView/Editor/WidgetGrid/widgets)
  - `store/` (profile atoms + actions)
  - `types/` (profile domain types)
- `src/apps/new-profile/`
  - `NewProfileApp.tsx` (imports profile store/types)
- `src/apps/clock/ClockApp.tsx`
- `src/apps/terminal/TerminalApp.tsx`

Shared infrastructure under `src/components/`:
- `components/contexts/` (Dialog/Toast/WindowContextMenu)
- `components/store/` (OS windowing atoms/actions, shared app state)
- `components/hooks/` (useOS/useAllProfiles)
- `components/lib/` (local data loaders and helpers)
- `components/types/` (window and shared system types)
- Keep shared UI in `components/common`, `components/desktop`, `components/window`, `components/taskbar`, `components/topbar`.

## Type Decisions
- Split `src/types/database.ts` so blog/profile table types move into their app `types/` folders.
- Keep system info types under shared `components/types`.

## Data Flow
- Root loader continues to fetch system/profile/blog data and hydrates atoms, but imports app-specific blog/profile atoms from their app stores.
- `Desktop` imports app entrypoints from new app paths and still uses shared windowing store and shared hooks.
- `NewProfileApp` uses profile store/types from the profile app.

## Migration Approach
- Move app folders first (blogs, profile, new-profile, clock, terminal) and update imports.
- Move shared infra into `src/components/` and update imports/aliases.
- Split shared state modules and update consumers (loader, hooks, apps).
- Verify build and smoke test app flows.

## Risks and Mitigations
- Import breakage: update paths immediately after each move.
- Cycles across apps: only allow `new-profile` to import from `profile`.
- Alias confusion: keep `@/` pointing at `src/` and use new paths consistently.

## Verification
- Build/typecheck.
- Manual smoke: open each app, test blog view/edit/delete, profile edit flow, new profile creation, terminal commands, clock view, and blog deep link (`/blog/$postSlug`).
