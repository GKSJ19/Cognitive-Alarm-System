export interface DirectMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  is_read: boolean;
  read_at?: string | null;
  deleted_by_sender: boolean;
  deleted_by_receiver: boolean;
  created_at: string;
}

export interface ChatUserSimple {
  id: string;
  full_name: string;
  email: string;
  role: string;
  profile_picture?: string | null;
  is_online: boolean;
}


export interface Conversation {
  other_user: ChatUserSimple;
  last_message?: DirectMessage | null;
  unread_count: number;
  updated_at: string;
}

export interface Contact {
  id: string;
  full_name: string;
  email: string;
  role: string;
  profile_picture?: string | null;
  relationship: string;
}

export interface ChatState {
  conversations: Conversation[];
  availableContacts: Contact[];
  activeMessages: DirectMessage[];
  activeChatUser: ChatUserSimple | null;
  unreadTotal: number;
  isTyping: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface MessageCreateReq {
  receiver_id: string;
  message: string;
}
