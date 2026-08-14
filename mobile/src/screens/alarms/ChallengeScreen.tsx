import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, ScrollView, Animated, BackHandler, TouchableOpacity } from 'react-native';
import { Text, useTheme, Card, IconButton, Button, Chip, ProgressBar } from 'react-native-paper';
import { alarmService } from '../../services/alarmService';
import { CognitiveChallenge, AvailableChallengeOption, ChallengeVerifyResponse } from '../../types/alarm.types';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import ThemeBackground from '../../components/common/ThemeBackground';

interface ChallengeScreenProps {
  route: any;
  navigation: any;
}

export const ChallengeScreen: React.FC<ChallengeScreenProps> = ({ route, navigation }) => {
  const theme = useTheme();
  const alarmId = route.params?.alarmId || 'demo-alarm';

  // Screen Phase: 'selection' | 'active'
  const [phase, setPhase] = useState<'selection' | 'active'>('selection');

  // Available challenges list & user selection
  const [availableChallenges, setAvailableChallenges] = useState<AvailableChallengeOption[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);

  // Active Challenge States
  const [challenge, setChallenge] = useState<CognitiveChallenge | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [attempts, setAttempts] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<ChallengeVerifyResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Timer & Pulse Animation
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [timeLeft, setTimeLeft] = useState<number>(45);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Prevent user from backing out without solving challenge
  useEffect(() => {
    const onBackPress = () => {
      if (!verificationResult?.is_correct) {
        setErrorMessage("Solve the cognitive challenge to silence and dismiss the alarm!");
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [verificationResult]);

  // Pulse Alarm Animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.12,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  // Load available challenges for selection
  const loadAvailableChallenges = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await alarmService.getAvailableChallenges(alarmId);
      setAvailableChallenges(data);
      if (data.length > 0) {
        setSelectedChallengeId(data[0].challenge_id);
      }
    } catch (err: any) {
      // Fallback single challenge if available-challenges fails
      try {
        const single = await alarmService.getAlarmChallenge(alarmId);
        setChallenge(single);
        setPhase('active');
      } catch (err2) {
        setErrorMessage("Failed to load cognitive challenge. Retrying...");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAvailableChallenges();
  }, [alarmId]);

  // Launch Selected Challenge
  const handleStartSelectedChallenge = () => {
    const chosen = availableChallenges.find(c => c.challenge_id === selectedChallengeId);
    if (!chosen) return;

    setChallenge({
      challenge_id: chosen.challenge_id,
      alarm_id: chosen.alarm_id,
      challenge_type: chosen.challenge_type,
      difficulty: chosen.difficulty,
      prompt: chosen.prompt,
      instructions: chosen.instructions,
      options: chosen.options,
      timer_seconds: chosen.timer_seconds || 45,
      verification_token: chosen.verification_token
    });

    setTimeLeft(chosen.timer_seconds || 45);
    setStartTime(Date.now());
    setPhase('active');
  };

  // Countdown timer effect
  useEffect(() => {
    if (phase !== 'active' || !challenge || verificationResult?.is_correct) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, challenge, verificationResult]);

  // Submit Answer to AI Engine Validation Endpoint
  const handleSubmitAnswer = async (submittedValue?: string) => {
    const answerToTest = submittedValue ?? userAnswer;
    if (!answerToTest.trim()) {
      setErrorMessage("Please enter or select an answer!");
      return;
    }

    if (!challenge) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const solveTimeSec = Math.max(1, Math.round((Date.now() - startTime) / 1000));

    try {
      const result = await alarmService.verifyAlarmChallenge(alarmId, {
        challenge_id: challenge.challenge_id,
        user_answer: answerToTest.trim(),
        time_taken_seconds: solveTimeSec,
        attempts: attempts,
        verification_token: challenge.verification_token
      });

      if (result.is_correct) {
        setVerificationResult(result);
      } else {
        setAttempts((prev) => prev + 1);
        setErrorMessage(result.message || "Incorrect answer! Continue solving to silence the alarm.");
        setUserAnswer('');
      }
    } catch (err: any) {
      setErrorMessage("Network error validating challenge. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'memory': return 'brain';
      case 'word':
      case 'writing': return 'format-letter-case';
      case 'pattern': return 'shape';
      default: return 'calculator';
    }
  };

  if (isLoading) {
    return <LoadingOverlay visible={true} message="Fetching AI Cognitive Challenges..." />;
  }

  const handleReturnToDashboard = () => {
    try {
      if (navigation.canGoBack()) {
        navigation.popToTop();
      }
      navigation.navigate('DashboardTab');
    } catch (err) {
      try {
        navigation.navigate('Home', { screen: 'DashboardTab' });
      } catch (err2) {
        navigation.navigate('AlarmList');
      }
    }
  };

  // --- VICTORY STATE ---
  if (verificationResult?.is_correct) {
    return (
      <ThemeBackground>
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Card style={styles.victoryCard}>
              <Card.Content style={styles.centerContent}>
                <IconButton icon="check-circle" size={84} iconColor="#34D399" />
                <Text style={[styles.victoryTitle, { color: '#FFFFFF' }]}>Alarm Dismissed! 🎉</Text>
                <Text style={[styles.victorySub, { color: '#A098BA' }]}>
                  Cognitive challenge solved in {verificationResult.time_taken_seconds} seconds!
                </Text>

                <View style={styles.scoreBadge}>
                  <Text style={styles.scoreLabel}>Honor Score Earned</Text>
                  <Text style={styles.scorePoints}>+{verificationResult.earned_score} pts</Text>
                  <Text style={styles.totalScore}>Total Honor Score: {verificationResult.total_honor_score}</Text>
                </View>

                <View style={styles.metaRow}>
                  <Chip icon="check-all" style={styles.metaChip} textStyle={{ color: '#FFFFFF' }}>
                    Attempts: {verificationResult.attempts}
                  </Chip>
                  <Chip icon="lightning-bolt" style={styles.metaChip} textStyle={{ color: '#FFFFFF' }}>
                    Elo Rating: {verificationResult.next_difficulty}
                  </Chip>
                </View>

                <AppButton
                  mode="contained"
                  onPress={handleReturnToDashboard}
                  style={styles.doneBtn}
                  buttonColor="#A58BFF"
                  textColor="#0D0B14"
                >
                  Return to Dashboard
                </AppButton>

                <Button
                  mode="outlined"
                  onPress={() => {
                    if (navigation.canGoBack()) {
                      navigation.popToTop();
                    }
                    navigation.navigate('AlarmList');
                  }}
                  style={{ width: '100%', marginTop: 10, borderRadius: 16, borderColor: 'rgba(165, 139, 255, 0.2)' }}
                  textColor="#A58BFF"
                >
                  Back to Alarms
                </Button>
              </Card.Content>
            </Card>
          </ScrollView>
        </View>
      </ThemeBackground>
    );
  }

  // --- PHASE 1: CHALLENGE SELECTION SCREEN ---
  if (phase === 'selection') {
    return (
      <ThemeBackground>
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Header Banner */}
            <View style={styles.headerBox}>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <IconButton icon="bell-ring" size={50} iconColor="#A58BFF" style={styles.alarmIcon} />
              </Animated.View>
              <Text style={[styles.headerTitle, { color: '#FFFFFF' }]}>Select Your Cognitive Challenge 🧠</Text>
              <Text style={[styles.headerSub, { color: '#A098BA' }]}>
                Choose one challenge from the Cognitive Engine to awaken your mind and silence the alarm.
              </Text>
            </View>

          {/* Cards List */}
          {availableChallenges.map((item) => {
            const isSelected = selectedChallengeId === item.challenge_id;
            return (
              <TouchableOpacity
                key={item.challenge_id}
                activeOpacity={0.85}
                onPress={() => setSelectedChallengeId(item.challenge_id)}
              >
                <Card
                  style={[
                    styles.selectionCard,
                    isSelected ? styles.selectedCardBorder : styles.unselectedCardBorder
                  ]}
                >
                  <Card.Content style={styles.selectionCardContent}>
                    <View style={styles.cardHeaderRow}>
                      <View style={styles.typeBadgeRow}>
                        <IconButton
                          icon={getTypeIcon(item.challenge_type)}
                          size={24}
                          iconColor={isSelected ? '#38BDF8' : '#0EA5E9'}
                          style={{ margin: 0, marginRight: 6 }}
                        />
                        <Text style={styles.cardTypeTitle}>
                          {item.challenge_type.toUpperCase()}
                        </Text>
                      </View>
                      {isSelected && (
                        <Chip icon="check-circle" style={styles.selectedChip} textStyle={{ color: '#0284C7', fontWeight: 'bold' }}>
                          Selected
                        </Chip>
                      )}
                    </View>

                    <Text style={styles.cardDesc}>{item.description}</Text>

                    <View style={styles.metaBadgeRow}>
                      <Chip icon="speedometer" style={styles.badgeChip} textStyle={{ fontSize: 11, color: '#64748B' }}>
                        Diff: {item.difficulty.toUpperCase()}
                      </Chip>
                      <Chip icon="clock-outline" style={styles.badgeChip} textStyle={{ fontSize: 11, color: '#64748B' }}>
                        Est: {item.estimated_time}
                      </Chip>
                    </View>
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            );
          })}

          {/* Start Challenge Action Button */}
          <AppButton
            mode="contained"
            disabled={!selectedChallengeId}
            onPress={handleStartSelectedChallenge}
            style={styles.startChallengeBtn}
            buttonColor="#A58BFF"
            textColor="#0D0B14"
          >
            Start Challenge & Silence Alarm
          </AppButton>
        </ScrollView>
      </View>
    </ThemeBackground>
    );
  }

  // --- PHASE 2: ACTIVE CHALLENGE RINGING / SOLVING STATE ---
  const timerProgress = challenge ? timeLeft / (challenge.timer_seconds || 45) : 1;

  return (
    <ThemeBackground>
      <View style={styles.container}>
        <LoadingOverlay visible={isSubmitting} message="Validating solution with AI engine..." />

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Ringing Visual Banner */}
          <View style={styles.ringingHeader}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <IconButton icon="alarm" size={56} iconColor="#A58BFF" style={styles.alarmIcon} />
            </Animated.View>
            <Text style={[styles.ringingTitle, { color: '#FFFFFF' }]}>ALARM RINGING 🔔</Text>
            <Text style={[styles.ringingSub, { color: '#A098BA' }]}>Solve the AI challenge to dismiss the alarm</Text>
          </View>

          {/* Challenge Card */}
          {challenge && (
            <Card style={styles.activeCard}>
              <Card.Content>
                {/* Header Badges */}
                <View style={styles.headerBadges}>
                  <Chip icon={getTypeIcon(challenge.challenge_type)} style={{ backgroundColor: '#2C2243' }}>
                    <Text style={{ color: '#A58BFF', fontWeight: 'bold' }}>
                      {challenge.challenge_type.toUpperCase()}
                    </Text>
                  </Chip>
                <Chip icon="speedometer" style={{ backgroundColor: '#F1F5F9' }}>
                  <Text style={{ color: '#475569', fontWeight: 'bold' }}>
                    {challenge.difficulty.toUpperCase()}
                  </Text>
                </Chip>
              </View>

              {/* Timer Progress */}
              <View style={styles.timerSection}>
                <View style={styles.timerLabelRow}>
                  <Text style={[styles.timerText, { color: '#64748B' }]}>Time Remaining</Text>
                  <Text style={[styles.timerCount, { color: timeLeft < 10 ? '#EF4444' : '#0EA5E9' }]}>
                    {timeLeft}s
                  </Text>
                </View>
                <ProgressBar progress={timerProgress} color={timeLeft < 10 ? '#EF4444' : '#38BDF8'} style={styles.progressBar} />
              </View>

              {/* Challenge Prompt */}
              <View style={styles.promptBox}>
                <Text style={styles.promptText}>{challenge.prompt}</Text>
                <Text style={styles.instructionText}>{challenge.instructions}</Text>
              </View>

              {/* Multiple Choice Options if available */}
              {challenge.options && challenge.options.length > 0 ? (
                <View style={styles.optionsGrid}>
                  {challenge.options.map((opt, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.optionBtn,
                        {
                          backgroundColor: userAnswer === opt ? '#38BDF8' : '#F8FCFF',
                          borderWidth: 1.5,
                          borderColor: userAnswer === opt ? '#0EA5E9' : '#E2E8F0',
                        }
                      ]}
                      onPress={() => {
                        setUserAnswer(opt);
                        handleSubmitAnswer(opt);
                      }}
                    >
                      <Text style={[styles.optionText, { color: userAnswer === opt ? '#FFFFFF' : '#0F172A' }]}>
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                /* Text / Numeric Input */
                <AppInput
                  label="Your Solution"
                  value={userAnswer}
                  onChangeText={setUserAnswer}
                  placeholder="Enter answer..."
                  leftIcon="pencil"
                  keyboardType={challenge.challenge_type === 'math' ? 'numeric' : 'default'}
                />
              )}

              {/* Attempt Counter & Error Message */}
              <View style={styles.attemptRow}>
                <Text style={{ color: '#64748B', fontSize: 12 }}>Attempt #{attempts}</Text>
              </View>

              {errorMessage && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
                </View>
              )}

              {/* Submit Button */}
              {(!challenge.options || challenge.options.length === 0) && (
                <AppButton
                  mode="contained"
                  onPress={() => handleSubmitAnswer()}
                  style={styles.submitBtn}
                >
                  Submit & Silence Alarm
                </AppButton>
              )}
            </Card.Content>
          </Card>
        )}
        </ScrollView>
      </View>
    </ThemeBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerBox: {
    alignItems: 'center',
    marginVertical: 16,
  },
  alarmIcon: {
    margin: 0,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginTop: 4,
  },
  headerSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 16,
  },
  selectionCard: {
    borderRadius: 16,
    marginBottom: 14,
    backgroundColor: '#FFFFFF',
    elevation: 3,
    shadowColor: 'rgba(14, 165, 233, 0.15)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  selectedCardBorder: {
    borderWidth: 2,
    borderColor: '#A58BFF',
    backgroundColor: 'rgba(26, 22, 38, 0.95)',
  },
  unselectedCardBorder: {
    borderWidth: 1,
    borderColor: 'rgba(165, 139, 255, 0.15)',
    backgroundColor: 'rgba(26, 22, 38, 0.65)',
  },
  selectionCardContent: {
    padding: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTypeTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  selectedChip: {
    backgroundColor: '#2C2243',
    height: 28,
  },
  cardDesc: {
    fontSize: 13,
    color: '#A098BA',
    marginVertical: 8,
    lineHeight: 18,
  },
  metaBadgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  badgeChip: {
    backgroundColor: '#262036',
    borderWidth: 1,
    borderColor: 'rgba(165, 139, 255, 0.15)',
  },
  startChallengeBtn: {
    marginTop: 16,
    borderRadius: 20,
  },
  ringingHeader: {
    alignItems: 'center',
    marginVertical: 20,
  },
  ringingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  ringingSub: {
    fontSize: 14,
    color: '#A098BA',
    marginTop: 4,
  },
  activeCard: {
    backgroundColor: 'rgba(26, 22, 38, 0.9)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(165, 139, 255, 0.15)',
    elevation: 8,
  },
  headerBadges: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  timerSection: {
    marginBottom: 20,
  },
  timerLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  timerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A098BA',
  },
  timerCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#A58BFF',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  promptBox: {
    backgroundColor: '#262036',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(165, 139, 255, 0.2)',
  },
  promptText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#A58BFF',
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 13,
    color: '#A098BA',
    marginTop: 8,
    textAlign: 'center',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  optionBtn: {
    width: '48%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    backgroundColor: '#262036',
    borderWidth: 1,
    borderColor: 'rgba(165, 139, 255, 0.2)',
  },
  optionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  attemptRow: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  errorContainer: {
    backgroundColor: 'rgba(248, 113, 113, 0.15)',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  errorText: {
    color: '#F87171',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
  },
  submitBtn: {
    marginTop: 10,
    borderRadius: 20,
  },
  victoryCard: {
    backgroundColor: 'rgba(26, 22, 38, 0.9)',
    borderRadius: 20,
    marginTop: 30,
    borderWidth: 1,
    borderColor: 'rgba(165, 139, 255, 0.2)',
    elevation: 4,
  },
  centerContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  victoryTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#FFFFFF',
  },
  victorySub: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    color: '#A098BA',
  },
  scoreBadge: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginVertical: 20,
    backgroundColor: '#262036',
    borderWidth: 1,
    borderColor: 'rgba(165, 139, 255, 0.2)',
  },
  scoreLabel: {
    color: '#A58BFF',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  scorePoints: {
    color: '#34D399',
    fontSize: 34,
    fontWeight: 'bold',
    marginVertical: 6,
  },
  totalScore: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  metaChip: {
    backgroundColor: '#262036',
  },
  doneBtn: {
    width: '100%',
    marginTop: 10,
    borderRadius: 20,
  },
});

export default ChallengeScreen;
