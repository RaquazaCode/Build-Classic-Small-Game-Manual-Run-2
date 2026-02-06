export interface RandomStep {
  state: number;
  value: number;
}

function nextUint32(state: number): number {
  let t = (state + 0x6d2b79f5) >>> 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return (t ^ (t >>> 14)) >>> 0;
}

export function nextRandom(state: number): RandomStep {
  const nextState = nextUint32(state);
  return {
    state: nextState,
    value: nextState / 4294967296
  };
}

export function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    const step = nextRandom(state);
    state = step.state;
    return step.value;
  };
}

export function createSeed(): number {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi && typeof cryptoApi.getRandomValues === 'function') {
    const values = new Uint32Array(1);
    cryptoApi.getRandomValues(values);
    return values[0] >>> 0;
  }

  return (Date.now() >>> 0) ^ Math.floor(Math.random() * 0xffffffff);
}
