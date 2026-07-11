import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { alarmAudio } from '../services/audioService';

export default function AlarmRingScreen({ navigation, route }: any) {
  const theme = useTheme();
  const alarm = route.params?.alarm;
  const soundName: string = alarm?.sound_name || 'default';
  const snoozeDuration: number = alarm?.snooze_duration || 5;

  const [currentTime, setCurrentTime] = useState(new Date());
  const [snoozeCountdown, setSnoozeCountdown] = useState<number | null>(null);
  const [soundUnlocked, setSoundUnlocked] = useState(false);
  const [soundError, setSoundError] = useState('');

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in the screen
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Pulsing ring
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 500, useNativeDriver: true }),
      ])
    ).start();

    // Try starting alarm automatically
    alarmAudio.startAlarm(soundName).then(() => {
      // Small delay to let browser evaluate context state
      setTimeout(() => {
        if (alarmAudio.isContextRunning()) {
          setSoundUnlocked(true);
        }
      }, 100);
    });

    // Clock
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    return () => {
      clearInterval(timer);
      alarmAudio.stopAlarm();
    };
  }, []);

  // Snooze countdown
  useEffect(() => {
    if (snoozeCountdown === null) return;
    if (snoozeCountdown <= 0) {
      setSnoozeCountdown(null);
      return;
    }
    const t = setTimeout(() => setSnoozeCountdown(v => (v ?? 1) - 1), 1000);
    return () => clearTimeout(t);
  }, [snoozeCountdown]);

  // This MUST be called by a button press (user gesture) to unlock browser audio
  const handleUnlockAndPlaySound = async () => {
    try {
      setSoundError('');
      await alarmAudio.startAlarm(soundName);
      setSoundUnlocked(true);
    } catch (e) {
      setSoundError('Could not play sound');
    }
  };

  const handleDismiss = async () => {
    await alarmAudio.stopAlarm();
    navigation.navigate('Challenge', { alarm });
  };

  const handleSnooze = async () => {
    await alarmAudio.snooze();
    setSoundUnlocked(false);
    setSnoozeCountdown(snoozeDuration * 60);
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Top: Time display */}
      <View style={styles.topSection}>
        <Text style={styles.alarmLabel}>{alarm?.label || '⏰ Alarm'}</Text>
        <Text style={styles.timeText}>
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
        <Text style={styles.dateText}>
          {currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
        </Text>
      </View>

      {/* Middle: Pulsing ring + Sound button */}
      <View style={styles.ringSection}>
        <Animated.View style={[styles.outerRing, { transform: [{ scale: pulseAnim }] }]} />
        <View style={styles.innerRing}>
          <Text style={styles.bellIcon}>🔔</Text>
        </View>

        {/* Sound unlock button — must be pressed to allow browser to play audio */}
        {!soundUnlocked && snoozeCountdown === null && (
          <TouchableOpacity onPress={handleUnlockAndPlaySound} style={styles.soundBtn}>
            <Text style={styles.soundBtnText}>🔊 Tap to Enable Sound</Text>
          </TouchableOpacity>
        )}
        {soundUnlocked && (
          <View style={styles.soundActive}>
            <Text style={styles.soundActiveText}>🔊 {soundName} · playing</Text>
          </View>
        )}
        {soundError ? <Text style={styles.errorText}>{soundError}</Text> : null}
      </View>

      {/* Snooze countdown */}
      {snoozeCountdown !== null && (
        <View style={styles.snoozeBox}>
          <Text style={styles.snoozeText}>
            ⏳ Ringing again in {Math.floor(snoozeCountdown / 60)}m {String(snoozeCountdown % 60).padStart(2, '0')}s
          </Text>
        </View>
      )}

      {/* Bottom: Action buttons */}
      <View style={styles.actions}>
        {alarm?.snooze_enabled !== false && snoozeCountdown === null && (
          <Button
            mode="outlined"
            onPress={handleSnooze}
            style={styles.snoozeBtn}
            textColor="white"
            contentStyle={styles.btnContent}
          >
            💤 Snooze {snoozeDuration} min
          </Button>
        )}
        <Button
          mode="contained"
          onPress={handleDismiss}
          style={styles.dismissBtn}
          buttonColor="#fff"
          textColor="#e94560"
          contentStyle={styles.btnContent}
        >
          Dismiss → Solve Challenge
        </Button>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f3460',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 64,
    paddingBottom: 48,
    paddingHorizontal: 24,
  },
  topSection: { alignItems: 'center' },
  alarmLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 18,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  timeText: {
    color: '#fff',
    fontSize: 72,
    fontWeight: 'bold',
    letterSpacing: -2,
  },
  dateText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 15,
    marginTop: 6,
  },
  ringSection: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 220,
    height: 220,
  },
  outerRing: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 3,
    borderColor: 'rgba(233,69,96,0.5)',
    backgroundColor: 'rgba(233,69,96,0.08)',
  },
  innerRing: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#e94560',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 16,
    shadowColor: '#e94560',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 20,
  },
  bellIcon: { fontSize: 56 },
  soundBtn: {
    position: 'absolute',
    bottom: -50,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  soundBtnText: { color: 'white', fontSize: 15, fontWeight: '600' },
  soundActive: {
    position: 'absolute',
    bottom: -50,
    backgroundColor: 'rgba(34,197,94,0.15)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.4)',
  },
  soundActiveText: { color: '#4ade80', fontSize: 14 },
  errorText: { color: '#f87171', fontSize: 13, marginTop: 8 },
  snoozeBox: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  snoozeText: { color: 'rgba(255,255,255,0.8)', fontSize: 15 },
  actions: { width: '100%', gap: 12 },
  snoozeBtn: {
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: 30,
  },
  dismissBtn: { borderRadius: 30 },
  btnContent: { paddingVertical: 10 },
});
