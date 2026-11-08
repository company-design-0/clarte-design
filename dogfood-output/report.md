# Clarté Design — QA report

Target: local production preview at http://localhost:4317/
Scope: one-page landing, reference-image revision, VI/EN, responsive layout, navigation, contact brief and WebGL behavior.

## Current direction

`token-design.jpeg` is the visual authority. This revision replaces the original glass-orbit concept with a flat browser/phone hero, a sand outer frame, ivory surfaces, ink typography, pill controls and hairline borders. Three.js renders only the sun-and-hills illustration.

## Verification

- `npm test`: 7 contract tests passed (translation parity and completeness, anchors/IDs, contact config, industries, accessibility hooks, reference composition).
- `npm run build`: production bundle built successfully.
- `npm audit`: 0 reported vulnerabilities at verification time.
- Browser layout: 320×740, 390×844, 768×1024, 1024×768, 1280×577 and 1440×1100, each in VI and EN. All 12 combinations passed overflow, non-empty translation and canvas-containment assertions.
- Mobile menu: opens with aria-expanded=true; Escape closes it, restores inert and returns focus to the menu button.
- Form: empty submission focuses the invalid field; valid input produces a local brief. Copy action resolved and displayed the explicit not-sent message.
- Animation lifecycle: draw counts increased while the illustration was visible, remained unchanged offscreen, and increased again on return. Recorded counts: 140 → 164 → 165 → 165 → 201.
- Reduced motion: draw counts stayed at 2 across samples; no continuous animation loop.
- WebGL disabled: loading completed, CSS landscape remained visible and the page/form remained available.
- No runtime errors recorded during the tested interactions.

## Resolved findings

1. Initial visual direction diverged from reference: removed glass, orbital rings, particles, custom cursor, magnetic/tilt effects, perspective and drop shadows.
2. Initial mobile canvas obscured copy: canvas is now clipped inside the browser landscape and cannot cover page text.
3. Demo contact links looked actionable: invented addresses and social URLs removed. Unconfigured channels are not linked; form never claims to have sent a message.
4. Closed menu remained keyboard-reachable: added inert, aria-expanded, focus handling and Escape.

## Evidence

Current screenshots:
- `screenshots/desktop.png`
- `screenshots/mobile.png`
- `screenshots/mockups-mobile.png`

Machine-readable assertions:
- `responsive-results.json`
- `interaction-results.json`
- `fallback-results.json`

Screenshots named `principles-*` belong to the earlier concept and are not evidence for this revision.

## Remaining setup / limits

Real contact details and verified social URLs are still required in `src/config.js`. Working hours are an example schedule. No backend, real message delivery, public deployment, physical-device testing or Safari/Firefox testing was performed. Browser checks use Chromium emulation, not a claim of cross-browser or full WCAG certification.
