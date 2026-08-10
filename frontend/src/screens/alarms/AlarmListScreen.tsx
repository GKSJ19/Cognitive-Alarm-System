import React, { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, Switch, Modal, Platform, TouchableOpacity } from 'react-native';
import { Text, useTheme, Card, IconButton, FAB, Snackbar, Button } from 'react-native-paper';
import { useAlarms } from '../../hooks/useAlarms';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import alarmService from '../../services/alarmService';


interface AlarmListScreenProps {
  navigation: any;
}

export const AlarmListScreen: React.FC<AlarmListScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { alarms, isLoading, error, getAlarms, updateAlarm, dismissAlarm, clearError } = useAlarms();
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  // Challenge Simulation States
  const [simulationModalVisible, setSimulationModalVisible] = useState(false);
  const [simulatingAlarm, setSimulatingAlarm] = useState<any>(null);
  const [mathAnswer, setMathAnswer] = useState('');
  const [challengeStartTime, setChallengeStartTime] = useState(0);

  const [challengeLoading, setChallengeLoading] = useState(false);
  const [challenge, setChallenge] = useState<any>(null);
  const [challengeQuestion, setChallengeQuestion] = useState('');
  const [challengeCategoryName, setChallengeCategoryName] = useState('');
  const [memorySequence, setMemorySequence] = useState('');
  const [showMemorySequence, setShowMemorySequence] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [quickQuizOptions, setQuickQuizOptions] = useState<string[]>([]);
  const [solvedMessage, setSolvedMessage] = useState<string | null>(null);
  const [attemptCount, setAttemptCount] = useState(1);
  const [timerId, setTimerId] = useState<any>(null);

  useEffect(() => {
    getAlarms();
  }, [getAlarms]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [timerId]);

  const handleToggleActive = async (alarmId: string, currentVal: boolean) => {
    try {
      await updateAlarm(alarmId, { is_active: !currentVal }).unwrap();
      setSnackbarMessage(!currentVal ? "Alarm activated 🔔" : "Alarm deactivated");
    } catch (err) {
      // error handled by Redux
    }
  };

  const startSimulation = async (alarm: any) => {
    setSimulatingAlarm(alarm);
    setMathAnswer('');
    setSolvedMessage(null);
    setAttemptCount(1);
    
    // Clear any existing timer
    if (timerId) {
      clearInterval(timerId);
      setTimerId(null);
    }
    setShowMemorySequence(false);

    if (!alarm.challenge_required) {
      setChallengeCategoryName('');
      setSimulationModalVisible(true);
      return;
    }

    setChallengeLoading(true);
    setSimulationModalVisible(true);

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
      setSimulationModalVisible(false);
      setSnackbarMessage("Failed to generate cognitive challenge from server.");
    } finally {
      setChallengeLoading(false);
    }
  };

  const handleSolveChallenge = async (submittedAnswer: string) => {
    if (!challenge) return;
    
    const solveTimeSec = Math.round((Date.now() - challengeStartTime) / 1000);
    setChallengeLoading(true);

    try {
      const res = await alarmService.submitChallenge(
        challenge.id,
        submittedAnswer,
        simulatingAlarm.alarm_id,
        solveTimeSec,
        attemptCount
      );

      if (res.is_correct) {
        setSolvedMessage(`Accuracy: ${Math.round(res.accuracy * 100)}% | Score: +${res.score} XP`);
        setSnackbarMessage(`Alarm Dismissed! Solved in ${solveTimeSec} seconds 🧠`);
        
        getAlarms();
        setTimeout(() => {
          setSimulationModalVisible(false);
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

  const handleSimpleDismiss = async () => {
    const nowStr = new Date().toTimeString().split(' ')[0].substring(0, 5); // HH:MM
    try {
      await dismissAlarm(simulatingAlarm.alarm_id, nowStr, false, 0).unwrap();
      setSimulationModalVisible(false);
      setSnackbarMessage("Alarm dismissed.");
      getAlarms();
    } catch (err) {
      setSnackbarMessage("Failed to dismiss alarm.");
    }
  };


  const getRepeatLabel = (repeatDays: string | null) => {
    if (!repeatDays) return "Once";
    const days = repeatDays.split(',');
    if (days.length === 7) return "Every day";
    if (days.length === 5 && !days.includes('0') && !days.includes('6')) return "Weekdays";
    if (days.length === 2 && days.includes('0') && days.includes('6')) return "Weekends";
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days.map(d => dayNames[parseInt(d, 10)]).join(', ');
  };

  const renderAlarmItem = ({ item }: { item: any }) => {
    return (
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content style={styles.cardContent}>
          <TouchableOpacity 
            style={styles.timeSection}
            onPress={() => navigation.navigate('AlarmDetails', { alarmId: item.alarm_id })}
          >
            <Text style={[styles.time, { color: theme.colors.onSurface }]}>{item.alarm_time}</Text>
            <Text style={[styles.title, { color: theme.colors.onSurfaceVariant }]}>{item.title}</Text>
            <View style={styles.badgeRow}>
              <Text style={[styles.repeatText, { color: theme.colors.secondary }]}>
                {getRepeatLabel(item.repeat_days)}
              </Text>
              {item.challenge_required ? (
                <View style={[styles.badge, { backgroundColor: theme.colors.primaryContainer }]}>
                  <Text style={{ color: theme.colors.onPrimaryContainer, fontSize: 10, fontWeight: 'bold' }}>
                    🧠 {item.challenge_type.toUpperCase()} ({item.difficulty})
                  </Text>
                </View>
              ) : null}
            </View>
          </TouchableOpacity>

          <View style={styles.actionColumn}>
            <Switch
              value={item.is_active}
              onValueChange={() => handleToggleActive(item.alarm_id, item.is_active)}
              thumbColor={item.is_active ? theme.colors.primary : theme.colors.outline}
              trackColor={{ false: '#334155', true: '#1E3A8A' }}
            />
            <Button
              mode="text"
              compact
              textColor={theme.colors.secondary}
              onPress={() => startSimulation(item)}
              style={styles.simulateBtn}
            >
              Test
            </Button>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LoadingOverlay visible={isLoading} />
      
      <FlatList
        data={alarms}
        keyExtractor={(item) => item.alarm_id}
        renderItem={renderAlarmItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
              No alarms scheduled yet. Wake up dynamically with cognitive tasks!
            </Text>
          </View>
        }
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="#FFFFFF"
        onPress={() => navigation.navigate('CreateAlarm')}
      />

      {/* Challenge Simulation Modal */}
      <Modal
        visible={simulationModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSimulationModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(11, 15, 25, 0.95)' }]}>
          <Card style={[styles.modalCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.modalContent}>
              <IconButton icon="alarm" size={48} iconColor={theme.colors.error} style={styles.modalIcon} />
              <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>Wake Up! Alarm Ringing</Text>
              <Text style={[styles.modalSub, { color: theme.colors.onSurfaceVariant }]}>
                {simulatingAlarm?.challenge_required
                  ? `Complete the ${challengeCategoryName} challenge to silence the alarm.`
                  : "Tap below to dismiss the alarm."}
              </Text>
              
              {!simulatingAlarm?.challenge_required ? (
                <AppButton mode="contained" onPress={handleSimpleDismiss} style={styles.solveBtn}>
                  Dismiss Alarm
                </AppButton>
              ) : solvedMessage ? (
                <View style={styles.successBox}>
                  <IconButton icon="check-circle" size={48} iconColor="#22C55E" />
                  <Text style={[styles.successText, { color: '#22C55E' }]}>CORRECT!</Text>
                  <Text style={[styles.successDetails, { color: theme.colors.onSurface }]}>{solvedMessage}</Text>
                </View>
              ) : challengeLoading ? (
                <LoadingOverlay visible={true} />
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
                        {challengeQuestion}
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
        </View>

      </Modal>

      <Snackbar
        visible={!!error || !!snackbarMessage}
        onDismiss={() => {
          setSnackbarMessage(null);
          clearError();
        }}
        action={{
          label: 'OK',
          onPress: () => {
            setSnackbarMessage(null);
            clearError();
          }
        }}
        style={{ backgroundColor: error ? theme.colors.error : theme.colors.primary }}
      >
        {error || snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  timeSection: {
    flex: 1,
  },
  time: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  title: {
    fontSize: 14,
    marginTop: 2,
    fontWeight: '600',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    flexWrap: 'wrap',
  },
  repeatText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 10,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  actionColumn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  simulateBtn: {
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    borderRadius: 28,
  },
  emptyContainer: {
    paddingVertical: 100,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 24,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    elevation: 10,
  },
  modalContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  modalIcon: {
    margin: 0,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
  },
  modalSub: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  questionBox: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#0B0F19',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  questionText: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  solveBtn: {
    width: '100%',
    marginTop: 16,
  },
  optionsContainer: {
    width: '100%',
    marginTop: 8,
  },
  optionBtn: {
    width: '100%',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 10,
  },
  optionText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  successBox: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  successText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  successDetails: {
    fontSize: 14,
    textAlign: 'center',
  },
});


export default AlarmListScreen;
