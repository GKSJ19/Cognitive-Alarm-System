import { TextInput, StyleSheet, TextInputProps } from "react-native";

export default function AppInput(props: TextInputProps) {
  return (
    <TextInput
      {...props}
      style={[styles.input, props.style]}
      placeholderTextColor="#888"
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 16,
    paddingHorizontal: 16,
    marginVertical: 8,
    fontSize: 16,
  },
});