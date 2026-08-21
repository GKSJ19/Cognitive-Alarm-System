import { TextInput, StyleSheet, TextInputProps } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

export default function AppInput(props: TextInputProps) {
  const { colors } = useAppTheme();

  return (
    <TextInput
      {...props}
      style={[
        styles.input,
        {
          borderColor: colors.border,
          backgroundColor: colors.surface,
          color: colors.text,
        },
        props.style,
      ]}
      placeholderTextColor={colors.textSecondary}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginVertical: 8,
    fontSize: 16,
  },
});
