import React from 'react';
import ConversationListScreen from '../chat/ConversationListScreen';

export const MessagesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  return <ConversationListScreen navigation={navigation} />;
};

export default MessagesScreen;
