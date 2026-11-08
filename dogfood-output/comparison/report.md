# Before/after showcase verification

Target: local production preview on port 4317. Tested with Playwright using Google Chrome and touch input through Chrome DevTools Protocol.

## Implemented behavior

- Legacy design on the left, modern design on the right, revealed by clipping fixed-size layers.
- Dragging left reveals more modern design; dragging right reveals more legacy design.
- Idle autoplay oscillates between 8% and 92%, slowing near the edges. Manual control permits 0% and 100%.
- Pointer capture keeps dragging active outside the handle. Autoplay stops for the entire hold and waits 5000ms after release before continuing from the current position.
- Explicit Pause/Play control, keyboard arrows/Shift/PageUp/PageDown/Home/End, mouse and touch input.
- Offscreen and hidden-tab scheduling guards. Reduced motion disables autoplay, not manual control.
- VI/EN labels and accessible slider value descriptions.

## Executed checks

`npm test`: 13 tests passed, including five deterministic motion tests. Tests were observed failing before the new behavior was implemented.

`npm run build`: successful production build.

Real browser tests passed:

- Autoplay moved in both directions, not just toward one edge.
- Pause button held the divider stationary.
- Home/End revealed the full modern/legacy version, and browser layer dimensions did not change.
- Actual mouse drag selected 22% then 80%; holding prevented autoplay.
- Position remained 80% for 4500ms after release, then resumed smoothly after the five-second delay.
- Scrolling the comparison offscreen stopped motion, returning resumed it.
- Layout assertions passed for 320×740, 390×844, 768×1024 and 1440×1100 in VI and EN.
- Legacy mobile CTA initially overflowed its hero. Added a browser assertion reproducing the issue, adjusted only the legacy mobile typography/button spacing, and reran: all sizes passed.
- Reduced-motion context stayed at 50%; keyboard control still worked.
- Real CDP touch events dragged to 20% successfully.
- No page errors, console errors or failed network requests recorded.

## Evidence

- `results.json`: browser assertions and measurements.
- `desktop-50.png`: desktop 50/50 comparison.
- `mobile-50.png`: mobile 50/50 comparison.

Limits: Chromium-based desktop/touch emulation, not a physical-device or full cross-browser certification. Hidden-tab handling has source/model coverage; the browser lifecycle test directly exercised offscreen pause/resume.
