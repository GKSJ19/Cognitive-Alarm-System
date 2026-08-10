/**
 * alarmSoundService.ts
 *
 * Generates a realistic alarm tone using the Web Audio API.
 * Works on web without any external .mp3 files.
 *
 * On native platforms the file is a no-op (Vibration is used instead).
 */

import { Platform } from 'react-native';

let audioContext: AudioContext | null = null;
let oscillatorNodes: OscillatorNode[] = [];
let gainNode: GainNode | null = null;
let isPlaying = false;
let loopTimer: ReturnType<typeof setInterval> | null = null;

/**
 * Play a repeating alarm beep pattern.
 * Pattern: two quick beeps (high-low), pause, repeat.
 */
export function playAlarmSound(): void {
  if (Platform.OS !== 'web') return; // native uses Vibration
  if (isPlaying) return;

  try {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return;
    audioContext = new AC();
    gainNode = audioContext.createGain();
    gainNode.gain.value = 0.35; // comfortable volume
    gainNode.connect(audioContext.destination);

    isPlaying = true;
    playBeepPattern();

    // Repeat the beep pattern every 1.6 seconds
    loopTimer = setInterval(() => {
      if (isPlaying) {
        playBeepPattern();
      }
    }, 1600);
  } catch (_err) {
    // Swallow — AudioContext not available
  }
}

function playBeepPattern(): void {
  if (!audioContext || !gainNode) return;

  const now = audioContext.currentTime;

  // Beep 1 – high tone (880 Hz, 200ms)
  scheduleBeep(880, now, 0.2);
  // Beep 2 – lower tone (660 Hz, 200ms) after 300ms gap
  scheduleBeep(660, now + 0.3, 0.2);
  // Beep 3 – high tone again after another 300ms gap
  scheduleBeep(880, now + 0.6, 0.2);
}

function scheduleBeep(frequency: number, startTime: number, duration: number): void {
  if (!audioContext || !gainNode) return;

  const osc = audioContext.createOscillator();
  osc.type = 'square'; // Sharp alarm-like tone
  osc.frequency.value = frequency;

  // Small envelope to avoid click artifacts
  const env = audioContext.createGain();
  env.gain.setValueAtTime(0, startTime);
  env.gain.linearRampToValueAtTime(1, startTime + 0.01);
  env.gain.setValueAtTime(1, startTime + duration - 0.02);
  env.gain.linearRampToValueAtTime(0, startTime + duration);

  osc.connect(env);
  env.connect(gainNode);

  osc.start(startTime);
  osc.stop(startTime + duration);

  oscillatorNodes.push(osc);

  // Clean up finished oscillators
  osc.onended = () => {
    oscillatorNodes = oscillatorNodes.filter(n => n !== osc);
  };
}

/**
 * Stop the alarm sound immediately.
 */
export function stopAlarmSound(): void {
  isPlaying = false;

  if (loopTimer) {
    clearInterval(loopTimer);
    loopTimer = null;
  }

  oscillatorNodes.forEach(osc => {
    try { osc.stop(); } catch (_) { /* already stopped */ }
  });
  oscillatorNodes = [];

  if (audioContext) {
    try { audioContext.close(); } catch (_) { /* ignore */ }
    audioContext = null;
  }
  gainNode = null;
}

export default { playAlarmSound, stopAlarmSound };
