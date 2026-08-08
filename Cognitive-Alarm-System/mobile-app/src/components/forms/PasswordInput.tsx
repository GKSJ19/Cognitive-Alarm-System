import { useState } from "react";
import { View, StyleSheet, TouchableOpacity, TextInputProps } from "react-native";

import AppInput from "./AppInput";
import AppText from "../common/AppText";
import { useAppTheme } from "@/hooks/useAppTheme";

export default function PasswordInput(props: TextInputProps) {
  const [visible, setVisible] = useState(false);
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      <AppInput
        {...props}
        secureTextEntry={!visible}
        autoCapitalize="none"
        style={[styles.input, props.style]}
      />

      <TouchableOpacity
        style={styles.toggle}
        onPress={() => setVisible((prev) => !prev)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <AppText style={[styles.toggleText, { color: colors.primary }]}>
          {visible ? "Hide" : "Show"}
        </AppText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    justifyContent: "center",
  },

  input: {
    paddingRight: 64,
  },

  toggle: {
    position: "absolute",
    right: 16,
  },

  toggleText: {
    color: "#2563EB",
    fontWeight: "600",
    fontSize: 14,
  },
});
