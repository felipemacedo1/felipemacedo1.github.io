# QA record — 2026-09-23

The build was checked locally from the redesign branch with the static preview server.

| Check                    | Result                                                                                                                                                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm run lint`           | PASS — Astro diagnostics: 0 errors, 0 warnings, 0 hints                                                                                                                                                                  |
| `npm test`               | PASS — credential snapshot, official API validation and fallback tests                                                                                                                                                   |
| `npm run build`          | PASS — 4 static routes, local assets/anchors, `dist/CNAME` verified                                                                                                                                                      |
| Build budgets            | PASS — JS 132,612 B gzip; CSS 4,703 B gzip                                                                                                                                                                               |
| Browser smoke            | PASS — 9 Playwright tests                                                                                                                                                                                                |
| Viewports                | PASS — 1440 desktop, 1280 notebook, 768 tablet, 390 mobile                                                                                                                                                               |
| JavaScript disabled      | PASS — HTML, anchors and credentials remain usable                                                                                                                                                                       |
| WebGL unavailable        | PASS — SVG diagrams and case copy remain usable                                                                                                                                                                          |
| Reduced motion           | PASS — OS preference and explicit toggle tested                                                                                                                                                                          |
| Keyboard                 | PASS — skip link, native anchors, focus and language continuity                                                                                                                                                          |
| Automated accessibility  | PASS — axe WCAG 2A/2AA/2.1AA reported no violations                                                                                                                                                                      |
| Lighthouse local preview | PASS — Performance, Accessibility, Best Practices and SEO each scored 100 in the captured local run                                                                                                                      |
| External links           | PASS for GitHub/Credly (HTTP 200). LinkedIn returned 999 from the command-line request, which is an anti-automation response; the URL is the current profile URL from Felipe's README and remains a normal browser link. |

The Lighthouse result is a local preview measurement, not a claim about every device or the not-yet-switched hosted Pages build. The visual review included the hero, OpenSpeechBridge waveform, Database Radar graph, Rizoma mapping, Legacy Flight Recorder trace, credentials, contact and mobile hero. `docs/preview.webp` is a generated review artifact, not a remote asset.

The four project diagrams are conceptual illustrations. They do not report live latency, query impact, mapping confidence or runtime telemetry.
