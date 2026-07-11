import React from "react";
import { View, StyleSheet } from "react-native";

import AppText from "../common/AppText";

export default function AppLogo() {
  return (
    <View style={styles.container}>
      <AppText variant="title" style={styles.logo}>
        WakeWise
      </AppText>

      <AppText variant="caption">
        Intelligent Cognitive Alarm Platform
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 40,
  },

  logo: {
    color: "#2563EB",
  },
});