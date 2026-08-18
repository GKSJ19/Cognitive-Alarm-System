import React, { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, Alert, Platform, TouchableOpacity, ScrollView } from 'react-native';
import { Text, useTheme, Card, Avatar, Button, IconButton, Searchbar, Snackbar, Chip } from 'react-native-paper';
import { useAdmin } from '../../hooks/useAdmin';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import CoachAssignmentModal from '../../components/admin/CoachAssignmentModal';
import ThemeBackground from '../../components/common/ThemeBackground';

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
      setSnackbarMessage("Coach unassigned successfully");
    } catch (err) {
      setSnackbarMessage("Failed to unassign coach");
    }
  };

  const performToggleStatus = async (user: any) => {
    const isCurrentlyActive = user.account_status?.toLowerCase() === "active";
    const shouldSuspend = isCurrentlyActive;
    try {
      await toggleStatus(user.id, shouldSuspend);
      setSnackbarMessage(`User account ${shouldSuspend ? "suspended" : "activated"} successfully.`);
      getDetailedUsers(searchQuery, filterStatus, filterCoachStatus);
    } catch (err) {
      setSnackbarMessage("Failed to update user status.");
    }
  };

  const handleToggleStatus = (user: any) => {
    const isCurrentlyActive = user.account_status?.toLowerCase() === "active";
    const actionName = isCurrentlyActive ? "Suspend" : "Activate";
    const actionMsg = isCurrentlyActive
      ? `Are you sure you want to suspend ${user.full_name}'s account? They will be unable to log in until reactivated.`
      : `Are you sure you want to reactivate ${user.full_name}'s account?`;

    if (Platform.OS === 'web') {
      if (window.confirm(actionMsg)) {
        performToggleStatus(user);
      }
    } else {
      Alert.alert(
        `${actionName} User Account`,
        actionMsg,
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: actionName, 
            style: isCurrentlyActive ? "destructive" : "default", 
            onPress: () => performToggleStatus(user) 
          }
        ]
      );
    }
  };

  const performDelete = async (userId: string) => {
    try {
      await deleteUser(userId);
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
    const initials = item.full_name ? item.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U';
    const isActive = item.account_status?.toLowerCase() === "active";

    return (
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <TouchableOpacity 
            style={styles.mainInfo} 
            onPress={() => navigation.navigate('AdminUserAnalytics', { userId: item.id })}
          >
            <Avatar.Text size={44} label={initials} style={{ backgroundColor: '#A58BFF' }} color="#0D0B14" />
            <View style={styles.headerInfo}>
              <View style={styles.nameRow}>
                <Text style={[styles.name, { color: '#FFFFFF' }]}>{item.full_name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: isActive ? '#1A382B' : '#451A1A' }]}>
                  <Text style={{ color: isActive ? '#34D399' : '#F87171', fontSize: 10, fontWeight: 'bold' }}>
                    {item.account_status.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={[styles.email, { color: '#A098BA' }]}>
                {item.email} {item.phone_number ? `• ${item.phone_number}` : ''}
              </Text>
              <Text style={[styles.metaText, { color: '#6D6586' }]}>
                Registered: {item.registration_date} • Last Login: {item.last_login}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Metrics Row */}
          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={[styles.metricVal, { color: '#A58BFF' }]}>{item.current_habit_score.toFixed(1)}</Text>
              <Text style={styles.metricSub}>Habit Score</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricVal, { color: '#B49BFF' }]}>{item.current_streak}d</Text>
              <Text style={styles.metricSub}>Streak</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricVal, { color: '#34D399' }]}>{item.success_rate}%</Text>
              <Text style={styles.metricSub}>Success Rate</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricVal, { color: '#FBBF24' }]}>{item.average_completion_time}s</Text>
              <Text style={styles.metricSub}>Avg Time</Text>
            </View>
          </View>

          {/* Coach Assignment Info Bar */}
          <View style={styles.coachBar}>
            <View style={styles.coachInfo}>
              <Text style={{ fontSize: 12, color: '#A098BA' }}>
                Assigned Coach: <Text style={{ fontWeight: 'bold', color: item.assigned_coach ? '#A58BFF' : '#F87171' }}>
                  {item.assigned_coach ? item.assigned_coach.full_name : 'Unassigned'}
                </Text>
              </Text>
            </View>
            <Button
              mode="outlined"
              compact
              onPress={() => openAssignModal(item)}
              style={styles.assignBtn}
              textColor="#A58BFF"
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
              buttonColor="#2C2243"
              textColor="#A58BFF"
            >
              Analytics
            </Button>
            <IconButton
              icon={isActive ? "account-off" : "account-check"}
              iconColor={isActive ? "#F87171" : '#34D399'}
              size={22}
              onPress={() => handleToggleStatus(item)}
            />
            <IconButton
              icon="delete"
              iconColor="#F87171"
              size={22}
              onPress={() => handleDeleteUser(item.id)}
            />
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <ThemeBackground>
      <View style={styles.container}>
        <LoadingOverlay visible={isLoading && !detailedUsers} />

        <Searchbar
          placeholder="Search users by name or email..."
          placeholderTextColor="#A098BA"
          iconColor="#A58BFF"
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            handleSearchAndFilter(text, filterStatus, filterCoachStatus);
          }}
          style={styles.searchbar}
          inputStyle={{ fontSize: 14, color: '#FFFFFF' }}
        />

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          <Chip
            selected={filterStatus === 'all' && filterCoachStatus === 'all'}
            onPress={() => { setFilterStatus('all'); setFilterCoachStatus('all'); handleSearchAndFilter(searchQuery, 'all', 'all'); }}
            style={styles.chip}
            selectedColor="#0D0B14"
            textStyle={{ color: filterStatus === 'all' && filterCoachStatus === 'all' ? '#0D0B14' : '#A098BA' }}
          >
            All Users
          </Chip>
          <Chip
            selected={filterStatus === 'active'}
            onPress={() => { setFilterStatus('active'); handleSearchAndFilter(searchQuery, 'active', filterCoachStatus); }}
            style={styles.chip}
            selectedColor="#0D0B14"
            textStyle={{ color: filterStatus === 'active' ? '#0D0B14' : '#A098BA' }}
          >
            Active
          </Chip>
          <Chip
            selected={filterStatus === 'inactive'}
            onPress={() => { setFilterStatus('inactive'); handleSearchAndFilter(searchQuery, 'inactive', filterCoachStatus); }}
            style={styles.chip}
            selectedColor="#0D0B14"
            textStyle={{ color: filterStatus === 'inactive' ? '#0D0B14' : '#A098BA' }}
          >
            Suspended
          </Chip>
          <Chip
            selected={filterCoachStatus === 'assigned'}
            onPress={() => { setFilterCoachStatus('assigned'); handleSearchAndFilter(searchQuery, filterStatus, 'assigned'); }}
            style={styles.chip}
            selectedColor="#0D0B14"
            textStyle={{ color: filterCoachStatus === 'assigned' ? '#0D0B14' : '#A098BA' }}
          >
            Assigned
          </Chip>
          <Chip
            selected={filterCoachStatus === 'unassigned'}
            onPress={() => { setFilterCoachStatus('unassigned'); handleSearchAndFilter(searchQuery, filterStatus, 'unassigned'); }}
            style={styles.chip}
            selectedColor="#0D0B14"
            textStyle={{ color: filterCoachStatus === 'unassigned' ? '#0D0B14' : '#A098BA' }}
          >
            Unassigned
          </Chip>
        </ScrollView>

        {/* Sort Bar */}
        <View style={styles.sortBar}>
          <Text style={[styles.sortLabel, { color: '#A098BA' }]}>
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
              <Text style={{ textAlign: 'center', color: '#A098BA' }}>
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
          style={{ backgroundColor: error ? theme.colors.error : '#A58BFF' }}
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
    padding: 16,
  },
  searchbar: {
    marginBottom: 10,
    borderRadius: 14,
    backgroundColor: '#262036',
    borderWidth: 1,
    borderColor: 'rgba(165, 139, 255, 0.15)',
  },
  chipRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  chip: {
    marginRight: 8,
    backgroundColor: '#262036',
    borderWidth: 1,
    borderColor: 'rgba(165, 139, 255, 0.15)',
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
    color: '#A098BA',
  },
  sortActive: {
    color: '#A58BFF',
    fontWeight: 'bold',
  },
  list: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: 'rgba(26, 22, 38, 0.85)',
    marginBottom: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(165, 139, 255, 0.15)',
    elevation: 4,
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
    backgroundColor: '#262036',
    paddingVertical: 8,
    borderRadius: 14,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(165, 139, 255, 0.1)',
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
    color: '#A098BA',
  },
  coachBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(165, 139, 255, 0.1)',
  },
  coachInfo: {
    flex: 1,
  },
  assignBtn: {
    borderRadius: 12,
    borderColor: '#A58BFF',
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
