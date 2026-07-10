import React, { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, Alert, Platform } from 'react-native';
import { Text, useTheme, Card, Avatar, Button, IconButton, Searchbar, Snackbar } from 'react-native-paper';
import { useAdmin } from '../../hooks/useAdmin';
import LoadingOverlay from '../../components/common/LoadingOverlay';

export const UserManagementScreen = () => {
  const theme = useTheme();
  const { users, getUsers, toggleStatus, deleteUser, isLoading, error, clearError } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  useEffect(() => {
    if (users) {
      setFilteredUsers(
        users.filter(u => 
          u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [searchQuery, users]);

  const handleToggleStatus = async (user: any) => {
    try {
      await toggleStatus(user.id, user.is_active).unwrap();
      setSnackbarMessage(user.is_active ? "User suspended successfully" : "User activated successfully");
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
      const confirmed = window.confirm("Are you sure you want to permanently delete this user account?");
      if (confirmed) {
        performDelete(userId);
      }
    } else {
      Alert.alert(
        "Delete User",
        "Are you sure you want to permanently delete this user account?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Delete", 
            onPress: () => performDelete(userId),
            style: "destructive"
          }
        ]
      );
    }
  };

  const renderUserItem = ({ item }: { item: any }) => {
    const initials = item.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase();

    return (
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          <Avatar.Text size={42} label={initials} style={{ backgroundColor: theme.colors.secondary }} />
          <View style={styles.info}>
            <Text style={[styles.name, { color: theme.colors.onSurface }]}>{item.full_name}</Text>
            <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 13 }}>{item.email} ({item.role})</Text>
            <View style={[styles.statusBadge, { backgroundColor: item.is_active ? '#22C55E' : '#EF4444', marginTop: 6 }]}>
              <Text style={styles.badgeText}>{item.is_active ? "ACTIVE" : "SUSPENDED"}</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <IconButton 
              icon={item.is_active ? "account-off" : "account-check"} 
              iconColor={item.is_active ? theme.colors.error : '#10B981'}
              size={24}
              onPress={() => handleToggleStatus(item)}
            />
            <IconButton 
              icon="delete" 
              iconColor={theme.colors.error}
              size={24}
              onPress={() => handleDeleteUser(item.id)}
            />
          </View>
        </Card.Content>
      </Card>
    );
  };


  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LoadingOverlay visible={isLoading} />
      
      <Searchbar
        placeholder="Search users..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={renderUserItem}
        contentContainerStyle={styles.list}
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
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  info: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
  },
});

export default UserManagementScreen;
