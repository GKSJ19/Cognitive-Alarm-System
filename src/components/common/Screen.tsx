import { ReactNode } from "react";
import {
  SafeAreaView,
  StyleSheet,
  ViewStyle,
} from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

interface ScreenProps {
  children: ReactNode;
  style?: ViewStyle;
}

export default function Screen({
  children,
  style,
}: ScreenProps) {
  const { colors } = useAppTheme();

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: colors.background },
        style,
      ]}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});