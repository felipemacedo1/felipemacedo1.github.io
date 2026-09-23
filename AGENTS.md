# Working on Felipe's engineering portfolio

## Hard invariants

- Production is exclusively static GitHub Pages in `felipemacedo1/felipemacedo1.github.io`.
- Domain `felipemacedo.me`: preserve root CNAME, public/CNAME, dist/CNAME and Pages settings.
- Recurring infrastructure cost R$ 0. No backend, serverless, databases, paid service, runtime API or Node deployment. No secrets in client bundles.
- Work in a branch and PR. Do not merge or replace the published site unless requested. Original state is commit `3e0014b` / `archive/pre-engineering-redesign`.
- Never invent experience, metrics, dates, credentials or production-readiness. Read current upstream docs before changing project claims.

## Architecture and content

Astro 7 static output with TypeScript, CSS and lazily imported Three.js. No framework hydration. Pages `/` (PT), `/en/`, `/legacy/`, `/404.html`. `src/components/Portfolio.astro` composes the semantic sections; `Project.astro` renders a case; `Diagram.astro` is the readable fallback. Content authority is `src/content/profile.ts` and `projects.ts`; contacts are centralized in `profile`. Preserve both languages; Spanish is an extension point, not a claimed shipped locale.

Design: engineering laboratory, graphite, generous space, restrained cyan, typography first. No gamer neon, fake HUD statistics, scroll hijacking, obligatory terminal, generic skill cloud or decorative loaders. Any graphic motion must explain systems. Preserve short human copy and conservative status labels.

## Graphics and performance

One WebGL2 renderer in `src/graphics/scene.ts`. Do not introduce per-project canvases. The SVG viewport controls scene placement; account for SVG letterboxing. Reuse buffers and draw calls. Keep content visible before JS. WebGPU is evaluated but not implemented; do not claim automatic WebGPU fallback.

Mobile reduces points, DPR and FPS. Hidden tabs and offscreen diagrams stop scheduling frames. Reduced motion draws only on change. Test context loss and GPU initialization failure. `?no3d` is a diagnostic path. Avoid new third-party asset requests. Original graphics and local fonts only unless a licensed asset adds clear value.

Gzip build budgets: all JS <200 KB; CSS <20 KB; each locale HTML <30 KB. Do not raise budgets to hide regressions. Fonts/images must remain bounded with width/height, lazy loading below fold. Inspect any large bundle change.

## Accessibility

Semantic HTML remains complete with JS disabled. Keep native anchors, browser scrolling, keyboard access, visible focus, skip link and one h1. Do not hide content for animation. Decorative canvas is aria-hidden and pointer-transparent. Honor OS reduced-motion changes and the explicit toggle. Avoid aria-label replacing visible link text with a different name. Diagrams need HTML labels or meaningful SVG names; static fallback is first-class.

## Credly

IDs: `src/content/credentials.mjs`. Run `npm run sync:credly`; review and commit `src/data/credentials.generated.json` plus `public/badges/`. Official source is `/api/v1/public_badges/{id}`; no `/api/credly` production route. Whitelist metadata, validate public/accepted state and Felipe's recipient identity, exclude personal recipient/tracking fields. Exact issuer names/titles; unknown dates null. Preserve prior valid snapshot on outage. Never replace issuance with today's date. `checkedAt` is retrieval time only. Run `CREDLY_OFFLINE=1 npm run sync:credly` to verify fallback stability.

## Validation and deploy

Node 24; `npm ci`. Required: `npm run lint`, `npm test`, `npm run build`, `npm run test:e2e`. Install browser with `npx playwright install --with-deps chromium`; optional `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` for system Chrome. Preview the built output and visually inspect desktop, laptop, tablet, phone and full-page scrolling. Use `npm run lighthouse` with the preview server running. Keep reproducible evidence/limits in `docs/QA.md`. Format with `npm run format`.

Workflow builds/uploads dist and deploys only main; PR does not publish. Pages must use workflow source, not legacy branch source. Confirm deployed CNAME, HTTPS, locale routes, metadata and stale-worker migration after a real deployment. Local tests are not evidence of a successful hosted Actions run. Report GitHub account/billing restrictions separately if encountered. Never bypass security or billing controls.
