import test from 'node:test';
import assert from 'node:assert/strict';

const { completeIntro } = await import('../src/loader.js').catch(() => ({}));
function deferred() {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
}

test('page entry waits for assets, completed logo, the hold and the full exit animation', async () => {
  assert.equal(typeof completeIntro, 'function', 'Animation-aware loader is missing');
  const assets = deferred();
  const logo = deferred();
  const hold = deferred();
  const exit = deferred();
  const steps = [];
  const completion = completeIntro({
    assetsReady: assets.promise,
    logoReady: logo.promise,
    hold: async () => { steps.push('hold'); await hold.promise; },
    exit: async () => { steps.push('exit'); await exit.promise; },
    enter: () => steps.push('enter'),
  });
  assets.resolve();
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(steps, [], 'fast loading must not cut off the logo');
  logo.resolve();
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(steps, ['hold']);
  hold.resolve();
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(steps, ['hold', 'exit']);
  exit.resolve();
  await completion;
  assert.deepEqual(steps, ['hold', 'exit', 'enter']);
});
