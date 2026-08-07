// Web Audio API Synthesizer for Alarm Sounds

let audioCtx: AudioContext | null = null;
let activeOscillators: OscillatorNode[] = [];
let alarmIntervalId: any = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function startAlarmSound(soundType: string) {
  stopAlarmSound(); // stop any previous
  const ctx = getAudioContext();

  const playTone = (freq: number, type: OscillatorType, duration: number) => {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
      activeOscillators.push(osc);
    } catch (e) {
      console.error('Audio playback error', e);
    }
  };

  switch (soundType) {
    case 'energetic_synth':
      alarmIntervalId = setInterval(() => {
        playTone(523.25, 'sawtooth', 0.15); // C5
        setTimeout(() => playTone(659.25, 'sawtooth', 0.15), 150); // E5
        setTimeout(() => playTone(783.99, 'sawtooth', 0.25), 300); // G5
      }, 700);
      break;

    case 'nature_birds':
      alarmIntervalId = setInterval(() => {
        playTone(1046.50, 'sine', 0.12);
        setTimeout(() => playTone(1318.51, 'sine', 0.12), 100);
        setTimeout(() => playTone(1567.98, 'sine', 0.2), 220);
      }, 1000);
      break;

    case 'digital_beep':
      alarmIntervalId = setInterval(() => {
        playTone(880, 'square', 0.1);
        setTimeout(() => playTone(880, 'square', 0.1), 150);
      }, 600);
      break;

    case 'loud_siren':
      alarmIntervalId = setInterval(() => {
        playTone(440, 'triangle', 0.2);
        setTimeout(() => playTone(880, 'triangle', 0.2), 200);
      }, 500);
      break;

    case 'gentle_chime':
    default:
      alarmIntervalId = setInterval(() => {
        playTone(440, 'sine', 0.4); // A4
        setTimeout(() => playTone(554.37, 'sine', 0.4), 300); // C#5
        setTimeout(() => playTone(659.25, 'sine', 0.6), 600); // E5
      }, 1200);
      break;
  }
}

export function stopAlarmSound() {
  if (alarmIntervalId) {
    clearInterval(alarmIntervalId);
    alarmIntervalId = null;
  }
  activeOscillators.forEach((osc) => {
    try {
      osc.stop();
      osc.disconnect();
    } catch (e) {
      // ignore
    }
  });
  activeOscillators = [];
}
