import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Alert, Platform } from 'react-native';
import { Text, useTheme, Card, Button, List, Snackbar } from 'react-native-paper';
import { useAlarms } from '../../hooks/useAlarms';
import LoadingOverlay from '../../components/common/LoadingOverlay';

import ThemeBackground from '../../components/common/ThemeBackground';

interface AlarmDetailsScreenProps {
  route: any;
  navigation: any;
}

export const AlarmDetailsScreen: React.FC<AlarmDetailsScreenProps> = ({ route, navigation }) => {
  const { alarmId } = route.params;
  const theme = useTheme();
  const { alarms, history, isLoading, error, deleteAlarm, getHistory, clearError } = useAlarms();
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  useEffect(() => {
    getHistory();
  }, [getHistory]);

  const alarm = alarms.find(a => a.alarm_id === alarmId);
  const alarmLogs = history.filter(h => h.alarm_id === alarmId);

  if (!alarm) {
    return (
      <ThemeBackground>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: '#FFFFFF' }}>Alarm not found.</Text>
          <Button onPress={() => navigation.goBack()} textColor="#A58BFF" style={{ marginTop: 16 }}>Back</Button>
        </View>
      </ThemeBackground>
    );
  }

  // Calculate statistics
  const totalDismissals = alarmLogs.length;
  const solvedLogs = alarmLogs.filter(h => h.solved);
  const avgSolveTime = solvedLogs.length > 0 
    ? Math.round(solvedLogs.reduce((acc, curr) => acc + curr.solve_time, 0) / solvedLogs.length)
    : 0;

  const confirmAndDelete = async () => {
    try {
      await deleteAlarm(alarmId).unwrap();
      navigation.goBack();
    } catch (err) {
      setSnackbarMessage("Failed to delete alarm");
    }
  };

  const handleDelete = () => {
    if (Platform.OS === 'web') {
      if (window.confirm("Are you sure you want to delete this alarm? This will remove all future alarm schedules.")) {
        confirmAndDelete();
      }
    } else {
      Alert.alert(
        "Delete Alarm",
        "Are you sure you want to delete this alarm? This will remove all future alarm schedules.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            onPress: confirmAndDelete,
            style: "destructive"
          }
        ]
      );
    }
  };

  const getRepeatLabel = (repeatDays: string | null) => {
    if (!repeatDays) return "Once";
    const days = repeatDays.split(',');
    if (days.length === 7) return "Everyday";
    if (days.length === 5 && !days.includes('0') && !days.includes('6')) return "Weekdays";
    if (days.length === 2 && days.includes('0') && days.includes('6')) return "Weekends";
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days.map(d => dayNames[parseInt(d, 10)]).join(', ');
  };

  return (
    <ThemeBackground>
      <View style={styles.container}>
        <LoadingOverlay visible={isLoading} />
        
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Title/Time header */}
          <Card style={[styles.card, { backgroundColor: 'rgba(26, 22, 38, 0.85)', borderColor: 'rgba(165, 139, 255, 0.15)' }]}>
            <Card.Content>
              <View style={styles.row}>
                <Text style={[styles.time, { color: '#A58BFF' }]}>{alarm.alarm_time}</Text>
                <View style={[styles.statusBadge, { backgroundColor: alarm.is_active ? '#2C2243' : '#262036' }]}>
                  <Text style={[styles.statusText, { color: alarm.is_active ? '#A58BFF' : '#6D6586' }]}>
                    {alarm.is_active ? 'ACTIVE' : 'INACTIVE'}
                  </Text>
                </View>
              </View>
              <Text style={[styles.title, { color: '#FFFFFF' }]}>{alarm.title}</Text>
              <Text style={[styles.repeat, { color: theme.colors.onSurfaceVariant }]}>
                Repeats: {getRepeatLabel(alarm.repeat_days)}
              </Text>
            </Card.Content>
          </Card>

          {/* Challenge Stats */}
          <View style={styles.analyticsRow}>
            <Card style={[styles.analyticsCard, { flex: 0.48, backgroundColor: 'rgba(26, 22, 38, 0.85)', borderColor: 'rgba(165, 139, 255, 0.15)' }]}>
              <Card.Content style={styles.centerAlign}>
                <Text style={[styles.analyticsVal, { color: '#A58BFF' }]}>
                  {avgSolveTime}s
                </Text>
                <Text style={[styles.analyticsLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Avg. Solve Time
                </Text>
              </Card.Content>
            </Card>

            <Card style={[styles.analyticsCard, { flex: 0.48, backgroundColor: 'rgba(26, 22, 38, 0.85)', borderColor: 'rgba(165, 139, 255, 0.15)' }]}>
              <Card.Content style={styles.centerAlign}>
                <Text style={[styles.analyticsVal, { color: '#B49BFF' }]}>
                  {totalDismissals}
                </Text>
                <Text style={[styles.analyticsLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Wake-ups Logged
                </Text>
              </Card.Content>
            </Card>
          </View>

          {/* Cognitive Modifiers */}
          <Card style={[styles.card, { backgroundColor: 'rgba(26, 22, 38, 0.85)', borderColor: 'rgba(165, 139, 255, 0.15)' }]}>
            <Card.Content>
              <Text style={[styles.sectionTitle, { color: '#A58BFF' }]}>Cognitive Configurations</Text>
              <List.Item
                title="Challenge Required"
                titleStyle={{ color: '#FFFFFF' }}
                description={alarm.challenge_required ? "Yes" : "No"}
                descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                left={props => <List.Icon {...props} icon="brain" color="#A58BFF" />}
              />
              {alarm.challenge_required ? (
                <>
                  <List.Item
                    title="Challenge Type"
                    titleStyle={{ color: '#FFFFFF' }}
                    description={alarm.challenge_type.toUpperCase()}
                    descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                    left={props => <List.Icon {...props} icon="puzzle-outline" color="#A58BFF" />}
                  />
                  <List.Item
                    title="Difficulty Level"
                    titleStyle={{ color: '#FFFFFF' }}
                    description={alarm.difficulty.toUpperCase()}
                    descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                    left={props => <List.Icon {...props} icon="sword" color="#A58BFF" />}
                  />
                </>
              ) : null}
              <List.Item
                title="Vibration"
                titleStyle={{ color: '#FFFFFF' }}
                description={alarm.vibration ? "Enabled" : "Disabled"}
                descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                left={props => <List.Icon {...props} icon="vibrate" color="#A58BFF" />}
              />
              <List.Item
                title="Snooze Time"
                titleStyle={{ color: '#FFFFFF' }}
                description={alarm.snooze_enabled ? `${alarm.snooze_duration} minutes` : "Disabled"}
                descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                left={props => <List.Icon {...props} icon="snooze" color="#A58BFF" />}
              />
            </Card.Content>
          </Card>

          {/* Wake-up logs */}
          <Card style={[styles.card, { backgroundColor: 'rgba(26, 22, 38, 0.85)', borderColor: 'rgba(165, 139, 255, 0.15)' }]}>
            <Card.Content>
              <Text style={[styles.sectionTitle, { color: '#A58BFF' }]}>Recent Wake-up History</Text>
              {alarmLogs.length === 0 ? (
                <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 13 }}>No dismissals logged yet.</Text>
              ) : (
                alarmLogs.slice(0, 5).map((log, index) => (
                  <List.Item
                    key={log.history_id || index}
                    title={`Woke up at ${log.wake_time}`}
                    titleStyle={{ color: '#FFFFFF' }}
                    description={`Solved challenge in ${log.solve_time} seconds`}
                    descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                    left={props => <List.Icon {...props} icon="calendar-check" color="#34D399" />}
                  />
                ))
              )}
            </Card.Content>
          </Card>

          {/* Actions */}
          <View style={styles.actionRow}>
            <Button 
              mode="outlined" 
              icon="pencil"
              textColor="#A58BFF"
              onPress={() => navigation.navigate('EditAlarm', { alarmId })} 
              style={[styles.btn, { marginRight: 8, borderColor: '#A58BFF' }]}
            >
              Edit
            </Button>
            <Button 
              mode="contained" 
              icon="delete"
              buttonColor={theme.colors.error}
              onPress={handleDelete} 
              style={[styles.btn, { marginLeft: 8 }]}
            >
              Delete
            </Button>
          </View>
        </ScrollView>

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
          style={{ backgroundColor: error ? theme.colors.error : theme.colors.secondary }}
        >
          {error || snackbarMessage}
        </Snackbar>
      </View>
    </ThemeBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  time: {
    fontSize: 42,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontWeight: 'bold',
    fontSize: 11,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  repeat: {
    fontSize: 14,
    marginTop: 4,
  },
  analyticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  analyticsCard: {
    borderRadius: 16,
  },
  centerAlign: {
    alignItems: 'center',
  },
  analyticsVal: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  analyticsLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  btn: {
    flex: 1,
  },
});

export default AlarmDetailsScreen;
