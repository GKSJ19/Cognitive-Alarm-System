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



  useEffect(() => {
    getAlarms();
  }, [getAlarms]);



  const handleToggleActive = async (alarmId: string, currentVal: boolean) => {
    try {
      await updateAlarm(alarmId, { is_active: !currentVal }).unwrap();
      setSnackbarMessage(!currentVal ? "Alarm activated 🔔" : "Alarm deactivated");
    } catch (err) {
      // error handled by Redux
    }
  };

  const startSimulation = (alarm: any) => {
    navigation.navigate('AlarmRinging', { alarm, isPreview: true });
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
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
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
    backgroundColor: '#1E293B',
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
