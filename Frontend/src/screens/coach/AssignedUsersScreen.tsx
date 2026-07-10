import React, { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity } from 'react-native';
import { Text, useTheme, Card, Avatar, Searchbar } from 'react-native-paper';
import { useCoach } from '../../hooks/useCoach';
import LoadingOverlay from '../../components/common/LoadingOverlay';

interface AssignedUsersScreenProps {
  navigation: any;
}

export const AssignedUsersScreen: React.FC<AssignedUsersScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { assignedUsers, getUsers, isLoading } = useCoach();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  useEffect(() => {
    if (assignedUsers) {
      setFilteredUsers(
        assignedUsers.filter(u => 
          u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [searchQuery, assignedUsers]);

  const renderUserItem = ({ item }: { item: any }) => {
    const initials = item.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase();

    return (
      <Card 
        style={styles.card}
        onPress={() => navigation.navigate('UserDetails', { userId: item.id, fullName: item.full_name })}
      >
        <Card.Content style={styles.cardContent}>
          <Avatar.Text size={48} label={initials} style={{ backgroundColor: theme.colors.primary }} />
          <View style={styles.info}>
            <Text style={[styles.name, { color: theme.colors.onSurface }]}>{item.full_name}</Text>
            <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 13 }}>{item.email}</Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LoadingOverlay visible={isLoading} />
      
      <Searchbar
        placeholder="Search clients..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={renderUserItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>No assigned clients found.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchbar: {
    marginBottom: 16,
    borderRadius: 12,
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    marginBottom: 12,
    borderRadius: 16,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    marginLeft: 16,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  empty: {
    paddingVertical: 100,
    alignItems: 'center',
  },
});

export default AssignedUsersScreen;
