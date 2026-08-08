import { useState } from "react";
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from "react-native";
import { Link, router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import AppText from "@/components/common/AppText";
import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/forms/AppInput";
import PasswordInput from "@/components/forms/PasswordInput";
import ThemeToggleButton from "@/components/common/ThemeToggleButton";
import { useAuthStore, AuthError } from "@/store/authStore";
import { useAppTheme } from "@/hooks/useAppTheme";

interface RegisterFormValues {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const schema = yup.object({
  fullName: yup
    .string()
    .trim()
    .min(2, "Enter your full name")
    .required("Full name is required"),
  email: yup
    .string()
    .trim()
    .email("Enter a valid email address")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

export default function RegisterScreen() {
  const register = useAuthStore((state) => state.register);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { colors } = useAppTheme();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setSubmitError(null);
    try {
      await register(values.fullName, values.email, values.password);
      router.replace("/onboarding/profile-setup");
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
          <View style={[styles.logoBadge, { backgroundColor: colors.primary }]}>
            <MaterialCommunityIcons name="weather-sunset-up" size={28} color="#FFFFFF" />
          </View>

          <AppText variant="title">Create Account ✨</AppText>

          <AppText variant="body" style={[styles.subtitle, { color: colors.textSecondary }]}>
            Start your journey with WakeWise
          </AppText>
        </View>

        <View style={styles.form}>
          <View>
            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, onBlur, value } }) => (
                <AppInput
                  placeholder="Full Name"
                  autoCapitalize="words"
                  autoComplete="name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            {errors.fullName && (
              <AppText style={[styles.fieldError, { color: colors.error }]}>
                {errors.fullName.message}
              </AppText>
            )}
          </View>

          <View>
            <Controller
              control={control}
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
            {errors.email && (
              <AppText style={[styles.fieldError, { color: colors.error }]}>
                {errors.email.message}
              </AppText>
            )}
          </View>

          <View>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <PasswordInput
                  placeholder="Password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoComplete="password-new"
                />
              )}
            />
            {errors.password && (
              <AppText style={[styles.fieldError, { color: colors.error }]}>
                {errors.password.message}
              </AppText>
            )}
          </View>

          <View>
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <PasswordInput
                  placeholder="Confirm Password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoComplete="password-new"
                />
              )}
            />
            {errors.confirmPassword && (
              <AppText style={[styles.fieldError, { color: colors.error }]}>
                {errors.confirmPassword.message}
              </AppText>
            )}
          </View>

          {submitError && (
            <AppText style={[styles.formError, { color: colors.error }]}>
              {submitError}
            </AppText>
          )}

          <AppButton
            title="Create Account"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
          />

          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <AppText style={[styles.dividerText, { color: colors.textSecondary }]}>
              OR
            </AppText>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          <TouchableOpacity
            style={[
              styles.googleButton,
              { borderColor: colors.border, backgroundColor: colors.surface },
            ]}
            activeOpacity={0.8}
            onPress={() =>
              // No Google OAuth backend is wired up yet — UI only.
              Alert.alert("Google Sign-In", "Google Sign-In isn't connected yet.")
            }
          >
            <MaterialCommunityIcons name="google" size={20} color="#DB4437" />
            <AppText style={styles.googleButtonText}>Continue with Google</AppText>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <AppText>Already have an account? </AppText>

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

  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
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

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },

  dividerLine: {
    flex: 1,
    height: 1,
  },

  dividerText: {
    marginHorizontal: 12,
    fontWeight: "600",
    fontSize: 12,
  },

  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 10,
  },

  googleButtonText: {
    fontWeight: "700",
    fontSize: 15,
  },
});
