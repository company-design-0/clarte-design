import test from 'node:test';
import assert from 'node:assert/strict';

const { createComparisonMotion } = await import('../src/comparison-motion.js').catch(() => ({}));

test('comparison starts halfway and autoplay first reveals more modern design', () => {
  assert.equal(typeof createComparisonMotion, 'function', 'Comparison motion is not implemented');
  const motion = createComparisonMotion();
  assert.equal(motion.position, 50);
  motion.advance(0);
  assert.ok(motion.advance(1000) < 50, 'moving left must reveal the modern layer');
});

test('holding the divider pauses autoplay and release waits five seconds', () => {
  const motion = createComparisonMotion();
  motion.advance(0);
  motion.beginInteraction(1000);
  motion.setPosition(72);
  assert.equal(motion.advance(9000), 72, 'never move while the pointer is held');
  motion.endInteraction(9000);
  assert.equal(motion.advance(13999), 72);
  assert.equal(motion.advance(14000), 72);
  const resumed = motion.advance(14016);
  assert.ok(resumed < 72 && resumed > 71, 'resume smoothly from the user position, not 50%');
});

test('autoplay travels back and forth while manual control can reveal either complete layer', () => {
  const motion = createComparisonMotion();
  motion.advance(0);
  let previous = motion.position;
  let reversed = false;
  for (let time = 16; time <= 30000; time += 16) {
    const value = motion.advance(time);
    assert.ok(value >= 8 && value <= 92, 'autoplay leaves a glimpse of each version');
    if (value > previous) reversed = true;
    previous = value;
  }
  assert.ok(reversed, 'autoplay must reverse instead of getting stuck at the edge');
  motion.setPosition(-20);
  assert.equal(motion.position, 0);
  motion.setPosition(120);
  assert.equal(motion.position, 100);
});

test('visibility, explicit pause and reduced motion stop autoplay without blocking manual input', () => {
  const motion = createComparisonMotion();
  motion.advance(0);
  motion.setEnvironment({ visible: false });
  assert.equal(motion.advance(10000), 50);
  motion.setEnvironment({ visible: true });
  assert.equal(motion.advance(20000), 50, 'returning onscreen does not catch up hidden time');
  assert.ok(motion.advance(20016) < 50);
  motion.setEnvironment({ paused: true });
  const stopped = motion.position;
  assert.equal(motion.advance(30000), stopped);
  motion.setEnvironment({ paused: false, reducedMotion: true });
  assert.equal(motion.advance(40000), stopped);
  motion.setPosition(30);
  assert.equal(motion.advance(50000), 30);
});


test('resuming at either fully revealed edge never jumps to the autoplay bounds', () => {
  for (const edge of [0, 100]) {
    const motion = createComparisonMotion();
    motion.beginInteraction(0);
    motion.setPosition(edge);
    motion.endInteraction(0);
    assert.equal(motion.advance(5000), edge);
    const moved = motion.advance(5016);
    assert.ok(Math.abs(moved - edge) < 1);
    assert.ok(edge === 0 ? moved > edge : moved < edge);
  }
});
