import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Card, useTheme } from 'react-native-paper';

interface AppCardProps {
  children: React.ReactNode;
  style?: any;
  onPress?: () => void;
}

export const AppCard: React.FC<AppCardProps> = ({ children, style, onPress }) => {
  const theme = useTheme();

  return (
    <Card
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline,
        },
        style,
      ]}
    >
      <Card.Content style={styles.content}>{children}</Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginVertical: 8,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  content: {
    padding: 16,
  },
});

export default AppCard;
