// Compare-and-swap storage makes the limit durable across serverless instances.
export async function consumeAttempt(store, key, now = Math.floor(Date.now() / 1000)) {
  for (let attempt = 0; attempt < 20; attempt++) {
    const current = await store.read(key);
    const state = current?.value;
    const value = !state || now >= state.reset ? { count: 1, reset: now + 15 * 60 } : { ...state, count: state.count + 1 };
    if (value.count > 5) return false;
    try {
      await store.write(key, value, current?.etag);
      return true;
    } catch (error) {
      if (!error.conflict) throw error;
    }
  }
  return false;
}
