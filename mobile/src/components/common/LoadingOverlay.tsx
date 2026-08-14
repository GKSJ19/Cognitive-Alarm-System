import React from 'react';
import { StyleSheet, View, Modal } from 'react-native';
import { ActivityIndicator, useTheme, Text } from 'react-native-paper';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ visible, message }) => {
  const theme = useTheme();

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.container}>
        <View style={[styles.innerContainer, { backgroundColor: theme.colors.surface }]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          {message ? (
            <Text style={{ marginTop: 12, color: theme.colors.onSurface, fontSize: 14, fontWeight: '500' }}>
              {message}
            </Text>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)', // Deep dark transparent overlay
  },
  innerContainer: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
  },
});

export default LoadingOverlay;
