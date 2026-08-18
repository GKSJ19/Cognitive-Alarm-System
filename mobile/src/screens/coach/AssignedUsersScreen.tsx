import React, { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { Text, useTheme, Card, Avatar, Button, Searchbar, Snackbar, Chip } from 'react-native-paper';
import { useCoach } from '../../hooks/useCoach';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import ThemeBackground from '../../components/common/ThemeBackground';
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
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <TouchableOpacity
            style={styles.mainInfo}
            onPress={() => navigation.navigate('UserDetails', { userId: item.id })}
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
              <Text style={[styles.email, { color: '#A098BA' }]}>{item.email}</Text>
              <Text style={[styles.metaText, { color: '#6D6586' }]}>Last Active: {item.last_active}</Text>
            </View>
          </TouchableOpacity>

          {/* Metrics Grid */}
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
              <Text style={[styles.metricVal, { color: '#34D399' }]}>{item.total_challenges}</Text>
              <Text style={styles.metricSub}>Challenges</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricVal, { color: '#FBBF24' }]}>{item.average_completion_time}s</Text>
              <Text style={styles.metricSub}>Avg Time</Text>
            </View>
          </View>

          <Button
            mode="contained-tonal"
            compact
            icon="message-text"
            onPress={() => navigation.navigate('ChatDetail', { otherUser: { id: item.id, full_name: item.full_name, email: item.email, role: 'user', is_online: true } })}
            style={{ marginTop: 8, borderRadius: 12 }}
            buttonColor="#2C2243"
            textColor="#A58BFF"
          >
            Direct Message
          </Button>
        </Card.Content>
      </Card>
    );
  };

  return (
    <ThemeBackground>
      <View style={styles.container}>
        <LoadingOverlay visible={isLoading && !assignedUserCards} />

        <Searchbar
          placeholder="Search clients..."
          placeholderTextColor="#A098BA"
          iconColor="#A58BFF"
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            handleSearchAndFilter(text, filterStatus);
          }}
          style={styles.searchbar}
          inputStyle={{ fontSize: 14, color: '#FFFFFF' }}
        />

        {/* Filter Chips */}
        <View style={styles.chipRow}>
          <Chip
            selected={filterStatus === 'all'}
            onPress={() => { setFilterStatus('all'); handleSearchAndFilter(searchQuery, 'all'); }}
            style={styles.chip}
            selectedColor="#0D0B14"
            textStyle={{ color: filterStatus === 'all' ? '#0D0B14' : '#A098BA' }}
          >
            All Clients
          </Chip>
          <Chip
            selected={filterStatus === 'active'}
            onPress={() => { setFilterStatus('active'); handleSearchAndFilter(searchQuery, 'active'); }}
            style={styles.chip}
            selectedColor="#0D0B14"
            textStyle={{ color: filterStatus === 'active' ? '#0D0B14' : '#A098BA' }}
          >
            Active
          </Chip>
          <Chip
            selected={filterStatus === 'inactive'}
            onPress={() => { setFilterStatus('inactive'); handleSearchAndFilter(searchQuery, 'inactive'); }}
            style={styles.chip}
            selectedColor="#0D0B14"
            textStyle={{ color: filterStatus === 'inactive' ? '#0D0B14' : '#A098BA' }}
          >
            Inactive
          </Chip>
        </View>

        <FlatList
          data={assignedUserCards}
          keyExtractor={(item) => item.id}
          renderItem={renderUserItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={{ textAlign: 'center', color: '#A098BA' }}>
                No assigned clients found.
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
    marginBottom: 12,
  },
  chip: {
    marginRight: 8,
    backgroundColor: '#262036',
    borderWidth: 1,
    borderColor: 'rgba(165, 139, 255, 0.15)',
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
  emptyContainer: {
    paddingVertical: 80,
    alignItems: 'center',
  },
});

export default AssignedUsersScreen;
