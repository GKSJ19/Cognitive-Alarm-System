import React from "react";
import {
  Text,
  TextProps,
  StyleSheet,
} from "react-native";

type Variant = "title" | "heading" | "body" | "caption";

interface AppTextProps extends TextProps {
  variant?: Variant;
}

export default function AppText({
  variant = "body",
  style,
  children,
  ...props
}: AppTextProps) {
  return (
    <Text
      {...props}
      style={[
        styles[variant],
        style,
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({

  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#111827",
  },

  heading: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111827",
  },

  body: {
    fontSize: 16,
    color: "#374151",
  },

  caption: {
    fontSize: 13,
    color: "#6B7280",
  },

});