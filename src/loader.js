// Entry is sequenced by real animation completion, never by a short guessed delay.
export async function completeIntro({ assetsReady, logoReady, hold, exit, enter }) {
  await Promise.allSettled([assetsReady, logoReady]);
  await hold();
  await exit();
  enter();
}
