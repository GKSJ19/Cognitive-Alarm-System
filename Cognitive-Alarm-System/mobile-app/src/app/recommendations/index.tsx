import { ScrollView, View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Screen from "@/components/common/Screen";
import Header from "@/components/common/Header";
import Card from "@/components/cards/Card";
import AppText from "@/components/common/AppText";

import { useAppTheme } from "@/hooks/useAppTheme";
import { RECOMMENDATIONS } from "@/data/mock/recommendations";

export default function RecommendationFeedScreen() {
  const { colors, spacing, radius } = useAppTheme();

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <Header title="For You" subtitle="Personalized recommendations" />

        {RECOMMENDATIONS.map((rec) => (
          <Card key={rec.id} style={{ marginBottom: spacing.md }}>
            <View style={{ flexDirection: "row" }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: radius.md,
                  backgroundColor: colors.primary + "1A",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: spacing.md,
                }}
              >
                <MaterialCommunityIcons name={rec.icon as any} size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="body" style={{ fontWeight: "700" }}>
                  {rec.title}
                </AppText>
                <AppText variant="caption" style={{ color: colors.textSecondary, marginTop: 4 }}>
                  {rec.description}
                </AppText>
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>
    </Screen>
  );
}
