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
import * as authApi from "@/services/api/auth.api";
import { ApiError } from "@/services/api/errors";

export default function ChangePasswordScreen() {
  const { colors, spacing } = useAppTheme();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const canSubmit = currentPassword.length > 0 && newPassword.length >= 8 && newPassword === confirmPassword;

  const handleSubmit = async () => {
    setError(null);
    setIsSaving(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't change your password. Please try again.");
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

        <Header title="Change Password" />

        <Card>
          <AppText variant="body" style={{ color: colors.textSecondary, marginBottom: spacing.xs }}>
            Current Password
          </AppText>
          <AppInput
            value={currentPassword}
            onChangeText={(v) => { setCurrentPassword(v); setSuccess(false); }}
            placeholder="Current password"
            secureTextEntry
          />

          <AppText variant="body" style={{ color: colors.textSecondary, marginTop: spacing.md, marginBottom: spacing.xs }}>
            New Password
          </AppText>
          <AppInput
            value={newPassword}
            onChangeText={(v) => { setNewPassword(v); setSuccess(false); }}
            placeholder="At least 8 characters"
            secureTextEntry
          />

          <AppText variant="body" style={{ color: colors.textSecondary, marginTop: spacing.md, marginBottom: spacing.xs }}>
            Confirm New Password
          </AppText>
          <AppInput
            value={confirmPassword}
            onChangeText={(v) => { setConfirmPassword(v); setSuccess(false); }}
            placeholder="Re-enter new password"
            secureTextEntry
          />

          <AppText variant="caption" style={{ color: colors.textSecondary, marginTop: spacing.md }}>
            Changing your password will log you out of all other devices.
          </AppText>
        </Card>

        {error && (
          <AppText style={{ color: colors.error, marginTop: spacing.md }}>{error}</AppText>
        )}

        <View style={{ marginTop: spacing.lg }}>
          <AppButton
            title={success ? "Password Changed ✓" : "Change Password"}
            onPress={handleSubmit}
            loading={isSaving}
            disabled={!canSubmit}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}