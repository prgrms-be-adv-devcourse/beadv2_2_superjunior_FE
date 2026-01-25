# Repository Guidelines

## Project Structure & Module Organization
- Vue 3 entry lives in `src/main.js`; the shell is `src/App.vue`, and routes are defined in `src/router/index.js`.
- Feature screens stay in `src/views/` (PascalCase). Shared UI sits in `src/components/`; helpers in `src/utils/`.
- HTTP clients are centralized under `src/api/` (`axios.js` manages interceptors, `auth.js` handles auth flows). Static/seed data is in `src/data/`; static assets are in `public/` and `src/assets/`.
- Environment values belong in `.env.development`; adjust `vue.config.js` when adding proxy targets or build tweaks.

## Build, Test, and Development Commands
- `npm install` - install dependencies after cloning or pulling.
- `npm run serve` - start the dev server on `0.0.0.0` for local/LAN checks.
- `npm run build` - create a production bundle in `dist/`; verify before tagging.
- `npm run lint` - run ESLint with Vue 3 rules; use `--fix` for quick cleanup.

## Coding Style & Naming Conventions
- ESLint presets `plugin:vue/vue3-essential` and `eslint:recommended` are enforced; keep 2-space indent, single quotes, and omit trailing semicolons to match existing files.
- Components and views use PascalCase filenames; utilities use camelCase. Keep one component per file and push shared logic into helpers/composables.
- Centralize API concerns in `src/api/`; avoid duplicating axios setup inside views.

## Testing Guidelines
- Automated tests are not configured yet. When adding them, colocate specs as `*.spec.js` under `tests/` or the relevant feature folder and mock HTTP via helpers in `src/api/axios.js`.
- Document any new test command you add to `package.json` and include run instructions in your PR.

## Commit & Pull Request Guidelines
- Follow the existing history format `type: summary` (e.g., `feat: 포인트 충전`, `fix: adjust cart totals`). Keep subjects imperative and concise.
- Before opening a PR, run `npm run lint` and `npm run build`, summarize changes, link related issues, and attach screenshots/GIFs for UI updates plus manual test notes. Mention any new env vars or config changes.

## Security & Configuration Tips
- Do not commit secrets; use `.env.*` files locally. If a key is required for review, document placeholder names.
- When adding new endpoints, update `src/api/axios.js` interceptors thoughtfully to keep auth/refresh behavior consistent.
