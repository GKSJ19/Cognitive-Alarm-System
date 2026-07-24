import React, { useState } from 'react';
import { StyleSheet, View, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { Text, useTheme, Card, Button, Avatar, Searchbar, IconButton } from 'react-native-paper';
import { DetailedCoachCard } from '../../types/admin.types';

interface CoachAssignmentModalProps {
  visible: boolean;
  user: any;
  coaches: DetailedCoachCard[];
  onDismiss: () => void;
  onAssign: (coachId: string, userId: string) => Promise<void>;
  onRemove: (userId: string) => Promise<void>;
}

export const CoachAssignmentModal: React.FC<CoachAssignmentModalProps> = ({
  visible,
  user,
  coaches,
  onDismiss,
  onAssign,
  onRemove,
}) => {
  const theme = useTheme();
  const [search, setSearch] = useState('');

  if (!user) return null;

  const filteredCoaches = (coaches || []).filter(c =>
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <View style={[styles.overlay, { backgroundColor: 'rgba(15, 23, 42, 0.75)' }]}>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.colors.onSurface }]}>Assign Coach</Text>
              <IconButton icon="close" size={24} onPress={onDismiss} />
            </View>

            <Text style={[styles.sub, { color: theme.colors.onSurfaceVariant }]}>
              Assigning coach for <Text style={{ fontWeight: 'bold', color: theme.colors.primary }}>{user.full_name}</Text>
            </Text>

            {user.assigned_coach ? (
              <View style={[styles.currentBox, { backgroundColor: '#F1F5F9' }]}>
                <Text style={{ fontSize: 12, color: '#64748B' }}>Currently Assigned To:</Text>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: theme.colors.onSurface }}>
                  {user.assigned_coach.full_name} ({user.assigned_coach.email})
                </Text>
                <Button
                  mode="text"
                  compact
                  textColor={theme.colors.error}
                  onPress={() => onRemove(user.id)}
                  style={{ alignSelf: 'flex-start', marginTop: 4 }}
                >
                  Remove Assignment
                </Button>
              </View>
            ) : null}

            <Searchbar
              placeholder="Search coach..."
              value={search}
              onChangeText={setSearch}
              style={styles.search}
            />

            <ScrollView style={{ maxHeight: 260 }}>
              {filteredCoaches.length === 0 ? (
                <Text style={{ textAlign: 'center', marginVertical: 20, color: theme.colors.onSurfaceVariant }}>
                  No coaches available. Create a coach account first.
                </Text>
              ) : (
                filteredCoaches.map(c => {
                  const isCurrent = user.assigned_coach?.id === c.id;
                  const initials = c.full_name.split(' ').map(n => n[0]).join('').toUpperCase();

                  return (
                    <TouchableOpacity
                      key={c.id}
                      style={[
                        styles.coachItem,
                        { backgroundColor: isCurrent ? '#DBEAFE' : '#F8FAFC' }
                      ]}
                      onPress={() => onAssign(c.id, user.id)}
                    >
                      <Avatar.Text size={36} label={initials} style={{ backgroundColor: theme.colors.primary }} />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 14, color: theme.colors.onSurface }}>
                          {c.full_name}
                        </Text>
                        <Text style={{ fontSize: 12, color: theme.colors.onSurfaceVariant }}>
                          {c.email} • {c.assigned_users_count} clients
                        </Text>
                      </View>
                      <Button
                        mode={isCurrent ? "outlined" : "contained"}
                        compact
                        onPress={() => onAssign(c.id, user.id)}
                      >
                        {isCurrent ? "Assigned" : "Assign"}
                      </Button>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </Card.Content>
        </Card>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    borderRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  sub: {
    fontSize: 13,
    marginBottom: 12,
  },
  currentBox: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  search: {
    marginBottom: 12,
    borderRadius: 12,
  },
  coachItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
  },
});

export default CoachAssignmentModal;
