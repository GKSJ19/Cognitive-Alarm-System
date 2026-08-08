import { Text, TextProps, TextStyle } from "react-native";

import { Typography } from "@/theme";
import { useAppTheme } from "@/hooks/useAppTheme";

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
  const { colors } = useAppTheme();

  return (
    <Text
      {...props}
      style={[
        typography[variant] as TextStyle,
        {
          color: colors.text,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}