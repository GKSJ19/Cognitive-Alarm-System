import React, { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, Alert, Platform, TouchableOpacity, ScrollView } from 'react-native';
import { Text, useTheme, Card, Avatar, Button, IconButton, Searchbar, Snackbar, Chip } from 'react-native-paper';
import { useAdmin } from '../../hooks/useAdmin';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import CoachAssignmentModal from '../../components/admin/CoachAssignmentModal';

interface UserManagementScreenProps {
  navigation: any;
}

export const UserManagementScreen: React.FC<UserManagementScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { 
    detailedUsers, 
    detailedCoaches, 
    getDetailedUsers, 
    getDetailedCoaches, 
    assignCoach, 
    removeCoachAssignment, 
    toggleStatus, 
    deleteUser, 
    isLoading, 
    error, 
    clearError 
  } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCoachStatus, setFilterCoachStatus] = useState('all');
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'date' | 'streak'>('score');
  
  const [selectedUserForAssign, setSelectedUserForAssign] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  useEffect(() => {
    getDetailedUsers(searchQuery, filterStatus, filterCoachStatus);
    getDetailedCoaches();
  }, [getDetailedUsers, getDetailedCoaches]);

  const handleSearchAndFilter = (search: string, status: string, coachStatus: string) => {
    getDetailedUsers(search, status, coachStatus);
  };

  const openAssignModal = (user: any) => {
    setSelectedUserForAssign(user);
    setModalVisible(true);
  };

  const handleAssignCoachSubmit = async (coachId: string, userId: string) => {
    try {
      await assignCoach(coachId, userId);
      setModalVisible(false);
      setSnackbarMessage("Coach assigned successfully");
    } catch (err) {
      setSnackbarMessage("Failed to assign coach");
    }
  };

  const handleRemoveCoachSubmit = async (userId: string) => {
    try {
      await removeCoachAssignment(userId);
      setModalVisible(false);
      setSnackbarMessage("Coach assignment removed");
    } catch (err) {
      setSnackbarMessage("Failed to remove coach assignment");
    }
  };

  const handleToggleStatus = async (user: any) => {
    try {
      await toggleStatus(user.id, user.account_status === "Active").unwrap();
      setSnackbarMessage(user.account_status === "Active" ? "User suspended successfully" : "User activated successfully");
    } catch (err) {
      setSnackbarMessage("Failed to adjust user state");
    }
  };

  const performDelete = async (userId: string) => {
    try {
      await deleteUser(userId).unwrap();
      setSnackbarMessage("User deleted successfully");
    } catch (err) {
      setSnackbarMessage("Failed to delete user");
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm("Are you sure you want to permanently delete this user account?")) {
        performDelete(userId);
      }
    } else {
      Alert.alert(
        "Delete User",
        "Are you sure you want to permanently delete this user account?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", onPress: () => performDelete(userId), style: "destructive" }
        ]
      );
    }
  };

  const sortedUsers = [...(detailedUsers || [])].sort((a, b) => {
    if (sortBy === 'score') return b.current_habit_score - a.current_habit_score;
    if (sortBy === 'name') return a.full_name.localeCompare(b.full_name);
    if (sortBy === 'date') return b.registration_date.localeCompare(a.registration_date);
    if (sortBy === 'streak') return b.current_streak - a.current_streak;
    return 0;
  });

  const renderUserItem = ({ item }: { item: any }) => {
    const initials = item.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
    const isActive = item.account_status === "Active";

    return (
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content style={styles.cardContent}>
          <TouchableOpacity 
            style={styles.mainInfo} 
            onPress={() => navigation.navigate('AdminUserAnalytics', { userId: item.id })}
          >
            <Avatar.Text size={44} label={initials} style={{ backgroundColor: theme.colors.primary }} />
            <View style={styles.headerInfo}>
              <View style={styles.nameRow}>
                <Text style={[styles.name, { color: theme.colors.onSurface }]}>{item.full_name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: isActive ? '#DCFCE7' : '#FEE2E2' }]}>
                  <Text style={{ color: isActive ? '#166534' : '#991B1B', fontSize: 10, fontWeight: 'bold' }}>
                    {item.account_status.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={[styles.email, { color: theme.colors.onSurfaceVariant }]}>
                {item.email} {item.phone_number ? `• ${item.phone_number}` : ''}
              </Text>
              <Text style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>
                Registered: {item.registration_date} • Last Login: {item.last_login}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Metrics Row */}
          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={[styles.metricVal, { color: theme.colors.primary }]}>{item.current_habit_score.toFixed(1)}</Text>
              <Text style={styles.metricSub}>Habit Score</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricVal, { color: '#7C3AED' }]}>{item.current_streak}d</Text>
              <Text style={styles.metricSub}>Streak</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricVal, { color: '#059669' }]}>{item.success_rate}%</Text>
              <Text style={styles.metricSub}>Success Rate</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricVal, { color: '#D97706' }]}>{item.average_completion_time}s</Text>
              <Text style={styles.metricSub}>Avg Time</Text>
            </View>
          </View>

          {/* Coach Assignment Info Bar */}
          <View style={styles.coachBar}>
            <View style={styles.coachInfo}>
              <Text style={{ fontSize: 12, color: theme.colors.onSurfaceVariant }}>
                Assigned Coach: <Text style={{ fontWeight: 'bold', color: item.assigned_coach ? theme.colors.primary : '#DC2626' }}>
                  {item.assigned_coach ? item.assigned_coach.full_name : 'Unassigned'}
                </Text>
              </Text>
            </View>
            <Button
              mode="outlined"
              compact
              onPress={() => openAssignModal(item)}
              style={styles.assignBtn}
            >
              {item.assigned_coach ? "Reassign Coach" : "Assign Coach"}
            </Button>
          </View>

          {/* Actions Row */}
          <View style={styles.actionsRow}>
            <Button
              mode="contained-tonal"
              compact
              icon="chart-box-outline"
              onPress={() => navigation.navigate('AdminUserAnalytics', { userId: item.id })}
            >
              Analytics
            </Button>
            <IconButton
              icon={isActive ? "account-off" : "account-check"}
              iconColor={isActive ? theme.colors.error : '#10B981'}
              size={22}
              onPress={() => handleToggleStatus(item)}
            />
            <IconButton
              icon="delete"
              iconColor={theme.colors.error}
              size={22}
              onPress={() => handleDeleteUser(item.id)}
            />
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LoadingOverlay visible={isLoading && !detailedUsers} />

      <Searchbar
        placeholder="Search users by name or email..."
        value={searchQuery}
        onChangeText={(text) => {
          setSearchQuery(text);
          handleSearchAndFilter(text, filterStatus, filterCoachStatus);
        }}
        style={styles.searchbar}
      />

      {/* Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        <Chip
          selected={filterStatus === 'all' && filterCoachStatus === 'all'}
          onPress={() => { setFilterStatus('all'); setFilterCoachStatus('all'); handleSearchAndFilter(searchQuery, 'all', 'all'); }}
          style={styles.chip}
        >
          All Users
        </Chip>
        <Chip
          selected={filterStatus === 'active'}
          onPress={() => { setFilterStatus('active'); handleSearchAndFilter(searchQuery, 'active', filterCoachStatus); }}
          style={styles.chip}
        >
          Active
        </Chip>
        <Chip
          selected={filterStatus === 'inactive'}
          onPress={() => { setFilterStatus('inactive'); handleSearchAndFilter(searchQuery, 'inactive', filterCoachStatus); }}
          style={styles.chip}
        >
          Suspended
        </Chip>
        <Chip
          selected={filterCoachStatus === 'assigned'}
          onPress={() => { setFilterCoachStatus('assigned'); handleSearchAndFilter(searchQuery, filterStatus, 'assigned'); }}
          style={styles.chip}
        >
          Assigned
        </Chip>
        <Chip
          selected={filterCoachStatus === 'unassigned'}
          onPress={() => { setFilterCoachStatus('unassigned'); handleSearchAndFilter(searchQuery, filterStatus, 'unassigned'); }}
          style={styles.chip}
        >
          Unassigned
        </Chip>
      </ScrollView>

      {/* Sort Bar */}
      <View style={styles.sortBar}>
        <Text style={[styles.sortLabel, { color: theme.colors.onSurfaceVariant }]}>
          Showing {sortedUsers.length} users • Sort by:
        </Text>
        <View style={styles.sortBtns}>
          <TouchableOpacity onPress={() => setSortBy('score')}>
            <Text style={[styles.sortOpt, sortBy === 'score' && styles.sortActive]}>Score</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSortBy('name')}>
            <Text style={[styles.sortOpt, sortBy === 'name' && styles.sortActive]}>Name</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSortBy('streak')}>
            <Text style={[styles.sortOpt, sortBy === 'streak' && styles.sortActive]}>Streak</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={sortedUsers}
        keyExtractor={(item) => item.id}
        renderItem={renderUserItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant }}>
              No registered users found matching current filters.
            </Text>
          </View>
        }
      />

      <CoachAssignmentModal
        visible={modalVisible}
        user={selectedUserForAssign}
        coaches={detailedCoaches}
        onDismiss={() => setModalVisible(false)}
        onAssign={handleAssignCoachSubmit}
        onRemove={handleRemoveCoachSubmit}
      />

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
  searchbar: {
    marginBottom: 10,
    borderRadius: 12,
  },
  chipRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  chip: {
    marginRight: 8,
  },
  sortBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sortLabel: {
    fontSize: 12,
  },
  sortBtns: {
    flexDirection: 'row',
  },
  sortOpt: {
    fontSize: 12,
    marginLeft: 12,
    color: '#64748B',
  },
  sortActive: {
    color: '#2563EB',
    fontWeight: 'bold',
  },
  list: {
    paddingBottom: 40,
  },
  card: {
    marginBottom: 14,
    borderRadius: 18,
    elevation: 2,
  },
  cardContent: {
    paddingVertical: 12,
  },
  mainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  email: {
    fontSize: 13,
    marginTop: 2,
  },
  metaText: {
    fontSize: 11,
    marginTop: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F8FAFC',
    paddingVertical: 8,
    borderRadius: 12,
    marginVertical: 10,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricVal: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  metricSub: {
    fontSize: 10,
    color: '#64748B',
  },
  coachBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  coachInfo: {
    flex: 1,
  },
  assignBtn: {
    borderRadius: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
});

export default UserManagementScreen;
