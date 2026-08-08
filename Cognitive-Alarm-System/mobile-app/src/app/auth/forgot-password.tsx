import { useState } from "react";
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from "react-native";
import { Link, router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import AppText from "@/components/common/AppText";
import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/forms/AppInput";
import PasswordInput from "@/components/forms/PasswordInput";
import ThemeToggleButton from "@/components/common/ThemeToggleButton";
import * as authApi from "@/services/api/auth.api";
import { AuthError } from "@/store/authStore";
import { useAppTheme } from "@/hooks/useAppTheme";

type Step = "request" | "reset";

interface RequestFormValues {
  email: string;
}

interface ResetFormValues {
  code: string;
  newPassword: string;
  confirmPassword: string;
}

const requestSchema = yup.object({
  email: yup
    .string()
    .trim()
    .email("Enter a valid email address")
    .required("Email is required"),
});

const resetSchema = yup.object({
  code: yup
    .string()
    .trim()
    .required("Reset token is required"),
  newPassword: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("New password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword")], "Passwords must match")
    .required("Please confirm your new password"),
});

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { colors } = useAppTheme();

  const requestForm = useForm<RequestFormValues>({
    resolver: yupResolver(requestSchema),
    defaultValues: { email: "" },
  });

  const resetForm = useForm<ResetFormValues>({
    resolver: yupResolver(resetSchema),
    defaultValues: { code: "", newPassword: "", confirmPassword: "" },
  });

  const onRequestSubmit = async (values: RequestFormValues) => {
    setSubmitError(null);
    try {
      const { reset_token } = await authApi.forgotPassword(values.email.trim());
      setEmail(values.email.trim());
      setStep("reset");
      // No email provider is wired up on the backend yet, so the token is
      // surfaced directly here for demo purposes.
      Alert.alert(
        "Reset token generated",
        `For demo purposes (no email service is connected), your reset token is: ${reset_token}`
      );
    } catch (error) {
      setSubmitError(
        error instanceof AuthError
          ? error.message
          : "Something went wrong. Please try again."
      );
    }
  };

  const onResetSubmit = async (values: ResetFormValues) => {
    setSubmitError(null);
    try {
      await authApi.resetPassword(values.code.trim(), values.newPassword);
      Alert.alert("Success", "Your password has been reset.", [
        { text: "Login now", onPress: () => router.replace("/auth/login") },
      ]);
    } catch (error) {
      setSubmitError(
        error instanceof AuthError
          ? error.message
          : "Something went wrong. Please try again."
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ThemeToggleButton style={styles.themeToggle} />

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View>
          <AppText variant="title">Forgot Password 🔒</AppText>

          <AppText variant="body" style={[styles.subtitle, { color: colors.textSecondary }]}>
            {step === "request"
              ? "Enter your email and we'll send you a reset code."
              : `Enter the code we sent for ${email} and choose a new password.`}
          </AppText>
        </View>

        {step === "request" ? (
          <View style={styles.form}>
            <View>
              <Controller
                control={requestForm.control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    placeholder="Email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                )}
              />
              {requestForm.formState.errors.email && (
                <AppText style={[styles.fieldError, { color: colors.error }]}>
                  {requestForm.formState.errors.email.message}
                </AppText>
              )}
            </View>

            {submitError && (
              <AppText style={[styles.formError, { color: colors.error }]}>
                {submitError}
              </AppText>
            )}

            <AppButton
              title="Send Reset Code"
              onPress={requestForm.handleSubmit(onRequestSubmit)}
              loading={requestForm.formState.isSubmitting}
            />
          </View>
        ) : (
          <View style={styles.form}>
            <View>
              <Controller
                control={resetForm.control}
                name="code"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    placeholder="Reset token"
                    autoCapitalize="none"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                )}
              />
              {resetForm.formState.errors.code && (
                <AppText style={[styles.fieldError, { color: colors.error }]}>
                  {resetForm.formState.errors.code.message}
                </AppText>
              )}
            </View>

            <View>
              <Controller
                control={resetForm.control}
                name="newPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <PasswordInput
                    placeholder="New Password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                )}
              />
              {resetForm.formState.errors.newPassword && (
                <AppText style={[styles.fieldError, { color: colors.error }]}>
                  {resetForm.formState.errors.newPassword.message}
                </AppText>
              )}
            </View>

            <View>
              <Controller
                control={resetForm.control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <PasswordInput
                    placeholder="Confirm New Password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                )}
              />
              {resetForm.formState.errors.confirmPassword && (
                <AppText style={[styles.fieldError, { color: colors.error }]}>
                  {resetForm.formState.errors.confirmPassword.message}
                </AppText>
              )}
            </View>

            {submitError && (
              <AppText style={[styles.formError, { color: colors.error }]}>
                {submitError}
              </AppText>
            )}

            <AppButton
              title="Reset Password"
              onPress={resetForm.handleSubmit(onResetSubmit)}
              loading={resetForm.formState.isSubmitting}
            />

            <AppButton
              title="Use a different email"
              variant="outline"
              onPress={() => {
                setSubmitError(null);
                setStep("request");
              }}
            />
          </View>
        )}

        <View style={styles.footer}>
          <AppText>Remember your password? </AppText>

          <Link href="/auth/login" asChild>
            <TouchableOpacity>
              <AppText style={[styles.link, { color: colors.primary }]}>
                Login
              </AppText>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  themeToggle: {
    position: "absolute",
    top: 56,
    right: 24,
    zIndex: 10,
  },

  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },

  subtitle: {
    marginTop: 10,
    marginBottom: 40,
  },

  form: {
    gap: 18,
  },

  fieldError: {
    fontSize: 13,
    marginTop: 4,
    marginLeft: 4,
  },

  formError: {
    fontSize: 14,
    textAlign: "center",
  },

  footer: {
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "center",
  },

  link: {
    fontWeight: "700",
  },
});
