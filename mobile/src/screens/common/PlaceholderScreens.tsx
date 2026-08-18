import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Card, List, Button } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import NotificationsScreenComponent from './NotificationsScreen';
import ThemeBackground from '../../components/common/ThemeBackground';
import profileService from '../../services/profileService';

/* =========================================================
   SETTINGS SCREEN
   ========================================================= */

export const SettingsScreen = () => {
  const { logout } = useAuth();

  return (
    <ThemeBackground>
      <ScrollView style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>

            <Text style={styles.title}>
              Application Settings
            </Text>

            <List.Item
              title="Vibrate on Alarm"
              titleStyle={styles.listTitle}
              left={props => (
                <List.Icon
                  {...props}
                  icon="vibrate"
                  color="#A58BFF"
                />
              )}
            />

            <List.Item
              title="Dark Mode"
              titleStyle={styles.listTitle}
              description="Enabled (Obsidian Purple)"
              descriptionStyle={styles.listDescription}
              left={props => (
                <List.Icon
                  {...props}
                  icon="theme-light-dark"
                  color="#A58BFF"
                />
              )}
            />

            <List.Item
              title="System Version"
              titleStyle={styles.listTitle}
              description="1.0.0"
              descriptionStyle={styles.listDescription}
              left={props => (
                <List.Icon
                  {...props}
                  icon="information-outline"
                  color="#A58BFF"
                />
              )}
            />

            <Button
              mode="contained"
              onPress={logout}
              buttonColor="#F87171"
              textColor="#FFFFFF"
              style={styles.signOutButton}
            >
              Sign Out
            </Button>

          </Card.Content>
        </Card>
      </ScrollView>
    </ThemeBackground>
  );
};


/* =========================================================
   NOTIFICATIONS SCREEN
   ========================================================= */

export const NotificationsScreen =
  NotificationsScreenComponent;


/* =========================================================
   ACHIEVEMENTS SCREEN
   ========================================================= */

