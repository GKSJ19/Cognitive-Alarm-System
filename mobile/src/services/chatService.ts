import api from './api';
import * as storage from '../utils/storage';
import { ENV } from '../config/env';
import { Conversation, Contact, DirectMessage, MessageCreateReq } from '../types/chat.types';

let ws: WebSocket | null = null;
let wsSubscribers: ((event: any) => void)[] = [];

export const chatService = {
  async getConversations(): Promise<Conversation[]> {
    const response = await api.get<Conversation[]>('/chat/conversations');
    return response.data;
  },

  async getAvailableContacts(): Promise<Contact[]> {
    const response = await api.get<Contact[]>('/chat/available-contacts');
    return response.data;
  },

  async getMessageHistory(otherUserId: string): Promise<DirectMessage[]> {
    const response = await api.get<DirectMessage[]>(`/chat/messages/${otherUserId}`);
    return response.data;
  },

  async sendMessage(data: MessageCreateReq): Promise<DirectMessage> {
    const response = await api.post<DirectMessage>('/chat/messages', data);
    return response.data;
  },

  async deleteMessageForMe(messageId: string): Promise<void> {
    await api.post(`/chat/messages/${messageId}/delete-for-me`);
  },

  async markMessagesRead(otherUserId: string): Promise<void> {
    await api.post(`/chat/messages/${otherUserId}/read`);
  },

  // --- WEBSOCKET CLIENT INTEGRATION ---
  async connectWebSocket(onEvent: (event: any) => void) {
    if (!wsSubscribers.includes(onEvent)) {
      wsSubscribers.push(onEvent);
    }

    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const token = await storage.getItem('icap_access_token');
    if (!token) return;

    const wsUrl = ENV.API_BASE_URL.replace(/^http/, 'ws') + `/chat/ws?token=${token}`;
    
    try {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('Chat WebSocket connection established');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          wsSubscribers.forEach(cb => cb(data));
        } catch (e) {
          console.warn('Failed to parse WebSocket message', e);
        }
      };

      ws.onerror = (err) => {
        console.warn('Chat WebSocket error', err);
      };

      ws.onclose = () => {
        console.log('Chat WebSocket disconnected');
        ws = null;
      };
    } catch (e) {
      console.warn('WebSocket initialization failed', e);
    }
  },

  sendTypingIndicator(receiverId: string, isTyping: boolean) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'TYPING',
        receiver_id: receiverId,
        is_typing: isTyping,
      }));
    }
  },

  disconnectWebSocket() {
    wsSubscribers = [];
    if (ws) {
      ws.close();
      ws = null;
    }
  }
};

export default chatService;
