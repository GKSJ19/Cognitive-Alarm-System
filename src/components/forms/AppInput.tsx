import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  Pressable,
  Text,
} from "react-native";

interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  secure?: boolean;
}

export default function AppInput({
  label,
  error,
  secure = false,
  style,
  ...props
}: AppInputProps) {
  const [hidePassword, setHidePassword] = useState(secure);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={styles.inputContainer}>
        <TextInput
          {...props}
          style={[styles.input, style]}
          secureTextEntry={hidePassword}
          placeholderTextColor="#9CA3AF"
        />

        {secure && (
          <Pressable
            onPress={() => setHidePassword(!hidePassword)}
          >
            <Text style={styles.toggle}>
              {hidePassword ? "👁" : "🙈"}
            </Text>
          </Pressable>
        )}
      </View>

      {error ? (
        <Text style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },

  label: {
    fontSize: 15,
    marginBottom: 8,
    color: "#374151",
    fontWeight: "600",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 56,
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
  },

  toggle: {
    fontSize: 20,
  },

  error: {
    color: "#EF4444",
    marginTop: 6,
    fontSize: 13,
  },
});