export const AchievementsScreen = () => {
  const [reports, setReports] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const loadAchievements = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await profileService.getMyReports();

      console.log(
        'Achievement report data:',
        data
      );

      setReports(data);
    } catch (err: any) {
      console.error(
        'Failed to load achievements:',
        err
      );

      setError(
        err?.response?.data?.detail ||
          'Unable to load your achievements.'
      );
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadAchievements();
  }, []);

  /* -------------------------
     Loading
     ------------------------- */

  if (loading) {
    return (
      <ThemeBackground>
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>
            Loading your achievements...
          </Text>
        </View>
      </ThemeBackground>
    );
  }

  /* -------------------------
     Error
     ------------------------- */

  if (error || !reports) {
    return (
      <ThemeBackground>
        <View style={styles.centerContainer}>

          <Text style={styles.errorText}>
            {error ||
              'No achievement data available.'}
          </Text>

          <Button
            mode="contained"
            onPress={loadAchievements}
            buttonColor="#A58BFF"
            textColor="#FFFFFF"
            style={styles.retryButton}
          >
            Try Again
          </Button>

        </View>
      </ThemeBackground>
    );
  }

  const challenge =
    reports.challenge_analytics;

  const habit =
    reports.habit_score_analytics;

  const alarms =
    reports.alarm_analytics;

  const achievements: {
    title: string;
    description: string;
    icon: string;
    color: string;
  }[] = [];


  /* =====================================================
     CHALLENGE STARTER
     ===================================================== */

  if (
    (challenge?.total_completed || 0) >= 1
  ) {
    achievements.push({
      title: 'Challenge Starter',

      description:
        `Completed ${
          challenge.total_completed
        } cognitive challenge${
          challenge.total_completed === 1
            ? ''
            : 's'
        }.`,

      icon: 'trophy',

      color: '#FBBF24',
    });
  }


  /* =====================================================
     PERFECT FOCUS
     ===================================================== */

  if (
    (challenge?.success_percentage || 0) >= 100
  ) {
    achievements.push({
      title: 'Perfect Focus',

      description:
        'Achieved a 100% cognitive challenge success rate.',

      icon: 'target',

      color: '#4ADE80',
    });
  }


  /* =====================================================
     QUICK SOLVER
     ===================================================== */

  if (
    challenge?.fastest_completion !== null &&
    challenge?.fastest_completion !== undefined &&
    challenge.fastest_completion > 0 &&
    challenge.fastest_completion <= 5
  ) {
    achievements.push({
      title: 'Quick Solver',

      description:
        `Completed a challenge in ${
          challenge.fastest_completion
        } seconds.`,

      icon: 'speedometer',

      color: '#38BDF8',
    });
  }


  /* =====================================================
     MEDIUM MASTER
     ===================================================== */

  const medium =
    challenge?.difficulty_performance?.medium;

  if (
    medium?.total > 0 &&
    medium?.success_rate >= 100
  ) {
    achievements.push({
      title: 'Medium Master',

      description:
        `Successfully completed all ${
          medium.total
        } medium-difficulty challenges.`,

      icon: 'brain',

      color: '#A58BFF',
    });
  }


  /* =====================================================
     HABIT BUILDER
     ===================================================== */

  if (
    (habit?.current_score || 0) >= 60
  ) {
    achievements.push({
      title: 'Habit Builder',

      description:
        `Reached a habit score of ${Number(
          habit.current_score
        ).toFixed(1)}.`,

      icon: 'chart-line',

      color: '#FBBF24',
    });
  }


  /* =====================================================
     CONSISTENT WAKE-UP
     ===================================================== */

  if (
    (alarms?.wakeup_consistency || 0) >= 100
  ) {
    achievements.push({
      title: 'Consistent Wake-Up',

      description:
        'Maintained 100% wake-up consistency.',

      icon: 'alarm-check',

      color: '#4ADE80',
    });
  }


  return (
    <ThemeBackground>

      <ScrollView
        style={styles.container}
        contentContainerStyle={{
          paddingBottom: 30,
        }}
        showsVerticalScrollIndicator={false}
      >

        {/* =================================================
            ACHIEVEMENTS
            ================================================= */}

        <Card style={styles.card}>
          <Card.Content>

            <Text style={styles.sectionTitle}>
              Your Achievements
            </Text>

            <Text style={styles.achievementIntro}>
              Achievements are based on your actual
              cognitive performance, habit score, and
              wake-up consistency.
            </Text>

            {achievements.length === 0 ? (

              <View
                style={
                  styles.noAchievementContainer
                }
              >

                <List.Icon
                  icon="trophy-outline"
                  color="#A58BFF"
                />

                <Text
                  style={
                    styles.noAchievementTitle
                  }
                >
                  No achievements yet
                </Text>

                <Text
                  style={
                    styles.noAchievementText
                  }
                >
                  Complete cognitive challenges
                  and maintain your habits to
                  unlock achievements.
                </Text>

              </View>

            ) : (

              achievements.map(
                (achievement, index) => (

                  <List.Item
                    key={`${achievement.title}-${index}`}

                    title={achievement.title}

                    titleStyle={
                      styles.achievementTitle
                    }

                    description={
                      achievement.description
                    }

                    descriptionStyle={
                      styles.achievementDescription
                    }

                    left={props => (
                      <List.Icon
                        {...props}
                        icon={achievement.icon}
                        color={achievement.color}
                      />
                    )}
                  />

                )
              )

            )}

          </Card.Content>
        </Card>


        {/* =================================================
            PERFORMANCE SUMMARY
            ================================================= */}

        <Card style={styles.card}>
          <Card.Content>

            <Text style={styles.sectionTitle}>
              Performance Summary
            </Text>

            <View style={styles.statsRow}>

              <View style={styles.statBox}>
                <Text style={styles.statValue}>
                  {challenge?.total_completed || 0}
                </Text>

                <Text style={styles.statLabel}>
                  Challenges
                </Text>
              </View>


              <View style={styles.statBox}>
                <Text style={styles.statValue}>
                  {Number(
                    challenge?.success_percentage || 0
                  ).toFixed(0)}
                  %
                </Text>

                <Text style={styles.statLabel}>
                  Success Rate
                </Text>
              </View>


              <View style={styles.statBox}>
                <Text style={styles.statValue}>
                  {Number(
                    habit?.current_score || 0
                  ).toFixed(1)}
                </Text>

                <Text style={styles.statLabel}>
                  Habit Score
                </Text>
              </View>

            </View>

          </Card.Content>
        </Card>

      </ScrollView>

    </ThemeBackground>
  );
};


