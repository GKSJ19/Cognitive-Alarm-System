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
import * as authApi from "@/services/api/auth.api";
import { ApiError } from "@/services/api/errors";

export default function AccountSettingsScreen() {
  const { colors, spacing } = useAppTheme();
  const user = useAuthStore((state) => state.user);
  const refreshUser = useAuthStore((state) => state.refreshUser);
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setError(null);
    setIsSaving(true);
    try {
      await authApi.updateProfile({ name: fullName.trim() });
      await refreshUser();
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save your changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

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
          <AppInput value={user?.email ?? ""} editable={false} placeholder="Email" keyboardType="email-address" autoCapitalize="none" />
          <AppText variant="caption" style={{ color: colors.textSecondary, marginTop: spacing.xs }}>
            Email can't be changed here — the backend doesn't support editing it yet.
          </AppText>
        </Card>

        <TouchableOpacity onPress={() => router.push("/settings/change-password")} style={{ marginTop: spacing.lg }}>
          <Card style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <AppText variant="body">Change Password</AppText>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />
          </Card>
        </TouchableOpacity>

        {error && (
          <AppText style={{ color: colors.error, marginTop: spacing.md }}>{error}</AppText>
        )}

        <View style={{ marginTop: spacing.lg }}>
          <AppButton
            title={saved ? "Saved ✓" : "Save Changes"}
            onPress={handleSave}
            loading={isSaving}
            disabled={fullName.trim().length === 0}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}