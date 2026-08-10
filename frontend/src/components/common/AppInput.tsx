import React, { useState } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { TextInput, HelperText, useTheme } from 'react-native-paper';

interface AppInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string | null;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  style?: any;
  placeholder?: string;
  leftIcon?: string;
  multiline?: boolean;
  numberOfLines?: number;
}

export const AppInput: React.FC<AppInputProps> = ({
  label,
  value,
  onChangeText,
  error = null,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  style,
  placeholder,
  leftIcon,
  multiline = false,
  numberOfLines,
}) => {
  const [passwordVisible, setPasswordVisible] = useState(!secureTextEntry);
  const theme = useTheme();

  return (
    <View style={[styles.container, style]}>
      <TextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        error={!!error}
        secureTextEntry={secureTextEntry && !passwordVisible}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        placeholder={placeholder}
        mode="outlined"
        outlineColor={theme.colors.outline}
        activeOutlineColor={theme.colors.primary}
        textColor={theme.colors.onBackground}
        multiline={multiline}
        numberOfLines={numberOfLines}
        style={styles.input}
        left={leftIcon ? <TextInput.Icon icon={leftIcon} color={theme.colors.onSurfaceVariant} /> : undefined}
        right={
          secureTextEntry ? (
            <TextInput.Icon
              icon={passwordVisible ? 'eye-off' : 'eye'}
              color={theme.colors.onSurfaceVariant}
              onPress={() => setPasswordVisible(!passwordVisible)}
            />
          ) : undefined
        }
      />
      {error && (
        <HelperText type="error" visible={!!error} style={styles.errorText}>
          {error}
        </HelperText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    width: '100%',
  },
  input: {
    backgroundColor: '#FFFFFF', // White background matching light surface
  },
  errorText: {
    paddingLeft: 4,
    fontSize: 12,
  },
});

export default AppInput;
