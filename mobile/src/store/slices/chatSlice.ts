import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ChatState, Conversation, Contact, DirectMessage, ChatUserSimple, MessageCreateReq } from '../../types/chat.types';
import chatService from '../../services/chatService';

const initialState: ChatState = {
  conversations: [],
  availableContacts: [],
  activeMessages: [],
  activeChatUser: null,
  unreadTotal: 0,
  isTyping: false,
  isLoading: false,
  error: null,
};

export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      return await chatService.getConversations();
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch conversations');
    }
  }
);

export const fetchAvailableContacts = createAsyncThunk(
  'chat/fetchAvailableContacts',
  async (_, { rejectWithValue }) => {
    try {
      return await chatService.getAvailableContacts();
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch available contacts');
    }
  }
);

export const fetchMessageHistory = createAsyncThunk(
  'chat/fetchMessageHistory',
  async (otherUserId: string, { rejectWithValue }) => {
    try {
      return await chatService.getMessageHistory(otherUserId);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch message history');
    }
  }
);

export const sendDirectMessage = createAsyncThunk(
  'chat/sendMessage',
  async (data: MessageCreateReq, { rejectWithValue, dispatch }) => {
    try {
      const res = await chatService.sendMessage(data);
      dispatch(fetchConversations());
      return res;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to send message');
    }
  }
);

export const deleteMessageForMe = createAsyncThunk(
  'chat/deleteMessageForMe',
  async (messageId: string, { rejectWithValue }) => {
    try {
      await chatService.deleteMessageForMe(messageId);
      return messageId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to delete message');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveChatUser: (state, action: PayloadAction<ChatUserSimple | null>) => {
      state.activeChatUser = action.payload;
      state.isTyping = false;
    },
    handleIncomingMessage: (state, action: PayloadAction<DirectMessage>) => {
      const newMsg = action.payload;
      // If message is for currently open active chat
      if (state.activeChatUser && (newMsg.sender_id === state.activeChatUser.id || newMsg.receiver_id === state.activeChatUser.id)) {
        state.activeMessages.push(newMsg);
      }
    },
    setTypingState: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload;
    },
    clearChatError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action: PayloadAction<Conversation[]>) => {
        state.isLoading = false;
        state.conversations = action.payload;
        state.unreadTotal = action.payload.reduce((acc, curr) => acc + curr.unread_count, 0);
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchAvailableContacts.fulfilled, (state, action: PayloadAction<Contact[]>) => {
        state.availableContacts = action.payload;
      })
      .addCase(fetchMessageHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMessageHistory.fulfilled, (state, action: PayloadAction<DirectMessage[]>) => {
        state.isLoading = false;
        state.activeMessages = action.payload;
      })
      .addCase(fetchMessageHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(sendDirectMessage.fulfilled, (state, action: PayloadAction<DirectMessage>) => {
        state.activeMessages.push(action.payload);
      })
      .addCase(deleteMessageForMe.fulfilled, (state, action: PayloadAction<string>) => {
        state.activeMessages = state.activeMessages.filter(m => m.id !== action.payload);
      });
  },
});

export const { setActiveChatUser, handleIncomingMessage, setTypingState, clearChatError } = chatSlice.actions;
export default chatSlice.reducer;
