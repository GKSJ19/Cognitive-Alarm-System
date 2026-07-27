import { useState } from "react";
import { ScrollView, View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Screen from "@/components/common/Screen";
import Header from "@/components/common/Header";
import Card from "@/components/cards/Card";
import AppInput from "@/components/forms/AppInput";
import AppButton from "@/components/buttons/AppButton";
import AppText from "@/components/common/AppText";

import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuthStore } from "@/store/authStore";

export default function AccountSettingsScreen() {
  const { colors, spacing } = useAppTheme();
  const user = useAuthStore((state) => state.user);
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [saved, setSaved] = useState(false);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <Header title="Account Settings" />

        <Card>
          <AppText variant="body" style={{ color: colors.textSecondary, marginBottom: spacing.xs }}>Full Name</AppText>
          <AppInput value={fullName} onChangeText={(v) => { setFullName(v); setSaved(false); }} placeholder="Full name" />

          <AppText variant="body" style={{ color: colors.textSecondary, marginTop: spacing.md, marginBottom: spacing.xs }}>Email</AppText>
          <AppInput value={email} onChangeText={(v) => { setEmail(v); setSaved(false); }} placeholder="Email" keyboardType="email-address" autoCapitalize="none" />
        </Card>

        <View style={{ marginTop: spacing.lg }}>
          <AppButton title={saved ? "Saved ✓" : "Save Changes"} onPress={() => setSaved(true)} />
        </View>
      </ScrollView>
    </Screen>
  );
}
