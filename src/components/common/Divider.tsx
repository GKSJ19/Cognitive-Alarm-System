import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";

export default function Divider() {
  return (
    <View style={styles.container}>
      <View style={styles.line} />

      <Text style={styles.text}>
        OR
      </Text>

      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#D1D5DB",
  },

  text: {
    marginHorizontal: 12,
    color: "#6B7280",
    fontWeight: "600",
  },

});