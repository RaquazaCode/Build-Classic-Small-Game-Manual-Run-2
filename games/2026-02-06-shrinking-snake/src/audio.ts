export interface AudioController {
  prime: () => Promise<void>;
  startMenuMusic: () => Promise<void>;
  startGameMusic: () => Promise<void>;
  playGameOverSting: () => Promise<void>;
  stopAll: () => void;
}

type MusicMode = 'idle' | 'menu' | 'game';

function getAudioContextCtor(): typeof AudioContext | null {
  const maybeCtor = (globalThis as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext });
  return maybeCtor.AudioContext ?? maybeCtor.webkitAudioContext ?? null;
}

export function createAudioController(): AudioController {
  let context: AudioContext | null = null;
  let masterGain: GainNode | null = null;
  let musicLoopId: number | null = null;
  let mode: MusicMode = 'idle';

  async function ensureContext(): Promise<AudioContext | null> {
    const Ctor = getAudioContextCtor();
    if (!Ctor) {
      return null;
    }

    if (!context) {
      context = new Ctor();
      masterGain = context.createGain();
      masterGain.gain.value = 0;
      masterGain.connect(context.destination);
    }

    if (context.state === 'suspended') {
      await context.resume();
    }

    return context;
  }

  function stopLoop(): void {
    if (musicLoopId !== null) {
      window.clearInterval(musicLoopId);
      musicLoopId = null;
    }
  }

  function fadeMaster(target: number, durationSec: number): void {
    if (!context || !masterGain) {
      return;
    }

    masterGain.gain.cancelScheduledValues(context.currentTime);
    masterGain.gain.linearRampToValueAtTime(target, context.currentTime + durationSec);
  }

  function playTone(
    frequency: number,
    durationSec: number,
    type: OscillatorType,
    gainAmount: number,
    startTime: number
  ): void {
    if (!context || !masterGain || frequency <= 0) {
      return;
    }

    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(gainAmount, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + durationSec);

    oscillator.connect(gain);
    gain.connect(masterGain);

    oscillator.start(startTime);
    oscillator.stop(startTime + durationSec + 0.02);
  }

  function schedulePattern(pattern: number[], stepMs: number, type: OscillatorType, gain: number): void {
    if (!context) {
      return;
    }

    let index = 0;
    const initialTime = context.currentTime + 0.02;
    playTone(pattern[0] ?? 0, Math.max(0.06, stepMs / 1000 * 0.9), type, gain, initialTime);

    musicLoopId = window.setInterval(() => {
      if (!context) {
        return;
      }
      const frequency = pattern[index % pattern.length] ?? 0;
      const duration = Math.max(0.06, stepMs / 1000 * 0.9);
      playTone(frequency, duration, type, gain, context.currentTime + 0.01);
      index += 1;
    }, stepMs);
  }

  async function startMenuMusic(): Promise<void> {
    const activeContext = await ensureContext();
    if (!activeContext || mode === 'menu') {
      return;
    }

    stopLoop();
    fadeMaster(0.085, 0.2);
    schedulePattern([220, 247, 262, 0, 294, 262, 247, 0], 260, 'square', 0.06);
    mode = 'menu';
  }

  async function startGameMusic(): Promise<void> {
    const activeContext = await ensureContext();
    if (!activeContext || mode === 'game') {
      return;
    }

    stopLoop();
    fadeMaster(0.09, 0.12);
    schedulePattern([262, 330, 392, 330, 440, 392, 523, 392], 150, 'square', 0.065);
    mode = 'game';
  }

  async function playGameOverSting(): Promise<void> {
    const activeContext = await ensureContext();
    if (!activeContext) {
      return;
    }

    stopLoop();
    mode = 'idle';

    const now = activeContext.currentTime + 0.01;
    fadeMaster(0.095, 0.08);
    playTone(330, 0.18, 'square', 0.09, now);
    playTone(247, 0.22, 'square', 0.09, now + 0.18);
    playTone(196, 0.28, 'triangle', 0.08, now + 0.34);

    window.setTimeout(() => {
      fadeMaster(0.05, 0.35);
    }, 420);
  }

  function stopAll(): void {
    stopLoop();
    mode = 'idle';
    fadeMaster(0, 0.2);
  }

  return {
    prime: async () => {
      await ensureContext();
    },
    startMenuMusic,
    startGameMusic,
    playGameOverSting,
    stopAll
  };
}
