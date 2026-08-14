import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, FlatList, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { Text, useTheme, Card, Avatar, IconButton, TextInput, Chip, Modal, Portal, Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchMessageHistory, sendDirectMessage, deleteMessageForMe, handleIncomingMessage, setTypingState } from '../../store/slices/chatSlice';
import chatService from '../../services/chatService';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import ThemeBackground from '../../components/common/ThemeBackground';
import { DirectMessage, ChatUserSimple } from '../../types/chat.types';

interface ChatDetailScreenProps {
  route: any;
  navigation: any;
}

export const ChatDetailScreen: React.FC<ChatDetailScreenProps> = ({ route, navigation }) => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const { activeMessages, isTyping, isLoading } = useSelector((state: RootState) => state.chat);

  const otherUser: ChatUserSimple = route.params?.otherUser || {
    id: 'demo-user',
    full_name: 'Chat Partner',
    email: 'partner@icap.org',
    role: 'coach',
    is_online: true,
  };

  const [inputMessage, setInputMessage] = useState('');
  const [selectedMsgForAction, setSelectedMsgForAction] = useState<DirectMessage | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const typingTimerRef = useRef<any>(null);

  useEffect(() => {
    dispatch(fetchMessageHistory(otherUser.id));

    // Connect WebSocket listener for real-time messages & typing
    chatService.connectWebSocket((event) => {
      if (event.type === 'NEW_MESSAGE' && event.message) {
        dispatch(handleIncomingMessage(event.message));
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      } else if (event.type === 'USER_TYPING' && event.sender_id === otherUser.id) {
        dispatch(setTypingState(event.is_typing));
      } else if (event.type === 'MESSAGES_READ') {
        dispatch(fetchMessageHistory(otherUser.id));
      }
    });

    return () => {
      chatService.sendTypingIndicator(otherUser.id, false);
    };
  }, [dispatch, otherUser.id]);

  const handleInputChange = (text: string) => {
    setInputMessage(text);

    // Typing indicator signal
    chatService.sendTypingIndicator(otherUser.id, text.length > 0);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      chatService.sendTypingIndicator(otherUser.id, false);
    }, 2000);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const msgToSend = inputMessage.trim();
    setInputMessage('');
    chatService.sendTypingIndicator(otherUser.id, false);

    await dispatch(sendDirectMessage({
      receiver_id: otherUser.id,
      message: msgToSend,
    }));

    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 150);
  };

  const handleDeleteMessage = async () => {
    if (!selectedMsgForAction) return;
    const msgId = selectedMsgForAction.id;
    setSelectedMsgForAction(null);

    await dispatch(deleteMessageForMe(msgId));
  };

  const initials = otherUser.full_name ? otherUser.full_name.substring(0, 2).toUpperCase() : 'DM';

  const renderMessageBubble = ({ item, index }: { item: DirectMessage; index: number }) => {
    const isMe = item.sender_id === currentUser?.id;
    const timeFormatted = item.created_at
      ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '';

    let showDateHeader = false;
    let dateStr = '';
    if (index === 0) {
      showDateHeader = true;
    } else {
      const prevMsg = activeMessages[index - 1];
      const prevDate = prevMsg?.created_at ? new Date(prevMsg.created_at).toDateString() : '';
      const currentDate = item.created_at ? new Date(item.created_at).toDateString() : '';
      if (prevDate !== currentDate) {
        showDateHeader = true;
      }
    }

    if (showDateHeader && item.created_at) {
      const d = new Date(item.created_at);
      const today = new Date();
      if (d.toDateString() === today.toDateString()) {
        dateStr = 'Today';
      } else {
        dateStr = d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
      }
    }

    return (
      <View>
        {showDateHeader && (
          <View style={styles.dateSeparatorRow}>
            <View style={styles.dateBadge}>
              <Text style={styles.dateBadgeText}>{dateStr}</Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          activeOpacity={0.9}
          onLongPress={() => setSelectedMsgForAction(item)}
          style={[
            styles.bubbleRow,
            isMe ? styles.bubbleRowSent : styles.bubbleRowReceived
          ]}
        >
          <View
            style={[
              styles.bubble,
              isMe ? styles.sentBubble : styles.receivedBubble
            ]}
          >
            <Text style={[styles.bubbleText, isMe ? styles.sentText : styles.receivedText]}>
              {item.message}
            </Text>
            <View style={styles.bubbleFooter}>
              <Text style={[styles.timeText, isMe ? styles.sentTime : styles.receivedTime]}>
                {timeFormatted}
              </Text>
              {isMe && (
                <IconButton
                  icon={item.is_read ? 'check-all' : 'check'}
                  size={14}
                  iconColor={item.is_read ? '#0D0B14' : '#2C2243'}
                  style={{ margin: 0, padding: 0 }}
                />
              )}
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ThemeBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        {/* HEADER BAR */}
        <View style={styles.headerBar}>
          <IconButton icon="arrow-left" size={24} iconColor="#FFFFFF" onPress={() => navigation.goBack()} />
          <Avatar.Text size={40} label={initials} style={{ backgroundColor: '#A58BFF' }} color="#0D0B14" />
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>{otherUser.full_name}</Text>
            <Text style={styles.headerSub}>
              {isTyping ? ' typing...' : (otherUser.is_online ? 'Online' : 'Offline')} • {otherUser.role.toUpperCase()}
            </Text>
          </View>
        </View>

        <LoadingOverlay visible={isLoading && activeMessages.length === 0} message="Loading conversation..." />

        {/* MESSAGES LIST */}
        <FlatList
          ref={flatListRef}
          data={activeMessages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageBubble}
          contentContainerStyle={styles.messagesContainer}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <IconButton icon="shield-lock-outline" size={50} iconColor="#A58BFF" />
              <Text style={styles.emptyTitle}>End-to-End Encrypted Chat</Text>
              <Text style={styles.emptySub}>
                Direct Messages between {currentUser?.role === 'admin' ? 'Administrators' : 'Coaches'} and participants are stored securely. Say hello! 👋
              </Text>
            </View>
          }
        />

        {/* TYPING INDICATOR ANNOUNCER */}
        {isTyping && (
          <View style={styles.typingContainer}>
            <Text style={styles.typingText}>{otherUser.full_name} is typing...</Text>
          </View>
        )}

        {/* INPUT BAR */}
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Type a message..."
            placeholderTextColor="#A098BA"
            textColor="#FFFFFF"
            value={inputMessage}
            onChangeText={handleInputChange}
            mode="outlined"
            outlineColor="rgba(165, 139, 255, 0.2)"
            activeOutlineColor="#A58BFF"
            style={styles.textInput}
            multiline
          />
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSendMessage}
            disabled={!inputMessage.trim()}
            style={[
              styles.sendBtn,
              { backgroundColor: inputMessage.trim() ? '#A58BFF' : '#262036' }
            ]}
          >
            <IconButton icon="send" size={20} iconColor={inputMessage.trim() ? '#0D0B14' : '#6D6586'} style={{ margin: 0 }} />
          </TouchableOpacity>
        </View>

        {/* DELETE MESSAGE FOR ME MODAL */}
        <Portal>
          <Modal
            visible={!!selectedMsgForAction}
            onDismiss={() => setSelectedMsgForAction(null)}
            contentContainerStyle={styles.actionModal}
          >
            <Text style={styles.actionTitle}>Message Options</Text>
            <Text style={styles.actionSub}>"{selectedMsgForAction?.message}"</Text>
            
            <Button
              mode="contained"
              buttonColor="#F87171"
              textColor="#FFFFFF"
              icon="delete-outline"
              onPress={handleDeleteMessage}
              style={{ borderRadius: 16, marginTop: 16 }}
            >
              Delete for Me
            </Button>

            <Button
              mode="outlined"
              onPress={() => setSelectedMsgForAction(null)}
              textColor="#A58BFF"
              style={{ borderRadius: 16, marginTop: 8 }}
            >
              Cancel
            </Button>
          </Modal>
        </Portal>
      </KeyboardAvoidingView>
    </ThemeBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
    backgroundColor: '#141021',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(165, 139, 255, 0.12)',
  },
  headerInfo: {
    marginLeft: 10,
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerSub: {
    fontSize: 12,
    color: '#A58BFF',
    fontWeight: '600',
  },
  messagesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 20,
  },
  dateSeparatorRow: {
    alignItems: 'center',
    marginVertical: 12,
  },
  dateBadge: {
    backgroundColor: '#2C2243',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(165, 139, 255, 0.15)',
  },
  dateBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A58BFF',
  },
  bubbleRow: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  bubbleRowSent: {
    justifyContent: 'flex-end',
  },
  bubbleRowReceived: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '78%',
    padding: 14,
    borderRadius: 18,
    elevation: 2,
  },
  sentBubble: {
    backgroundColor: '#A58BFF',
    borderBottomRightRadius: 4,
  },
  receivedBubble: {
    backgroundColor: 'rgba(26, 22, 38, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(165, 139, 255, 0.15)',
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 20,
  },
  sentText: {
    color: '#0D0B14',
    fontWeight: '600',
  },
  receivedText: {
    color: '#FFFFFF',
  },
  bubbleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  timeText: {
    fontSize: 10,
  },
  sentTime: {
    color: '#2C2243',
  },
  receivedTime: {
    color: '#A098BA',
  },
  typingContainer: {
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  typingText: {
    fontSize: 12,
    color: '#A58BFF',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#141021',
    borderTopWidth: 1,
    borderTopColor: 'rgba(165, 139, 255, 0.12)',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#262036',
    maxHeight: 100,
    borderRadius: 20,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  emptySub: {
    fontSize: 13,
    color: '#A098BA',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 32,
  },
  actionModal: {
    backgroundColor: '#1A1626',
    margin: 24,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(165, 139, 255, 0.2)',
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  actionSub: {
    fontSize: 14,
    color: '#A098BA',
    marginTop: 6,
    fontStyle: 'italic',
  },
});

export default ChatDetailScreen;
