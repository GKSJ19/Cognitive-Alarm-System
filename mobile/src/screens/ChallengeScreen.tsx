import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Surface, Button, ActivityIndicator, useTheme } from 'react-native-paper';
import api from '../services/api';

export default function ChallengeScreen({ navigation, route }: any) {
  const theme = useTheme();
  const [challenge, setChallenge] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);

  useEffect(() => {
    fetchChallenge();
  }, []);

  const fetchChallenge = async () => {
    try {
      setLoading(true);
      // Determine difficulty and type based on user prefs or adaptive engine
      const response = await api.get('/challenges/generate?difficulty=Medium&type=Math');
      setChallenge(response.data);
      setStartTime(Date.now());
    } catch (err) {
      console.log('Error fetching challenge', err);
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async (answer: string) => {
    try {
      setSubmitting(true);
      const timeTaken = (Date.now() - startTime) / 1000;
      
      const response = await api.post('/challenges/submit', {
        challenge_id: challenge._id,
        alarm_log_id: route.params?.alarmLogId || 'mock-log-id', // Would be passed from AlarmRing
        user_answer: answer,
        is_correct: false, // Calculated on backend anyway
        time_taken_seconds: timeTaken
      });

      if (response.data.is_correct) {
        Alert.alert(
          "Wake Up Verified!",
          "Great job! The alarm has been dismissed.",
          [{ text: "OK", onPress: () => navigation.navigate('Main') }]
        );
      } else {
        Alert.alert(
          "Incorrect",
          "That was wrong. Please try another challenge to wake up.",
          [{ text: "Next Challenge", onPress: fetchChallenge }]
        );
      }
    } catch (err: any) {
      console.log('Error submitting challenge', err);
      Alert.alert(
        "Error",
        err.response?.data?.detail || "Failed to submit answer. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Generating your challenge...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineMedium" style={styles.title}>Wake Up Challenge</Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        Difficulty: {challenge?.difficulty}
      </Text>

      <Surface style={styles.challengeSurface} elevation={2}>
        <Text variant="headlineSmall" style={styles.question}>
          {challenge?.content?.question}
        </Text>
        
        <View style={styles.optionsContainer}>
          {challenge?.content?.options?.map((option: string, index: number) => (
            <Button
              key={index}
              mode="contained-tonal"
              style={styles.optionButton}
              labelStyle={styles.optionLabel}
              onPress={() => handleAnswerSubmit(option)}
              disabled={submitting}
            >
              {option}
            </Button>
          ))}
        </View>
      </Surface>
      
      {submitting && (
        <ActivityIndicator style={{ marginTop: 20 }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.7,
  },
  challengeSurface: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  question: {
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
  },
  optionsContainer: {
    width: '100%',
    gap: 12,
  },
  optionButton: {
    width: '100%',
    paddingVertical: 8,
  },
  optionLabel: {
    fontSize: 18,
  }
});
