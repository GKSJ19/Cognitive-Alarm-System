import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import notifee from '@notifee/react-native';
import { generatePuzzle } from '../utils/puzzle';
import { recordSolve } from '../utils/storage';

export default function PuzzleScreen({ route, navigation }) {
  const { alarmId, level } = route.params ?? {};
  const [puzzle, setPuzzle] = useState(() =>
    generatePuzzle(Number(level) || 2)
  );
  const [input, setInput] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState(false);
  const startedAt = useRef(Date.now());
  const solvedRef = useRef(false);

  useEffect(() => {
    // Prevent leaving the puzzle screen (back button, swipe, etc.)
    // until it's actually been solved.
    const unsub = navigation.addListener('beforeRemove', (e) => {
      if (!solvedRef.current) {
        e.preventDefault();
      }
    });
    return unsub;
  }, [navigation]);

  async function submit() {
    const value = Number(input.trim());
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);

    if (value === puzzle.answer) {
      const timeToSolveMs = Date.now() - startedAt.current;
      await recordSolve({
        alarmId,
        scheduledFor: startedAt.current,
        dismissedAt: Date.now(),
        attempts: nextAttempts,
        timeToSolveMs,
      });
      if (alarmId) {
        await notifee.cancelNotification(alarmId);
        await notifee.stopForegroundService?.();
      }
      solvedRef.current = true;
      navigation.replace('Dashboard');
    } else {
      setError(true);
      setInput('');
      // Escalate difficulty slightly after repeated wrong answers.
      if (nextAttempts % 3 === 0) {
        setPuzzle(generatePuzzle(Math.min(5, (Number(level) || 2) + 1)));
      }
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wake up.</Text>
      <Text style={styles.subtitle}>Solve to dismiss the alarm</Text>

      <View style={styles.card}>
        <Text style={styles.question}>{puzzle.question} = ?</Text>
        <TextInput
          style={[styles.input, error && styles.inputError]}
          keyboardType="number-pad"
          value={input}
          onChangeText={(t) => {
            setInput(t);
            setError(false);
          }}
          placeholder="Answer"
          placeholderTextColor="#666"
          autoFocus
        />
        {error && <Text style={styles.errorText}>Not quite — try again</Text>}
        <TouchableOpacity style={styles.submit} onPress={submit}>
          <Text style={styles.submitText}>Submit</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.attempts}>Attempts: {attempts}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1115',
    padding: 24,
    justifyContent: 'center',
  },
  title: { color: '#fff', fontSize: 34, fontWeight: '700', textAlign: 'center' },
  subtitle: {
    color: '#8a8f98',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  card: { backgroundColor: '#1c1f26', borderRadius: 16, padding: 24 },
  question: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#0f1115',
    color: '#fff',
    fontSize: 22,
    borderRadius: 10,
    padding: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  inputError: { borderWidth: 1, borderColor: '#ff5c5c' },
  errorText: { color: '#ff5c5c', textAlign: 'center', marginBottom: 12 },
  submit: {
    backgroundColor: '#4f7cff',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  attempts: { color: '#8a8f98', textAlign: 'center', marginTop: 20 },
});
