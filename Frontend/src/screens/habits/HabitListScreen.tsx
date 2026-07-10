import React, { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity } from 'react-native';
import { Text, useTheme, Card, IconButton, FAB, Snackbar } from 'react-native-paper';
import { useHabits } from '../../hooks/useHabits';
import LoadingOverlay from '../../components/common/LoadingOverlay';

interface HabitListScreenProps {
  navigation: any;
}

export const HabitListScreen: React.FC<HabitListScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { habits, progress, isLoading, error, getHabits, getProgress, completeHabit, clearError } = useHabits();
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  useEffect(() => {
    getHabits();
    getProgress();
  }, [getHabits, getProgress]);

  const todayStr = new Date().toISOString().split('T')[0];

  const isCompletedToday = (habitId: string) => {
    return progress.some(p => p.habit_id === habitId && p.completion_date === todayStr && p.status === 'completed');
  };

  const getStreak = (habitId: string) => {
    const habitProgress = progress
      .filter(p => p.habit_id === habitId && p.status === 'completed')
      .sort((a, b) => b.completion_date.localeCompare(a.completion_date));
    
    if (habitProgress.length === 0) return 0;
    return habitProgress[0].streak_count;
  };

  const handleToggleComplete = async (habitId: string) => {
    const completed = isCompletedToday(habitId);
    try {
      await completeHabit(habitId, todayStr, completed ? 'missed' : 'completed').unwrap();
      setSnackbarMessage(completed ? "Habit marked incomplete" : "Habit completed! Keep it up 🔥");
    } catch (err) {
      // error handled by Redux
    }
  };

  const renderHabitItem = ({ item }: { item: any }) => {
    const completed = isCompletedToday(item.habit_id);
    const streak = getStreak(item.habit_id);

    return (
      <Card 
        style={[styles.card, { backgroundColor: theme.colors.surface }]}
        onPress={() => navigation.navigate('HabitDetails', { habitId: item.habit_id })}
      >
        <Card.Content style={styles.cardContent}>
          <View style={styles.leftContent}>
            <Text style={[styles.title, { color: theme.colors.onSurface }]}>{item.title}</Text>
            {item.description ? (
              <Text style={[styles.description, { color: theme.colors.onSurfaceVariant }]} numberOfLines={2}>
                {item.description}
              </Text>
            ) : null}
            <View style={styles.metaRow}>
              <View style={[styles.badge, { backgroundColor: theme.colors.primaryContainer }]}>
                <Text style={{ color: theme.colors.onPrimaryContainer, fontSize: 11, fontWeight: 'bold' }}>
                  {item.frequency.toUpperCase()}
                </Text>
              </View>
              {streak > 0 ? (
                <Text style={[styles.streakText, { color: theme.colors.secondary }]}>
                  🔥 {streak} day streak
                </Text>
              ) : null}
            </View>
          </View>

          <IconButton
            icon={completed ? "check-circle" : "checkbox-blank-circle-outline"}
            iconColor={completed ? theme.colors.primary : theme.colors.outline}
            size={36}
            onPress={() => handleToggleComplete(item.habit_id)}
          />
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LoadingOverlay visible={isLoading} />
      
      <FlatList
        data={habits}
        keyExtractor={(item) => item.habit_id}
        renderItem={renderHabitItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
              No habits created yet. Start tracking your routines now!
            </Text>
          </View>
        }
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="#FFFFFF"
        onPress={() => navigation.navigate('CreateHabit')}
      />

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
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  leftContent: {
    flex: 1,
    paddingRight: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 12,
  },
  streakText: {
    fontSize: 13,
    fontWeight: '600',
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
});

export default HabitListScreen;
