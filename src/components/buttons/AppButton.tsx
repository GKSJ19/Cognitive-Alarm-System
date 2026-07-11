import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  GestureResponderEvent,
} from "react-native";

interface AppButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  disabled?: boolean;
}

export default function AppButton({
  title,
  onPress,
  disabled = false,
}: AppButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    backgroundColor: "#2563EB",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  pressed: {
    opacity: 0.8,
  },

  disabled: {
    backgroundColor: "#93C5FD",
  },

  text: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
});