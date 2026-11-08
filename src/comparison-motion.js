// Percent of the legacy layer visible on the left; modern occupies the right.
export function createComparisonMotion() {
  let position = 50;
  let lastTime = null;
  let dragging = false;
  let resumeAt = -Infinity;
  let direction = -1;
  let environment = { visible: true, paused: false, reducedMotion: false };
  const automatic = now => environment.visible && !environment.paused && !environment.reducedMotion && !dragging && now >= resumeAt;
  return {
    get position() { return position; },
    get resumeAt() { return resumeAt; },
    isAutomatic: automatic,
    setEnvironment(next) { environment = { ...environment, ...next }; lastTime = null; },
    setPosition(value) { position = Math.max(0, Math.min(100, value)); },
    beginInteraction(now) { dragging = true; resumeAt = now + 5000; lastTime = now; },
    endInteraction(now) { dragging = false; resumeAt = now + 5000; lastTime = now; },
    advance(now) {
      if (lastTime !== null && automatic(now)) {
        // Cap a frame gap to avoid jumping when rendering was suspended.
        const elapsed = Math.min(1000, Math.max(0, now - Math.max(lastTime, resumeAt)));
        if (position <= 8) direction = 1;
        if (position >= 92) direction = -1;
        const edgeDistance = Math.max(0, Math.min(position - 8, 92 - position));
        const speed = 0.006 + 0.012 * Math.min(1, edgeDistance / 18);
        position += direction * elapsed * speed;
        if (direction < 0 && position < 8) { position = 8 + (8 - position); direction = 1; }
        if (direction > 0 && position > 92) { position = 92 - (position - 92); direction = -1; }
      }
      lastTime = now;
      return position;
    },
  };
}
