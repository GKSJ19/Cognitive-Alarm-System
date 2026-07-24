import React, { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, Modal, ScrollView, Alert, Platform } from 'react-native';
import { Text, useTheme, Card, Avatar, Button, IconButton, FAB, Snackbar } from 'react-native-paper';
import { useAdmin } from '../../hooks/useAdmin';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import { DetailedCoachCard } from '../../types/admin.types';

export const CoachManagementScreen: React.FC = () => {
  const theme = useTheme();
  const { detailedCoaches, getDetailedCoaches, createCoach, deleteCoach, isLoading, error, clearError } = useAdmin();

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  useEffect(() => {
    getDetailedCoaches();
  }, [getDetailedCoaches]);

  const handleCreateCoachSubmit = async () => {
    if (!email || !fullName || !password) {
      setSnackbarMessage("Please fill in all fields");
      return;
    }

    try {
      await createCoach({ email, full_name: fullName, password, role: 'coach' });
      setAddModalVisible(false);
      setFullName('');
      setEmail('');
      setPassword('');
      setSnackbarMessage("Coach created successfully");
    } catch (err) {
      setSnackbarMessage("Failed to create coach account");
    }
  };

  const performDeleteCoach = async (coachId: string) => {
    try {
      await deleteCoach(coachId);
      setSnackbarMessage("Coach deleted successfully");
    } catch (err) {
      setSnackbarMessage("Failed to delete coach");
    }
  };

  const handleDeleteCoach = (coachId: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm("Are you sure you want to remove this coach? Assigned users will become unassigned.")) {
        performDeleteCoach(coachId);
      }
    } else {
      Alert.alert(
        "Remove Coach",
        "Are you sure you want to remove this coach? Assigned users will become unassigned.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Remove", onPress: () => performDeleteCoach(coachId), style: "destructive" }
        ]
      );
    }
  };

  const renderCoachItem = ({ item }: { item: DetailedCoachCard }) => {
    const initials = item.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase();

    return (
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.headerRow}>
            <Avatar.Text size={44} label={initials} style={{ backgroundColor: theme.colors.secondary }} />
            <View style={styles.headerInfo}>
              <Text style={[styles.name, { color: theme.colors.onSurface }]}>{item.full_name}</Text>
              <Text style={[styles.email, { color: theme.colors.onSurfaceVariant }]}>{item.email}</Text>
              <Text style={[styles.meta, { color: theme.colors.onSurfaceVariant }]}>Registered: {item.created_at}</Text>
            </View>
            <IconButton icon="delete" iconColor={theme.colors.error} size={22} onPress={() => handleDeleteCoach(item.id)} />
          </View>

          {/* Metrics Grid */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricCol}>
              <Text style={[styles.metricVal, { color: theme.colors.primary }]}>{item.assigned_users_count}</Text>
              <Text style={styles.metricSub}>Assigned Users</Text>
            </View>
            <View style={styles.metricCol}>
              <Text style={[styles.metricVal, { color: '#059669' }]}>{item.total_active_users}</Text>
              <Text style={styles.metricSub}>Active Users</Text>
            </View>
            <View style={styles.metricCol}>
              <Text style={[styles.metricVal, { color: '#7C3AED' }]}>{item.average_user_habit_score.toFixed(1)}</Text>
              <Text style={styles.metricSub}>Avg Client Score</Text>
            </View>
            <View style={styles.metricCol}>
              <Text style={[styles.metricVal, { color: '#D97706' }]}>{item.average_challenge_completion_rate}%</Text>
              <Text style={styles.metricSub}>Solve Rate</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LoadingOverlay visible={isLoading && !detailedCoaches} />

      <FlatList
        data={detailedCoaches}
        keyExtractor={(item) => item.id}
        renderItem={renderCoachItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant }}>
              No coaches registered yet. Tap + to add a wellness coach.
            </Text>
          </View>
        }
      />

      <FAB
        icon="account-plus"
        label="Add Coach"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="#FFFFFF"
        onPress={() => setAddModalVisible(true)}
      />

      {/* Add Coach Modal */}
      <Modal visible={addModalVisible} transparent animationType="slide" onRequestClose={() => setAddModalVisible(false)}>
        <View style={[styles.overlay, { backgroundColor: 'rgba(15, 23, 42, 0.8)' }]}>
          <Card style={[styles.modalCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>Register New Coach</Text>
                <IconButton icon="close" size={24} onPress={() => setAddModalVisible(false)} />
              </View>

              <AppInput label="Full Name" value={fullName} onChangeText={setFullName} placeholder="e.g. Dr. Jane Smith" />
              <AppInput label="Email Address" value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="coach@icap.com" />
              <AppInput label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="Set account password" />

              <AppButton mode="contained" onPress={handleCreateCoachSubmit} style={{ marginTop: 16 }}>
                Create Coach Account
              </AppButton>
            </Card.Content>
          </Card>
        </View>
      </Modal>

      <Snackbar
        visible={!!error || !!snackbarMessage}
        onDismiss={() => { setSnackbarMessage(null); clearError(); }}
        action={{ label: 'OK', onPress: () => { setSnackbarMessage(null); clearError(); } }}
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
    padding: 16,
  },
  list: {
    paddingBottom: 80,
  },
  card: {
    marginBottom: 14,
    borderRadius: 18,
    elevation: 2,
  },
  cardContent: {
    paddingVertical: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 13,
    marginTop: 2,
  },
  meta: {
    fontSize: 11,
    marginTop: 2,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F8FAFC',
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 12,
  },
  metricCol: {
    alignItems: 'center',
  },
  metricVal: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  metricSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    borderRadius: 28,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    borderRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyContainer: {
    paddingVertical: 80,
    alignItems: 'center',
  },
});

export default CoachManagementScreen;