/* =========================================================
   REPORTS SCREEN
   ========================================================= */

export const ReportsScreen = () => {

  const [reports, setReports] =
    React.useState<any>(null);

  const [loading, setLoading] =
    React.useState(true);

  const [error, setError] =
    React.useState('');


  /* =====================================================
     LOAD REPORTS
     ===================================================== */

  const loadReports = async () => {

    try {

      setLoading(true);
      setError('');

      const data =
        await profileService.getMyReports();

      console.log(
        'Reports API response:',
        data
      );

      setReports(data);

    } catch (err: any) {

      console.error(
        'Failed to load reports:',
        err
      );

      setError(
        err?.response?.data?.detail ||
          'Unable to load your reports.'
      );

    } finally {

      setLoading(false);

    }
  };


  React.useEffect(() => {
    loadReports();
  }, []);


  /* =====================================================
     LOADING
     ===================================================== */

  if (loading) {

    return (
      <ThemeBackground>

        <View style={styles.centerContainer}>

          <Text style={styles.loadingText}>
            Loading your reports...
          </Text>

        </View>

      </ThemeBackground>
    );
  }


  /* =====================================================
     ERROR
     ===================================================== */

  if (error || !reports) {

    return (
      <ThemeBackground>

        <View style={styles.centerContainer}>

          <Text style={styles.errorText}>
            {error ||
              'No report data available.'}
          </Text>

          <Button
            mode="contained"
            onPress={loadReports}
            buttonColor="#A58BFF"
            textColor="#FFFFFF"
            style={styles.retryButton}
          >
            Try Again
          </Button>

        </View>

      </ThemeBackground>
    );
  }


  /* =====================================================
     DATA
     ===================================================== */

  const userInfo =
    reports.user_info;

  const challenge =
    reports.challenge_analytics;

  const habit =
    reports.habit_score_analytics;

  const alarms =
    reports.alarm_analytics;


  return (
    <ThemeBackground>

      <ScrollView
        style={styles.container}
        contentContainerStyle={{
          paddingBottom: 30,
        }}
        showsVerticalScrollIndicator={false}
      >


        {/* =================================================
            USER INFORMATION
            ================================================= */}

        <Card style={styles.card}>
          <Card.Content>

            <Text style={styles.sectionTitle}>
              Cognitive Performance Report
            </Text>

            <Text style={styles.userName}>
              {userInfo?.full_name || 'User'}
            </Text>

            <Text style={styles.secondaryText}>
              {userInfo?.email || ''}
            </Text>

            <View style={styles.divider} />


            <List.Item
              title="Account Status"
              description={
                userInfo?.account_status ||
                'Unknown'
              }
              titleStyle={styles.listTitle}
              descriptionStyle={
                styles.listDescription
              }
              left={props => (
                <List.Icon
                  {...props}
                  icon="account-check"
                  color="#A58BFF"
                />
              )}
            />


            <List.Item
              title="Preferred Wake-up Time"
              description={
                userInfo?.preferred_wakeup_time ||
                'Not set'
              }
              titleStyle={styles.listTitle}
              descriptionStyle={
                styles.listDescription
              }
              left={props => (
                <List.Icon
                  {...props}
                  icon="alarm"
                  color="#A58BFF"
                />
              )}
            />


            <List.Item
              title="Assigned Coach"
              description={
                userInfo?.assigned_coach
                  ?.full_name ||
                'Not assigned'
              }
              titleStyle={styles.listTitle}
              descriptionStyle={
                styles.listDescription
              }
              left={props => (
                <List.Icon
                  {...props}
                  icon="account-supervisor"
                  color="#A58BFF"
                />
              )}
            />

          </Card.Content>
        </Card>


        {/* =================================================
            HABIT SCORE
            ================================================= */}

        <Card style={styles.card}>
          <Card.Content>

            <Text style={styles.sectionTitle}>
              Habit Score
            </Text>


            <View style={styles.scoreContainer}>

              <Text style={styles.scoreValue}>
                {Number(
                  habit?.current_score || 0
                ).toFixed(1)}
              </Text>

              <Text style={styles.scoreLabel}>
                Current Score
              </Text>

            </View>


            <View style={styles.statsRow}>

              <View style={styles.statBox}>

                <Text style={styles.statValue}>
                  {Number(
                    habit?.weekly_score || 0
                  ).toFixed(1)}
                </Text>

                <Text style={styles.statLabel}>
                  Weekly
                </Text>

              </View>


              <View style={styles.statBox}>

                <Text style={styles.statValue}>
                  {Number(
                    habit?.monthly_score || 0
                  ).toFixed(1)}
                </Text>

                <Text style={styles.statLabel}>
                  Monthly
                </Text>

              </View>


              <View style={styles.statBox}>

                <Text style={styles.statValue}>
                  {Number(
                    habit?.average_score || 0
                  ).toFixed(1)}
                </Text>

                <Text style={styles.statLabel}>
                  Average
                </Text>

              </View>

            </View>


            <View style={styles.statsRow}>

              <View style={styles.statBox}>

                <Text style={styles.statValue}>
                  {Number(
                    habit?.highest_score || 0
                  ).toFixed(1)}
                </Text>

                <Text style={styles.statLabel}>
                  Highest
                </Text>

              </View>


              <View style={styles.statBox}>

                <Text style={styles.statValue}>
                  {Number(
                    habit?.lowest_score || 0
                  ).toFixed(1)}
                </Text>

                <Text style={styles.statLabel}>
                  Lowest
                </Text>

              </View>

            </View>

          </Card.Content>
        </Card>


        {/* =================================================
            COGNITIVE CHALLENGE PERFORMANCE
            ================================================= */}

        <Card style={styles.card}>
          <Card.Content>

            <Text style={styles.sectionTitle}>
              Cognitive Challenge Performance
            </Text>


            <View style={styles.statsRow}>

              <View style={styles.statBox}>

                <Text style={styles.statValue}>
                  {challenge?.total_completed || 0}
                </Text>

                <Text style={styles.statLabel}>
                  Completed
                </Text>

              </View>


              <View style={styles.statBox}>

                <Text style={styles.statValue}>
                  {challenge?.total_failed || 0}
                </Text>

                <Text style={styles.statLabel}>
                  Failed
                </Text>

              </View>


              <View style={styles.statBox}>

                <Text style={styles.statValue}>
                  {Number(
                    challenge?.success_percentage || 0
                  ).toFixed(0)}
                  %
                </Text>

                <Text style={styles.statLabel}>
                  Success
                </Text>

              </View>

            </View>


            <View style={styles.divider} />


            <List.Item
              title="Average Completion Time"
              description={`${Number(
                challenge?.average_completion_time || 0
              ).toFixed(1)} seconds`}
              titleStyle={styles.listTitle}
              descriptionStyle={
                styles.listDescription
              }
              left={props => (
                <List.Icon
                  {...props}
                  icon="timer-outline"
                  color="#A58BFF"
                />
              )}
            />


            <List.Item
              title="Fastest Completion"
              description={`${challenge?.fastest_completion || 0} seconds`}
              titleStyle={styles.listTitle}
              descriptionStyle={
                styles.listDescription
              }
              left={props => (
                <List.Icon
                  {...props}
                  icon="speedometer"
                  color="#4ADE80"
                />
              )}
            />


            <List.Item
              title="Slowest Completion"
              description={`${challenge?.slowest_completion || 0} seconds`}
              titleStyle={styles.listTitle}
              descriptionStyle={
                styles.listDescription
              }
              left={props => (
                <List.Icon
                  {...props}
                  icon="timer-sand"
                  color="#FBBF24"
                />
              )}
            />

          </Card.Content>
        </Card>


        {/* =================================================
            DIFFICULTY PERFORMANCE
            ================================================= */}

        <Card style={styles.card}>
          <Card.Content>

            <Text style={styles.sectionTitle}>
              Difficulty Performance
            </Text>


            {[
              'easy',
              'medium',
              'hard',
            ].map(level => {

              const data =
                challenge
                  ?.difficulty_performance
                  ?.[level];

              return (

                <View
                  key={level}
                  style={styles.difficultyRow}
                >

                  <View style={{ flex: 1 }}>

                    <Text
                      style={
                        styles.difficultyTitle
                      }
                    >
                      {level
                        .charAt(0)
                        .toUpperCase() +
                        level.slice(1)}
                    </Text>


                    <Text
                      style={
                        styles.difficultyDescription
                      }
                    >
                      {data?.total || 0}{' '}
                      challenges •{' '}
                      {data?.correct || 0}{' '}
                      correct
                    </Text>

                  </View>


                  <Text
                    style={
                      styles.difficultyScore
                    }
                  >
                    {Number(
                      data?.success_rate || 0
                    ).toFixed(0)}
                    %
                  </Text>

                </View>

              );
            })}

          </Card.Content>
        </Card>


        {/* =================================================
            ALARM PERFORMANCE
            ================================================= */}

        <Card style={styles.card}>
          <Card.Content>

            <Text style={styles.sectionTitle}>
              Alarm & Wake-up Performance
            </Text>


            <View style={styles.statsRow}>

              <View style={styles.statBox}>

                <Text style={styles.statValue}>
                  {alarms?.total_alarms || 0}
                </Text>

                <Text style={styles.statLabel}>
                  Alarms
                </Text>

              </View>


              <View style={styles.statBox}>

                <Text style={styles.statValue}>
                  {alarms?.completed_alarms || 0}
                </Text>

                <Text style={styles.statLabel}>
                  Completed
                </Text>

              </View>


              <View style={styles.statBox}>

                <Text style={styles.statValue}>
                  {alarms?.missed_alarms || 0}
                </Text>

                <Text style={styles.statLabel}>
                  Missed
                </Text>

              </View>

            </View>


            <View style={styles.statsRow}>

              <View style={styles.statBox}>

                <Text style={styles.statValue}>
                  {alarms?.snoozed_alarms || 0}
                </Text>

                <Text style={styles.statLabel}>
                  Snoozed
                </Text>

              </View>


              <View style={styles.statBox}>

                <Text style={styles.statValue}>
                  {Number(
                    alarms?.wakeup_consistency || 0
                  ).toFixed(0)}
                  %
                </Text>

                <Text style={styles.statLabel}>
                  Wake-up Consistency
                </Text>

              </View>

            </View>

          </Card.Content>
        </Card>


        {/* =================================================
            RECENT CHALLENGE HISTORY
            ================================================= */}

        <Card style={styles.card}>
          <Card.Content>

            <Text style={styles.sectionTitle}>
              Recent Challenge History
            </Text>


            {habit?.score_history?.length ? (

              habit.score_history.map(
                (item: any, index: number) => (

                  <View
                    key={
                      item.id || index
                    }
                    style={
                      styles.historyItem
                    }
                  >

                    <View style={{ flex: 1 }}>

                      <Text
                        style={
                          styles.historyTitle
                        }
                      >
                        {item.challenge_type
                          ? item.challenge_type
                              .charAt(0)
                              .toUpperCase() +
                            item.challenge_type.slice(
                              1
                            )
                          : 'Challenge'}
                      </Text>


                      <Text
                        style={
                          styles.historyDescription
                        }
                      >
                        {item.difficulty
                          ? item.difficulty.toUpperCase()
                          : 'UNKNOWN'}{' '}
                        •{' '}
                        {item.time_taken_seconds}s{' '}
                        •{' '}
                        {item.is_correct
                          ? 'Correct'
                          : 'Incorrect'}
                      </Text>

                    </View>


                    <Text
                      style={
                        styles.historyScore
                      }
                    >
                      {Number(
                        item.habit_score || 0
                      ).toFixed(1)}
                    </Text>

                  </View>

                )
              )

            ) : (

              <Text style={styles.noDataText}>
                No challenge history available.
              </Text>

            )}

          </Card.Content>
        </Card>


        {/* =================================================
            WEEKLY SUMMARY
            ================================================= */}

        <Card style={styles.card}>
          <Card.Content>

            <Text style={styles.sectionTitle}>
              Weekly Summary
            </Text>


            <Text style={styles.summaryText}>
              You completed{' '}

              <Text style={styles.highlightText}>
                {challenge?.total_completed || 0}
              </Text>{' '}

              cognitive challenges with a{' '}

              <Text style={styles.highlightText}>
                {Number(
                  challenge?.success_percentage || 0
                ).toFixed(0)}
                %
              </Text>{' '}

              success rate.
            </Text>


            <Text style={styles.summaryText}>
              Your current habit score is{' '}

              <Text style={styles.highlightText}>
                {Number(
                  habit?.current_score || 0
                ).toFixed(1)}
              </Text>
              .
            </Text>


            <Text style={styles.summaryText}>
              Your wake-up consistency is{' '}

              <Text style={styles.highlightText}>
                {Number(
                  alarms?.wakeup_consistency || 0
                ).toFixed(0)}
                %
              </Text>
              .
            </Text>


            <Text style={styles.summaryNote}>
              Keep completing your cognitive
              challenges consistently to maintain
              and improve your habit score.
            </Text>

          </Card.Content>
        </Card>


      </ScrollView>

    </ThemeBackground>
  );
};


