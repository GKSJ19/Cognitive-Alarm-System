import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Modal, Platform, TouchableOpacity, Vibration } from 'react-native';
import { Text, useTheme, Card, IconButton, Snackbar, Button } from 'react-native-paper';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import alarmService from '../../services/alarmService';

interface AlarmRingingScreenProps {
  route: any;
  navigation: any;
}

export const AlarmRingingScreen: React.FC<AlarmRingingScreenProps> = ({ route, navigation }) => {
  const theme = useTheme();
  const { alarm } = route.params;

  const [isSolved, setIsSolved] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  // Challenge States
  const [challengeLoading, setChallengeLoading] = useState(false);
  const [challenge, setChallenge] = useState<any>(null);
  const [challengeQuestion, setChallengeQuestion] = useState('');
  const [challengeCategoryName, setChallengeCategoryName] = useState('');
  const [mathAnswer, setMathAnswer] = useState('');
  const [challengeStartTime, setChallengeStartTime] = useState(0);

  const [memorySequence, setMemorySequence] = useState('');
  const [showMemorySequence, setShowMemorySequence] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [quickQuizOptions, setQuickQuizOptions] = useState<string[]>([]);
  const [solvedMessage, setSolvedMessage] = useState<string | null>(null);
  const [attemptCount, setAttemptCount] = useState(1);
  const [timerId, setTimerId] = useState<any>(null);

  // 1. Lock navigation back handler
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      if (isSolved) {
        // Allow navigation away if solved
        return;
      }
      // Prevent default behavior of leaving the screen
      e.preventDefault();
      setSnackbarMessage("You must solve the cognitive challenge to dismiss the alarm!");
    });
    return unsubscribe;
  }, [navigation, isSolved]);

  // 2. Start continuous hardware vibration and stop it on unmount or when solved
  useEffect(() => {
    if (!isSolved) {
      // Vibrate pattern: [wait 1s, vibrate 1s], loop
      Vibration.vibrate([1000, 1000], true);
    } else {
      Vibration.cancel();
    }
    return () => {
      Vibration.cancel();
    };
  }, [isSolved]);

  // 3. Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [timerId]);

  // 4. Fetch the cognitive challenge from server on mount
  useEffect(() => {
    const initChallenge = async () => {
      if (!alarm.challenge_required) {
        return;
      }

      setChallengeLoading(true);
      try {
        const chal = await alarmService.generateChallenge(alarm.challenge_type || 'math', alarm.difficulty || 'medium');
        setChallenge(chal);
        setChallengeQuestion(chal.question_text);
        setChallengeCategoryName(chal.category_name);

        if (chal.category_name === "Memory Challenges" && chal.additional_data) {
          const extra = JSON.parse(chal.additional_data);
          const seq = extra.sequence || chal.question_text;
          setMemorySequence(seq);
          setShowMemorySequence(true);
          setSecondsRemaining(3);

          const interval = setInterval(() => {
            setSecondsRemaining((prev) => {
              if (prev <= 1) {
                clearInterval(interval);
                setShowMemorySequence(false);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
          setTimerId(interval);
        } else if (chal.category_name === "Quick Quiz" && chal.additional_data) {
          const extra = JSON.parse(chal.additional_data);
          setQuickQuizOptions(extra.options || []);
        }

        setChallengeStartTime(Date.now());
      } catch (err) {
        setSnackbarMessage("Failed to generate cognitive challenge from server. Please retry.");
      } finally {
        setChallengeLoading(false);
      }
    };

    initChallenge();
  }, [alarm]);

  // 5. Handle Challenge Submission
  const handleSolveChallenge = async (submittedAnswer: string) => {
    if (!challenge) return;

    const solveTimeSec = Math.round((Date.now() - challengeStartTime) / 1000);
    setChallengeLoading(true);

    try {
      const res = await alarmService.submitChallenge(
        challenge.id,
        submittedAnswer,
        alarm.alarm_id,
        solveTimeSec,
        attemptCount
      );

      if (res.is_correct) {
        setSolvedMessage(`Accuracy: ${Math.round(res.accuracy * 100)}% | Score: +${res.score} XP`);
        setSnackbarMessage(`Alarm Dismissed! Solved in ${solveTimeSec} seconds 🧠`);
        setIsSolved(true);
        Vibration.cancel();

        // Navigate back to Home Dashboard/Alarms after showing success details
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'UserFlow' }],
          });
        }, 2000);
      } else {
        setAttemptCount(prev => prev + 1);
        setMathAnswer('');
        setSnackbarMessage("Incorrect answer! Try again to silence the alarm.");
      }
    } catch (err) {
      setSnackbarMessage("Failed to validate challenge answer.");
    } finally {
      setChallengeLoading(false);
    }
  };

  // 6. Handle Simple Dismiss (when no challenge is required)
  const handleSimpleDismiss = async () => {
    const nowStr = new Date().toTimeString().split(' ')[0].substring(0, 5); // HH:MM
    setChallengeLoading(true);
    try {
      await alarmService.dismissAlarm(alarm.alarm_id, nowStr, false, 0);
      setIsSolved(true);
      Vibration.cancel();
      setSnackbarMessage("Alarm dismissed.");
      
      navigation.reset({
        index: 0,
        routes: [{ name: 'UserFlow' }],
      });
    } catch (err) {
      setSnackbarMessage("Failed to dismiss alarm.");
    } finally {
      setChallengeLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: 'rgba(11, 15, 25, 0.98)' }]}>
      <LoadingOverlay visible={challengeLoading} />
      
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Card style={[styles.modalCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.modalContent}>
            <IconButton icon="alarm" size={64} iconColor={theme.colors.error} style={styles.modalIcon} />
            <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>Wake Up! Alarm Ringing</Text>
            <Text style={[styles.alarmLabel, { color: theme.colors.primary }]}>"{alarm.title}"</Text>
            <Text style={[styles.modalSub, { color: theme.colors.onSurfaceVariant }]}>
              {alarm.challenge_required
                ? `Complete the ${challengeCategoryName || 'Cognitive'} challenge to silence the alarm.`
                : "Tap below to dismiss the alarm."}
            </Text>

            {!alarm.challenge_required ? (
              <AppButton mode="contained" onPress={handleSimpleDismiss} style={styles.solveBtn}>
                Dismiss Alarm
              </AppButton>
            ) : solvedMessage ? (
              <View style={styles.successBox}>
                <IconButton icon="check-circle" size={48} iconColor="#22C55E" />
                <Text style={[styles.successText, { color: '#22C55E' }]}>CORRECT!</Text>
                <Text style={[styles.successDetails, { color: theme.colors.onSurface }]}>{solvedMessage}</Text>
              </View>
            ) : (
              <>
                <View style={styles.questionBox}>
                  {challengeCategoryName === "Memory Challenges" && showMemorySequence ? (
                    <View style={{ alignItems: 'center' }}>
                      <Text style={[styles.questionText, { color: theme.colors.primary }]}>
                        {memorySequence}
                      </Text>
                      <Text style={{ color: theme.colors.error, marginTop: 10, fontWeight: 'bold' }}>
                        Memorize: {secondsRemaining}s
                      </Text>
                    </View>
                  ) : challengeCategoryName === "Memory Challenges" && !showMemorySequence ? (
                    <Text style={[styles.questionText, { color: theme.colors.primary, fontSize: 18, textAlign: 'center' }]}>
                      Enter the sequence you just saw!
                    </Text>
                  ) : (
                    <Text style={[styles.questionText, { color: theme.colors.primary, fontSize: challengeQuestion.length > 20 ? 18 : 28, textAlign: 'center' }]}>
                      {challengeQuestion || 'Loading challenge...'}
                    </Text>
                  )}
                </View>

                {challengeCategoryName === "Quick Quiz" ? (
                  <View style={styles.optionsContainer}>
                    {quickQuizOptions.map((opt) => (
                      <TouchableOpacity
                        key={opt}
                        style={[styles.optionBtn, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outline }]}
                        onPress={() => handleSolveChallenge(opt)}
                      >
                        <Text style={[styles.optionText, { color: theme.colors.onSurface }]}>{opt}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <>
                    <AppInput
                      label={challengeCategoryName === "Memory Challenges" ? "Enter digits" : "Your Answer"}
                      value={mathAnswer}
                      onChangeText={setMathAnswer}
                      keyboardType={
                        challengeCategoryName === "Math Problems" ||
                        challengeCategoryName === "Memory Challenges" ||
                        challengeCategoryName === "Pattern Recognition"
                          ? "numeric"
                          : "default"
                      }
                      placeholder="Type answer here..."
                      leftIcon={
                        challengeCategoryName === "Math Problems" ? "calculator" :
                        challengeCategoryName === "Memory Challenges" ? "brain" :
                        challengeCategoryName === "Word Games" ? "alphabetical" :
                        "lead-pencil"
                      }
                    />

                    <AppButton mode="contained" onPress={() => handleSolveChallenge(mathAnswer)} style={styles.solveBtn}>
                      Submit Answer
                    </AppButton>
                  </>
                )}
              </>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      <Snackbar
        visible={!!snackbarMessage}
        onDismiss={() => setSnackbarMessage(null)}
        action={{
          label: 'OK',
          onPress: () => setSnackbarMessage(null)
        }}
        style={{ backgroundColor: theme.colors.error }}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    width: '100%',
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    elevation: 10,
  },
  modalContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  modalIcon: {
    margin: 0,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  alarmLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
    fontStyle: 'italic',
  },
  modalSub: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  questionBox: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#0B0F19',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  questionText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  solveBtn: {
    width: '100%',
    marginTop: 20,
  },
  optionsContainer: {
    width: '100%',
    marginTop: 8,
  },
  optionBtn: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 12,
  },
  optionText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  successBox: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  successText: {
    fontSize: 26,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  successDetails: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default AlarmRingingScreen;
