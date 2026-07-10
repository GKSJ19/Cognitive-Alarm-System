import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { Text, useTheme, Card, Button, List, Snackbar } from 'react-native-paper';
import { useHabits } from '../../hooks/useHabits';
import LoadingOverlay from '../../components/common/LoadingOverlay';

interface HabitDetailsScreenProps {
  route: any;
  navigation: any;
}

export const HabitDetailsScreen: React.FC<HabitDetailsScreenProps> = ({ route, navigation }) => {
  const { habitId } = route.params;
  const theme = useTheme();
  const { habits, progress, isLoading, error, deleteHabit, clearError } = useHabits();
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  const habit = habits.find(h => h.habit_id === habitId);
  const habitProgress = progress.filter(p => p.habit_id === habitId);
  const completedRecords = habitProgress.filter(p => p.status === 'completed');

  if (!habit) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.colors.onBackground }}>Habit not found.</Text>
        <Button onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>Back</Button>
      </View>
    );
  }

  // Get active streak
  const getStreak = () => {
    const sortedCompletions = [...completedRecords].sort((a, b) => b.completion_date.localeCompare(a.completion_date));
    if (sortedCompletions.length === 0) return 0;
    return sortedCompletions[0].streak_count;
  };

  // Stats calculations
  const totalDaysTracked = 30; // Show past 30 days progress
  const completionPercentage = Math.round((completedRecords.length / totalDaysTracked) * 100);

  const handleDelete = () => {
    Alert.alert(
      "Delete Habit",
      "Are you sure you want to delete this habit? All progress logs will be lost permanently.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          onPress: async () => {
            try {
              await deleteHabit(habitId).unwrap();
              navigation.goBack();
            } catch (err) {
              setSnackbarMessage("Failed to delete habit");
            }
          }, 
          style: "destructive" 
        }
      ]
    );
  };

  // Generate calendar grid for past 28 days
  const renderCalendarGrid = () => {
    const cells = [];
    const today = new Date();
    
    for (let i = 27; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const isCompleted = habitProgress.some(p => p.completion_date === dateStr && p.status === 'completed');
      const dayNum = date.getDate();

      cells.push(
        <View 
          key={dateStr} 
          style={[
            styles.calendarCell, 
            { 
              backgroundColor: isCompleted ? theme.colors.primary : theme.colors.surfaceVariant,
              borderColor: theme.colors.outline,
            }
          ]}
        >
          <Text style={[styles.cellText, { color: isCompleted ? '#FFFFFF' : theme.colors.onSurfaceVariant }]}>
            {dayNum}
          </Text>
        </View>
      );
    }
    return cells;
  };

  const currentStreak = getStreak();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LoadingOverlay visible={isLoading} />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Title Details Card */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.row}>
              <Text style={[styles.title, { color: theme.colors.onBackground }]}>{habit.title}</Text>
              <View style={[styles.statusBadge, { backgroundColor: habit.is_active ? '#22C55E' : '#64748B' }]}>
                <Text style={styles.statusText}>{habit.is_active ? 'ACTIVE' : 'INACTIVE'}</Text>
              </View>
            </View>

            {habit.description ? (
              <Text style={[styles.desc, { color: theme.colors.onSurfaceVariant }]}>
                {habit.description}
              </Text>
            ) : null}
          </Card.Content>
        </Card>

        {/* Analytics Cards */}
        <View style={styles.analyticsRow}>
          <Card style={[styles.analyticsCard, { flex: 0.48 }]}>
            <Card.Content style={styles.centerAlign}>
              <Text style={[styles.analyticsVal, { color: theme.colors.primary }]}>
                🔥 {currentStreak}
              </Text>
              <Text style={[styles.analyticsLabel, { color: theme.colors.onSurfaceVariant }]}>
                Current Streak
              </Text>
            </Card.Content>
          </Card>

          <Card style={[styles.analyticsCard, { flex: 0.48 }]}>
            <Card.Content style={styles.centerAlign}>
              <Text style={[styles.analyticsVal, { color: theme.colors.secondary }]}>
                📈 {completionPercentage}%
              </Text>
              <Text style={[styles.analyticsLabel, { color: theme.colors.onSurfaceVariant }]}>
                30d Completion
              </Text>
            </Card.Content>
          </Card>
        </View>

        {/* Calendar View */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Activity Grid (Last 28 Days)</Text>
            <View style={styles.calendarContainer}>
              {renderCalendarGrid()}
            </View>
          </Card.Content>
        </Card>

        {/* Configuration details */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Reminder Settings</Text>
            <List.Item
              title="Frequency"
              description={habit.frequency.toUpperCase()}
              left={props => <List.Icon {...props} icon="refresh" color={theme.colors.secondary} />}
            />
            <List.Item
              title="Daily Reminder Time"
              description={habit.reminder_time || "None"}
              left={props => <List.Icon {...props} icon="bell-ring" color={theme.colors.secondary} />}
            />
            <List.Item
              title="Weekly Target Days"
              description={`${habit.target_days} days`}
              left={props => <List.Icon {...props} icon="bullseye-arrow" color={theme.colors.secondary} />}
            />
          </Card.Content>
        </Card>

        {/* Action Row */}
        <View style={styles.actionRow}>
          <Button 
            mode="outlined" 
            icon="pencil"
            onPress={() => navigation.navigate('EditHabit', { habitId })} 
            style={[styles.btn, { marginRight: 8 }]}
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
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 10,
  },
  desc: {
    fontSize: 15,
    lineHeight: 22,
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
    marginBottom: 16,
  },
  calendarContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginHorizontal: -4,
  },
  calendarCell: {
    width: '12%',
    aspectRatio: 1,
    margin: '1%',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  cellText: {
    fontSize: 12,
    fontWeight: 'bold',
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

export default HabitDetailsScreen;
