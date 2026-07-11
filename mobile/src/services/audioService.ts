import { Platform } from 'react-native';

const SOUND_CONFIGS: Record<string, { frequencies: number[]; pattern: number[]; type?: OscillatorType }> = {
  default: {
    frequencies: [880, 1100, 880, 1100],
    pattern: [200, 150, 200, 500],
    type: 'square',
  },
  gentle: {
    frequencies: [523, 659, 784, 659],
    pattern: [350, 350, 350, 600],
    type: 'sine',
  },
  birds: {
    frequencies: [1400, 1600, 1200, 1500, 1700],
    pattern: [120, 120, 120, 120, 300],
    type: 'sine',
  },
  chime: {
    frequencies: [1046, 1318, 1567, 2093],
    pattern: [400, 400, 400, 800],
    type: 'sine',
  },
  radar: {
    frequencies: [900, 900, 900, 900],
    pattern: [80, 80, 80, 500],
    type: 'square',
  },
  beacon: {
    frequencies: [440, 554, 440, 554],
    pattern: [400, 400, 400, 800],
    type: 'triangle',
  },
};

class AlarmAudioService {
  private audioContext: AudioContext | null = null;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private isPlaying = false;
  private currentSound = 'default';
  private unlocked = false;

  /**
   * Call this once at app startup. It listens for the first user interaction
   * (click, touch, keydown) and permanently unlocks the AudioContext.
   * After that, audio can play automatically anytime — including alarm triggers.
   */
  async forceUnlock() {
    if (Platform.OS !== 'web') return;
    if (this.unlocked) return;
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      // Play a silent buffer in a loop to keep context permanently active
      const buf = this.audioContext.createBuffer(1, 1, 22050);
      const src = this.audioContext.createBufferSource();
      src.buffer = buf;
      src.loop = true; // Loop silence
      src.connect(this.audioContext.destination);
      src.start(0);

      this.unlocked = true;
      console.log('[AlarmAudio] AudioContext forced unlock ✓');
    } catch (e) {
      console.warn('[AlarmAudio] Force unlock failed:', e);
    }
  }

  initGlobalUnlock() {
    if (Platform.OS !== 'web') return;
    const unlock = () => this.forceUnlock();
    document.addEventListener('click', unlock, { once: true });
    document.addEventListener('touchstart', unlock, { once: true });
    document.addEventListener('keydown', unlock, { once: true });
  }

  private playToneSequence(soundName: string): number {
    if (!this.audioContext || this.audioContext.state !== 'running') {
      console.warn('[AlarmAudio] Context not ready, state:', this.audioContext?.state);
      return 2;
    }
    const ctx = this.audioContext;
    const config = SOUND_CONFIGS[soundName] || SOUND_CONFIGS['default'];
    let time = ctx.currentTime + 0.05;
    const startTime = time;

    config.frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = config.type || 'sine';
      osc.frequency.setValueAtTime(freq, time);

      const dur = config.pattern[i] / 1000;
      gain.gain.setValueAtTime(0.001, time);
      gain.gain.exponentialRampToValueAtTime(0.5, time + 0.02);
      gain.gain.setValueAtTime(0.5, time + dur - 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

      osc.start(time);
      osc.stop(time + dur);
      time += dur;
    });

    return time - startTime;
  }

  /** Start looping alarm sound. Works automatically after initGlobalUnlock(). */
  async startAlarm(soundName: string = 'default') {
    if (this.isPlaying) return;

    // If not yet unlocked, try to resume context (works if called from user gesture)
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try { await this.audioContext.resume(); } catch (_) {}
    }

    this.isPlaying = true;
    this.currentSound = soundName;

    if (Platform.OS === 'web') {
      const totalDuration = this.playToneSequence(soundName);
      const repeatMs = Math.max(totalDuration * 1000 + 800, 1500);

      this.intervalId = setInterval(() => {
        if (this.isPlaying) this.playToneSequence(this.currentSound);
      }, repeatMs);
    }
  }

  /** Preview a single tone sequence (for selecting sound in Add/Edit alarm). */
  async previewSound(soundName: string = 'default') {
    if (Platform.OS === 'web') {
      // Try to resume if needed
      if (this.audioContext && this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      this.playToneSequence(soundName);
    }
  }

  async stopAlarm() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    // Don't close the context — just stop playing, keep it unlocked for next alarm
  }

  async snooze() {
    await this.stopAlarm();
  }

  isUnlocked() {
    return this.unlocked;
  }

  isContextRunning() {
    return this.audioContext?.state === 'running';
  }
}

export const alarmAudio = new AlarmAudioService();
