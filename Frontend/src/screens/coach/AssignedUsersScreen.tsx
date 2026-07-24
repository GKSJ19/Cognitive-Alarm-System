import React, { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { Text, useTheme, Card, Avatar, Button, Searchbar, Snackbar, Chip } from 'react-native-paper';
import { useCoach } from '../../hooks/useCoach';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import { AssignedUserCard } from '../../types/coach.types';

interface AssignedUsersScreenProps {
  navigation: any;
}

export const AssignedUsersScreen: React.FC<AssignedUsersScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { assignedUserCards, getMyUsers, isLoading, error, clearError } = useCoach();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    getMyUsers(searchQuery, filterStatus);
  }, [getMyUsers]);

  const handleSearchAndFilter = (search: string, status: string) => {
    getMyUsers(search, status);
  };

  const renderUserItem = ({ item }: { item: AssignedUserCard }) => {
    const initials = item.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
    const isActive = item.account_status === "Active";

    return (
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content style={styles.cardContent}>
          <TouchableOpacity
            style={styles.mainInfo}
            onPress={() => navigation.navigate('UserDetails', { userId: item.id })}
          >
            <Avatar.Text size={44} label={initials} style={{ backgroundColor: theme.colors.secondary }} />
            <View style={styles.headerInfo}>
              <View style={styles.nameRow}>
                <Text style={[styles.name, { color: theme.colors.onSurface }]}>{item.full_name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: isActive ? '#DCFCE7' : '#FEE2E2' }]}>
                  <Text style={{ color: isActive ? '#166534' : '#991B1B', fontSize: 10, fontWeight: 'bold' }}>
                    {item.account_status.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={[styles.email, { color: theme.colors.onSurfaceVariant }]}>{item.email}</Text>
              <Text style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>Last Active: {item.last_active}</Text>
            </View>
          </TouchableOpacity>

          {/* Metrics Grid */}
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
              <Text style={[styles.metricVal, { color: '#059669' }]}>{item.total_challenges}</Text>
              <Text style={styles.metricSub}>Total Solves</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricVal, { color: '#D97706' }]}>{item.average_completion_time}s</Text>
              <Text style={styles.metricSub}>Avg Time</Text>
            </View>
          </View>

          <View style={styles.actionsRow}>
            <Button
              mode="contained-tonal"
              compact
              icon="chart-box-outline"
              onPress={() => navigation.navigate('UserDetails', { userId: item.id })}
            >
              View Client Progress
            </Button>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LoadingOverlay visible={isLoading && !assignedUserCards} />

      <Searchbar
        placeholder="Search assigned clients..."
        value={searchQuery}
        onChangeText={(text) => {
          setSearchQuery(text);
          handleSearchAndFilter(text, filterStatus);
        }}
        style={styles.searchbar}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        <Chip
          selected={filterStatus === 'all'}
          onPress={() => { setFilterStatus('all'); handleSearchAndFilter(searchQuery, 'all'); }}
          style={styles.chip}
        >
          All Assigned Clients
        </Chip>
        <Chip
          selected={filterStatus === 'active'}
          onPress={() => { setFilterStatus('active'); handleSearchAndFilter(searchQuery, 'active'); }}
          style={styles.chip}
        >
          Active
        </Chip>
        <Chip
          selected={filterStatus === 'inactive'}
          onPress={() => { setFilterStatus('inactive'); handleSearchAndFilter(searchQuery, 'inactive'); }}
          style={styles.chip}
        >
          Inactive
        </Chip>
      </ScrollView>

      <FlatList
        data={assignedUserCards}
        keyExtractor={(item) => item.id}
        renderItem={renderUserItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant }}>
              No assigned clients match your search/filter criteria.
            </Text>
          </View>
        }
      />

      <Snackbar
        visible={!!error}
        onDismiss={clearError}
        action={{ label: 'OK', onPress: clearError }}
        style={{ backgroundColor: theme.colors.error }}
      >
        {error}
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
    marginBottom: 12,
  },
  chip: {
    marginRight: 8,
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
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
});

export default AssignedUsersScreen;
