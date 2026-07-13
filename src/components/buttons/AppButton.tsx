import { TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import AppText from "../common/AppText";

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "outline";
}

export default function AppButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === "outline" && styles.outlineButton,
        isDisabled && styles.disabledButton,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "outline" ? "#2563EB" : "#FFFFFF"}
        />
      ) : (
        <AppText
          style={[styles.text, variant === "outline" && styles.outlineText]}
        >
          {title}
        </AppText>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#2563EB",
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#2563EB",
  },

  disabledButton: {
    opacity: 0.6,
  },

  text: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  outlineText: {
    color: "#2563EB",
  },
});
