import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, useTheme, Card, List, Button, Snackbar } from 'react-native-paper';
import { useCoach } from '../../hooks/useCoach';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import LoadingOverlay from '../../components/common/LoadingOverlay';

interface UserDetailsScreenProps {
  route: any;
  navigation: any;
}

export const UserDetailsScreen: React.FC<UserDetailsScreenProps> = ({ route, navigation }) => {
  const { userId, fullName } = route.params;
  const theme = useTheme();
  const { selectedUserProgress, getUserProgress, sendMessage, isLoading, error, clearError } = useCoach();

  const [msgTitle, setMsgTitle] = useState('');
  const [msgBody, setMsgBody] = useState('');
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  useEffect(() => {
    getUserProgress(userId);
  }, [userId, getUserProgress]);

  const handleSendMessage = async () => {
    if (!msgTitle.trim() || !msgBody.trim()) {
      setSnackbarMessage("Message title and text are required");
      return;
    }
    try {
      await sendMessage(userId, msgTitle.trim(), msgBody.trim()).unwrap();
      setMsgTitle('');
      setMsgBody('');
      setSnackbarMessage("Motivational message sent successfully!");
    } catch (err) {
      setSnackbarMessage("Failed to deliver message");
    }
  };

  const habits = selectedUserProgress?.habits || [];
  const alarmHistory = selectedUserProgress?.alarm_history || [];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LoadingOverlay visible={isLoading} />
      
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.onBackground }]}>{fullName}</Text>
          <Text style={{ color: theme.colors.onSurfaceVariant }}>Routine & Cognitive stats</Text>
        </View>

        {/* Client Habits list */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Active Habits</Text>
            {habits.length === 0 ? (
              <Text style={{ color: theme.colors.onSurfaceVariant }}>No active habits logged.</Text>
            ) : (
              habits.map((h: any) => (
                <List.Item
                  key={h.habit_id}
                  title={h.title}
                  description={`Frequency: ${h.frequency} | Target: ${h.target_days} days`}
                  left={props => <List.Icon {...props} icon="run" color={theme.colors.secondary} />}
                />
              ))
            )}
          </Card.Content>
        </Card>

        {/* Client Alarms log */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Recent Wakeups</Text>
            {alarmHistory.length === 0 ? (
              <Text style={{ color: theme.colors.onSurfaceVariant }}>No alarm histories found.</Text>
            ) : (
              alarmHistory.slice(0, 5).map((log: any, idx: number) => (
                <List.Item
                  key={log.history_id || idx}
                  title={`Woke up at ${log.wake_time}`}
                  description={`Challenge solved in ${log.solve_time} seconds`}
                  left={props => <List.Icon {...props} icon="alarm-check" color="#10B981" />}
                />
              ))
            )}
          </Card.Content>
        </Card>

        {/* Send message form */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Send Motivational Note</Text>
            
            <AppInput
              label="Subject"
              value={msgTitle}
              onChangeText={setMsgTitle}
              placeholder="Keep it up!"
              leftIcon="bookmark"
            />

            <AppInput
              label="Message Text"
              value={msgBody}
              onChangeText={setMsgBody}
              placeholder="You completed all habits yesterday. Fantastic work!"
              multiline
              numberOfLines={3}
              leftIcon="text"
            />

            <AppButton mode="contained" onPress={handleSendMessage} style={{ marginTop: 8 }}>
              Send Note
            </AppButton>
          </Card.Content>
        </Card>
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
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
});

export default UserDetailsScreen;
