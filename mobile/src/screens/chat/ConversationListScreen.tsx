import React, { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, useTheme, Card, Avatar, Badge, FAB, Modal, Portal, IconButton, Searchbar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchConversations, fetchAvailableContacts, setActiveChatUser } from '../../store/slices/chatSlice';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import ThemeBackground from '../../components/common/ThemeBackground';
import { Conversation, Contact } from '../../types/chat.types';

interface ConversationListScreenProps {
  navigation: any;
}

export const ConversationListScreen: React.FC<ConversationListScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const userRole = currentUser?.role || 'user';
  const { conversations, availableContacts, unreadTotal, isLoading } = useSelector((state: RootState) => state.chat);

  const [searchQuery, setSearchQuery] = useState('');
  const [isContactsModalVisible, setIsContactsModalVisible] = useState(false);

  useEffect(() => {
    dispatch(fetchConversations());
    dispatch(fetchAvailableContacts());
  }, [dispatch]);

  const onRefresh = () => {
    dispatch(fetchConversations());
    dispatch(fetchAvailableContacts());
  };

  const handleSelectConversation = (conv: Conversation) => {
    dispatch(setActiveChatUser(conv.other_user));
    navigation.navigate('ChatDetail', { otherUser: conv.other_user });
  };

  const handleStartNewChat = (contact: Contact) => {
    setIsContactsModalVisible(false);
    const chatUser = {
      id: contact.id,
      full_name: contact.full_name,
      email: contact.email,
      role: contact.role,
      profile_picture: contact.profile_picture,
      is_online: true,
    };
    dispatch(setActiveChatUser(chatUser));
    navigation.navigate('ChatDetail', { otherUser: chatUser });
  };

  const filteredConversations = conversations.filter(c =>
    c.other_user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.other_user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderConversationItem = ({ item }: { item: Conversation }) => {
    const formattedTime = item.last_message?.created_at
      ? new Date(item.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '';

    const initials = item.other_user.full_name ? item.other_user.full_name.substring(0, 2).toUpperCase() : 'DM';

    return (
      <TouchableOpacity activeOpacity={0.85} onPress={() => handleSelectConversation(item)}>
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.avatarContainer}>
              <Avatar.Text size={48} label={initials} style={{ backgroundColor: '#A58BFF' }} color="#0D0B14" />
              {item.other_user.is_online && <View style={styles.onlineDot} />}
            </View>

            <View style={styles.infoCol}>
              <View style={styles.nameRow}>
                <Text style={styles.nameText}>{item.other_user.full_name}</Text>
                <Text style={styles.roleTag}>{item.other_user.role.toUpperCase()}</Text>
                <Text style={styles.timeText}>{formattedTime}</Text>
              </View>

              <View style={styles.msgRow}>
                <Text style={[styles.snippetText, item.unread_count > 0 && styles.unreadSnippet]} numberOfLines={1}>
                  {item.last_message?.message || 'No messages yet...'}
                </Text>
                {item.unread_count > 0 && (
                  <Badge style={styles.badge}>{item.unread_count}</Badge>
                )}
              </View>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <ThemeBackground>
      <View style={styles.container}>
        <LoadingOverlay visible={isLoading && conversations.length === 0} message="Loading messages..." />

        <View style={styles.searchHeader}>
          <Searchbar
            placeholder="Search conversations..."
            placeholderTextColor="#A098BA"
            iconColor="#A58BFF"
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            inputStyle={{ fontSize: 14, color: '#FFFFFF' }}
          />
        </View>

        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => item.other_user.id}
          renderItem={renderConversationItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor="#A58BFF" />}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <IconButton icon="message-outline" size={60} iconColor="#6D6586" />
              <Text style={styles.emptyTitle}>No Direct Conversations</Text>
              <Text style={styles.emptySub}>Tap the button below to start a 1-on-1 private chat.</Text>
            </View>
          }
        />

        <FAB
          icon="plus"
          label="New Chat"
          style={styles.fab}
          color="#0D0B14"
          onPress={() => setIsContactsModalVisible(true)}
        />

        {/* START NEW CHAT CONTACTS MODAL */}
        <Portal>
          <Modal
            visible={isContactsModalVisible}
            onDismiss={() => setIsContactsModalVisible(false)}
            contentContainerStyle={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Available Contacts</Text>
              <IconButton icon="close" size={24} iconColor="#A098BA" onPress={() => setIsContactsModalVisible(false)} />
            </View>
            <Text style={styles.modalSub}>
              {userRole === 'user'
                ? 'Select your assigned Wellness Coach to start chatting:'
                : userRole === 'coach'
                ? 'Select an assigned Client or Administrator to start chatting:'
                : 'Select a Wellness Coach or User to start chatting:'}
            </Text>

            <FlatList
              data={availableContacts}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity activeOpacity={0.8} onPress={() => handleStartNewChat(item)}>
                  <View style={styles.contactItem}>
                    <Avatar.Text
                      size={40}
                      label={item.full_name ? item.full_name.substring(0, 2).toUpperCase() : 'CU'}
                      style={{ backgroundColor: '#A58BFF' }}
                      color="#0D0B14"
                    />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.contactName}>{item.full_name}</Text>
                      <Text style={styles.contactRole}>{item.email} • {item.relationship.toUpperCase()}</Text>
                    </View>
                    <IconButton icon="chevron-right" size={20} iconColor="#A098BA" />
                  </View>
                </TouchableOpacity>
              )}
              contentContainerStyle={{ paddingVertical: 8 }}
              ListEmptyComponent={
                <Text style={{ textAlign: 'center', color: '#A098BA', marginVertical: 20, paddingHorizontal: 16, lineHeight: 20 }}>
                  {userRole === 'user'
                    ? 'No assigned Wellness Coach found. Please contact an administrator to assign a coach to your account.'
                    : 'No available contacts found.'}
                </Text>
              }
            />
          </Modal>
        </Portal>
      </View>
    </ThemeBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#141021',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(165, 139, 255, 0.12)',
  },
  searchbar: {
    backgroundColor: '#262036',
    borderRadius: 14,
    elevation: 0,
    borderWidth: 1,
    borderColor: 'rgba(165, 139, 255, 0.15)',
    height: 46,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: 'rgba(26, 22, 38, 0.85)',
    borderRadius: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(165, 139, 255, 0.15)',
    elevation: 4,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  avatarContainer: {
    position: 'relative',
  },
  onlineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#34D399',
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: '#1A1626',
  },
  infoCol: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  roleTag: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#A58BFF',
    backgroundColor: '#2C2243',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 6,
  },
  timeText: {
    fontSize: 11,
    color: '#6D6586',
  },
  msgRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  snippetText: {
    fontSize: 13,
    color: '#A098BA',
    flex: 1,
  },
  unreadSnippet: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  badge: {
    backgroundColor: '#A58BFF',
    color: '#0D0B14',
    fontWeight: 'bold',
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: '#A098BA',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 32,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#A58BFF',
    borderRadius: 28,
  },
  modalContent: {
    backgroundColor: '#1A1626',
    margin: 20,
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: 'rgba(165, 139, 255, 0.2)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalSub: {
    fontSize: 13,
    color: '#A098BA',
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(165, 139, 255, 0.1)',
  },
  contactName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  contactRole: {
    fontSize: 12,
    color: '#A098BA',
    marginTop: 2,
  },
});

export default ConversationListScreen;
