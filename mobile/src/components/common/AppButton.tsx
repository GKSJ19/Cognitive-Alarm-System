import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Button } from 'react-native-paper';
import { useTheme } from 'react-native-paper';

interface AppButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  mode?: 'contained' | 'outlined' | 'text';
  loading?: boolean;
  disabled?: boolean;
  style?: any;
  icon?: string;
  textColor?: string;
  buttonColor?: string;
}

export const AppButton: React.FC<AppButtonProps> = ({
  onPress,
  children,
  mode = 'contained',
  loading = false,
  disabled = false,
  style,
  icon,
  textColor,
  buttonColor,
}) => {
  const theme = useTheme();

  return (
    <Button
      mode={mode}
      onPress={onPress}
      loading={loading}
      disabled={disabled || loading}
      icon={icon}
      textColor={textColor}
      buttonColor={buttonColor}
      style={[
        styles.button,
        mode === 'contained' && !buttonColor && { backgroundColor: theme.colors.primary },
        style,
      ]}
      contentStyle={styles.content}
      labelStyle={styles.label}
    >
      {children}
    </Button>
  );
};

const styles = StyleSheet.create({
  button: {
    marginVertical: 8,
    borderRadius: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
  },
  content: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

export default AppButton;
