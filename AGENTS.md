# Repository Guidelines

## Project Structure & Module Organization
- `src/`: Application code. Key dirs: `components/` (reusable UI), `pages/` (route views), `contexts/` (React context/state), `hooks/` (custom hooks), `utils/` and `lib/` (helpers), `assets/` (images). Entry points: `main.jsx`, `App.jsx`.
- `api/`: Vercel serverless endpoints used by the dashboard.
- `public/`: Static assets served as-is. `dist/`: Production build output.
- Config: `vite.config.js`, `eslint.config.js`. Env: `.env.local` (private), `.env.example` (template).

## Build, Test, and Development Commands
- `pnpm install`: Install dependencies.
- `pnpm dev`: Start Vite dev server with HMR.
- `pnpm build`: Create production bundle in `dist/`.
- `pnpm preview`: Serve the production build locally.
- `pnpm lint`: Run ESLint across the repo.

## Coding Style & Naming Conventions
- Language: React 19 + JSX, ES modules, functional components and hooks.
- Indentation: 2 spaces; prefer arrow functions (`const Component = () => {}`).
- Files: Components and pages use PascalCase (e.g., `UserCard.jsx`, `EnhancedBrandPerformance.jsx`). Hooks start with `use` and camelCase (e.g., `useAuth.js`).
- Linting: ESLint with React Hooks and Refresh plugins; `no-unused-vars` enforced. Run `pnpm lint` before commits.

## Testing Guidelines
- No unit test runner is configured yet. For new tests, prefer Vitest + React Testing Library and name files `*.test.jsx` colocated in `src/`.
- Until tests exist, do manual QA: run `pnpm dev`, exercise main pages, verify routes and critical flows (auth, projections, admin actions).

## Commit & Pull Request Guidelines
- Commits: Imperative, concise, and scoped (e.g., "Fix ESLint errors", "Add brand deletion to admin dashboard", "Replace Peak Month card").
- PRs: Include clear description, linked issues, and screenshots/GIFs for UI changes. Note env changes. Ensure `pnpm lint` and `pnpm build` pass; verify Vercel preview builds cleanly.

## Security & Configuration Tips
- Secrets live in `.env.local`; never commit them. Keep `.env.example` current when keys change.
- Review `SETUP.md` and `DEPLOYMENT.md` for Supabase, KV, and deployment specifics.

