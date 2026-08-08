import { ReactNode } from "react";
import { View, ViewStyle } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

interface CardProps {
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
  padded?: boolean;
}

/** The single "modern card, rounded corners, beautiful shadow" building block. */
export default function Card({ children, style, padded = true }: CardProps) {
  const { colors, radius, shadows } = useAppTheme();

  return (
    <View
      style={[
        {
          backgroundColor: colors.card,
          borderRadius: radius.lg,
          padding: padded ? 16 : 0,
        },
        shadows.small,
        style,
      ]}
    >
      {children}
    </View>
  );
}
