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
  let musicLoopIds: number[] = [];
  let mode: MusicMode = 'idle';
  let primed = false;

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
    for (const loopId of musicLoopIds) {
      window.clearInterval(loopId);
    }
    musicLoopIds = [];
  }

  function fadeMaster(target: number, durationSec: number): void {
    if (!context || !masterGain) {
      return;
    }

    masterGain.gain.cancelScheduledValues(context.currentTime);
    masterGain.gain.setValueAtTime(masterGain.gain.value, context.currentTime);
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

  function schedulePattern(pattern: number[], stepMs: number, type: OscillatorType, gain: number): number {
    if (!context) {
      return -1;
    }

    let index = 0;
    const initialTime = context.currentTime + 0.02;
    playTone(pattern[0] ?? 0, Math.max(0.06, stepMs / 1000 * 0.9), type, gain, initialTime);
    index = 1;

    return window.setInterval(() => {
      if (!context) {
        return;
      }
      const frequency = pattern[index % pattern.length] ?? 0;
      const duration = Math.max(0.06, stepMs / 1000 * 0.9);
      playTone(frequency, duration, type, gain, context.currentTime + 0.01);
      index += 1;
    }, stepMs);
  }

  function scheduleDualPattern(
    melody: number[],
    bass: number[],
    stepMs: number
  ): void {
    const melodyLoop = schedulePattern(melody, stepMs, 'square', 0.17);
    const bassLoop = schedulePattern(bass, stepMs * 2, 'triangle', 0.12);

    if (melodyLoop !== -1) {
      musicLoopIds.push(melodyLoop);
    }
    if (bassLoop !== -1) {
      musicLoopIds.push(bassLoop);
    }
  }

  async function startMenuMusic(): Promise<void> {
    const activeContext = await ensureContext();
    if (!activeContext || mode === 'menu') {
      return;
    }

    stopLoop();
    fadeMaster(0.28, 0.16);
    scheduleDualPattern(
      [330, 392, 440, 392, 523, 440, 392, 349],
      [165, 196, 220, 196]
      ,220
    );
    mode = 'menu';
  }

  async function startGameMusic(): Promise<void> {
    const activeContext = await ensureContext();
    if (!activeContext || mode === 'game') {
      return;
    }

    stopLoop();
    fadeMaster(0.33, 0.08);
    scheduleDualPattern(
      [392, 494, 523, 587, 659, 587, 523, 494, 440, 523, 587, 523, 494, 440, 392, 330],
      [196, 220, 247, 220, 196, 165, 147, 165],
      130
    );
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
    fadeMaster(0.34, 0.06);
    playTone(392, 0.15, 'square', 0.2, now);
    playTone(294, 0.2, 'square', 0.2, now + 0.15);
    playTone(220, 0.28, 'triangle', 0.16, now + 0.34);

    window.setTimeout(() => {
      fadeMaster(0, 0.45);
    }, 420);
  }

  function stopAll(): void {
    stopLoop();
    mode = 'idle';
    fadeMaster(0, 0.2);
  }

  return {
    prime: async () => {
      const activeContext = await ensureContext();
      if (!activeContext || primed || !masterGain) {
        return;
      }

      const start = activeContext.currentTime + 0.01;
      playTone(440, 0.02, 'square', 0.0003, start);
      primed = true;
    },
    startMenuMusic,
    startGameMusic,
    playGameOverSting,
    stopAll
  };
}
