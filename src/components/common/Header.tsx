import { View, StyleSheet } from "react-native";

import AppText from "./AppText";

import { Spacing } from "@/theme";

interface Props {
  title: string;
  subtitle?: string;
}

export default function Header({
  title,
  subtitle,
}: Props) {
  return (
    <View style={styles.container}>
      <AppText variant="title">
        {title}
      </AppText>

      {subtitle && (
        <AppText
          variant="caption"
          style={styles.subtitle}>
          {subtitle}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.lg,
  },

  subtitle: {
    marginTop: 6,
  },
});