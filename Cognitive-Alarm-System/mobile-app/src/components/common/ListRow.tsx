import { ReactNode } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import AppText from "./AppText";
import { useAppTheme } from "@/hooks/useAppTheme";

interface ListRowProps {
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor?: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onPress?: () => void;
}

export default function ListRow({
  icon,
  iconColor,
  title,
  subtitle,
  right,
  onPress,
}: ListRowProps) {
  const { colors, spacing, radius } = useAppTheme();

  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.row, { paddingVertical: spacing.sm }]}
    >
      {icon && (
        <View
          style={[
            styles.iconWrap,
            {
              backgroundColor: (iconColor ?? colors.primary) + "1A",
              borderRadius: radius.md,
              marginRight: spacing.md,
            },
          ]}
        >
          <MaterialCommunityIcons
            name={icon}
            size={20}
            color={iconColor ?? colors.primary}
          />
        </View>
      )}

      <View style={styles.textWrap}>
        <AppText variant="body">{title}</AppText>
        {subtitle && (
          <AppText variant="caption" style={{ color: colors.textSecondary, marginTop: 2 }}>
            {subtitle}
          </AppText>
        )}
      </View>

      {right}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrap: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: {
    flex: 1,
  },
});
