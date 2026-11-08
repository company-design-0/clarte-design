import { createComparisonMotion } from './comparison-motion.js';
import { DICT } from './i18n.js';

export function initComparison(root) {
  const stage = root.querySelector('.comparison-stage');
  const handle = root.querySelector('#comparisonHandle');
  const toggle = root.querySelector('#comparisonToggle');
  const status = root.querySelector('#comparisonStatus');
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motion = createComparisonMotion();
  let visible = false;
  let paused = false;
  let pointerId = null;
  let frameId = 0;
  let timerId = 0;
  let previousPosition = null;

  function render(now = performance.now()) {
    const dictionary = DICT[document.documentElement.lang === 'en' ? 'en' : 'vi'];
    const position = motion.position.toFixed(3);
    if (position !== previousPosition) {
      stage.style.setProperty('--split', `${position}%`);
      previousPosition = position;
    }
    const percent = Math.round(motion.position);
    handle.setAttribute('aria-valuenow', String(percent));
    handle.setAttribute('aria-label', dictionary['compare.slider']);
    handle.setAttribute('aria-valuetext', `${percent}% ${dictionary['compare.old']} · ${100 - percent}% ${dictionary['compare.modern']}`);
    const mode = preference.matches ? 'reduced' : paused ? 'paused' : pointerId !== null || now < motion.resumeAt ? 'manual' : 'auto';
    root.dataset.mode = mode;
    root.dataset.position = position;
    status.textContent = dictionary[`compare.${mode}`];
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.classList.toggle('is-paused', paused || preference.matches);
    toggle.disabled = preference.matches;
    const label = toggle.querySelector('[data-i18n]');
    label.dataset.i18n = paused ? 'compare.play' : 'compare.pause';
    label.textContent = dictionary[label.dataset.i18n];
  }

  function stop() {
    cancelAnimationFrame(frameId);
    clearTimeout(timerId);
    frameId = 0;
    timerId = 0;
  }

  function schedule() {
    if (!visible || document.hidden || preference.matches || paused || pointerId !== null) return;
    const remaining = motion.resumeAt - performance.now();
    if (remaining > 0) {
      timerId = window.setTimeout(() => { timerId = 0; schedule(); }, remaining + 1);
      return;
    }
    frameId = requestAnimationFrame(now => {
      frameId = 0;
      motion.advance(now);
      render(now);
      schedule();
    });
  }

  function updateEnvironment() {
    stop();
    motion.setEnvironment({ visible: visible && !document.hidden, paused, reducedMotion: preference.matches });
    render();
    schedule();
  }

  function setFromPointer(event) {
    const bounds = stage.getBoundingClientRect();
    if (bounds.width <= 0) return;
    motion.setPosition((event.clientX - bounds.left) / bounds.width * 100);
    render();
  }

  stage.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0 || pointerId !== null) return;
    stop();
    const now = performance.now();
    motion.beginInteraction(now);
    if (!event.target.closest('.comparison-divider')) {
      // Clicking the illustration pauses the demo without hijacking touch scrolling.
      motion.endInteraction(now);
      render(now);
      schedule();
      return;
    }
    pointerId = event.pointerId;
    stage.setPointerCapture(pointerId);
    stage.classList.add('is-dragging');
    handle.focus({ preventScroll: true });
    setFromPointer(event);
    event.preventDefault();
  });

  stage.addEventListener('pointermove', event => {
    if (event.pointerId === pointerId) setFromPointer(event);
  });

  function finishPointer(event) {
    if (pointerId === null || event.pointerId !== pointerId) return;
    const releasedId = pointerId;
    pointerId = null;
    stage.classList.remove('is-dragging');
    if (stage.hasPointerCapture(releasedId)) stage.releasePointerCapture(releasedId);
    motion.endInteraction(performance.now());
    render();
    schedule();
  }
  stage.addEventListener('pointerup', finishPointer);
  stage.addEventListener('pointercancel', finishPointer);
  stage.addEventListener('lostpointercapture', finishPointer);
  window.addEventListener('blur', () => finishPointer({ pointerId }));

  handle.addEventListener('keydown', event => {
    const delta = event.shiftKey ? 10 : 2;
    const positions = {
      ArrowLeft: motion.position - delta,
      ArrowDown: motion.position - delta,
      ArrowRight: motion.position + delta,
      ArrowUp: motion.position + delta,
      PageDown: motion.position - 10,
      PageUp: motion.position + 10,
      Home: 0,
      End: 100,
    };
    if (!(event.key in positions)) return;
    event.preventDefault();
    stop();
    const now = performance.now();
    motion.beginInteraction(now);
    motion.setPosition(positions[event.key]);
    motion.endInteraction(now);
    render(now);
    schedule();
  });

  toggle.addEventListener('click', () => {
    paused = !paused;
    updateEnvironment();
  });
  preference.addEventListener('change', updateEnvironment);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) finishPointer({ pointerId });
    updateEnvironment();
  });
  window.addEventListener('clarte:languagechange', () => render());
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    updateEnvironment();
  }, { threshold: 0 }).observe(stage);
  render();
}