/* =========================================================
   STYLES
   ========================================================= */

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 16,
  },

  card: {
    borderRadius: 20,
    marginBottom: 16,
    backgroundColor:
      'rgba(26, 22, 38, 0.85)',
    borderWidth: 1,
    borderColor:
      'rgba(165, 139, 255, 0.15)',
    elevation: 4,
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#A58BFF',
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#A58BFF',
    marginBottom: 16,
  },

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
  },

  errorText: {
    color: '#F87171',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },

  retryButton: {
    borderRadius: 20,
  },

  listTitle: {
    color: '#FFFFFF',
  },

  listDescription: {
    color: '#A098BA',
  },

  signOutButton: {
    marginTop: 20,
    borderRadius: 20,
  },

  /* =====================================================
     ACHIEVEMENTS
     ===================================================== */

  achievementIntro: {
    color: '#A098BA',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },

  achievementTitle: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  achievementDescription: {
    color: '#A098BA',
  },

  noAchievementContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },

  noAchievementTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },

  noAchievementText: {
    color: '#A098BA',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },

  /* =====================================================
     USER
     ===================================================== */

  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },

  secondaryText: {
    color: '#A098BA',
    fontSize: 14,
  },

  divider: {
    height: 1,
    backgroundColor:
      'rgba(165, 139, 255, 0.15)',
    marginVertical: 12,
  },

  /* =====================================================
     HABIT SCORE
     ===================================================== */

  scoreContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },

  scoreValue: {
    fontSize: 52,
    fontWeight: 'bold',
    color: '#A58BFF',
  },

  scoreLabel: {
    fontSize: 14,
    color: '#A098BA',
  },

  /* =====================================================
     STATISTICS
     ===================================================== */

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },

  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  statLabel: {
    color: '#A098BA',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },

  /* =====================================================
     DIFFICULTY
     ===================================================== */

  difficultyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor:
      'rgba(165, 139, 255, 0.1)',
  },

  difficultyTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  difficultyDescription: {
    color: '#A098BA',
    fontSize: 12,
    marginTop: 3,
  },

  difficultyScore: {
    color: '#A58BFF',
    fontSize: 18,
    fontWeight: 'bold',
  },

  /* =====================================================
     HISTORY
     ===================================================== */

  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor:
      'rgba(165, 139, 255, 0.1)',
  },

  historyTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  historyDescription: {
    color: '#A098BA',
    fontSize: 12,
    marginTop: 4,
  },

  historyScore: {
    color: '#A58BFF',
    fontSize: 17,
    fontWeight: 'bold',
  },

  noDataText: {
    color: '#A098BA',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 15,
  },

  /* =====================================================
     SUMMARY
     ===================================================== */

  summaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 10,
  },

  highlightText: {
    color: '#A58BFF',
    fontWeight: 'bold',
  },

  summaryNote: {
    color: '#A098BA',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },
});