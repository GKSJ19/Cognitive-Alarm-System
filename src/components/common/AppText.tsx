import { Text, TextProps, TextStyle } from "react-native";

import { Typography, Colors } from "@/theme";

type Variant = "title" | "subtitle" | "body" | "caption";

interface Props extends TextProps {
  variant?: Variant;
}

const typography: Record<Variant, TextStyle | number> = {
  title: Typography.h1,
  subtitle: Typography.h3,
  body: Typography.body,
  caption: Typography.caption,
};

export default function AppText({
  variant = "body",
  style,
  children,
  ...props
}: Props) {
  return (
    <Text
      {...props}
      style={[
        typography[variant] as TextStyle,
        {
          color: Colors.light.text,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}