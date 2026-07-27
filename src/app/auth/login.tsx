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
import { useAuthStore } from "@/store/authStore";
import { AuthError } from "@/services/authService";
import { useAppTheme } from "@/hooks/useAppTheme";

interface LoginFormValues {
  email: string;
  password: string;
}

const schema = yup.object({
  email: yup
    .string()
    .trim()
    .email("Enter a valid email address")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export default function LoginScreen() {
  const login = useAuthStore((state) => state.login);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { colors } = useAppTheme();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: yupResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitError(null);
    try {
      await login(values.email, values.password);
      router.replace("/(app)/home");
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

          <AppText variant="title">Welcome Back 👋</AppText>

          <AppText variant="body" style={[styles.subtitle, { color: colors.textSecondary }]}>
            Login to continue using WakeWise
          </AppText>
        </View>

        <View style={styles.form}>
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
                  autoComplete="password"
                />
              )}
            />
            {errors.password && (
              <AppText style={[styles.fieldError, { color: colors.error }]}>
                {errors.password.message}
              </AppText>
            )}
          </View>

          <Link href="/auth/forgot-password" asChild>
            <TouchableOpacity>
              <AppText style={[styles.forgot, { color: colors.primary }]}>
                Forgot Password?
              </AppText>
            </TouchableOpacity>
          </Link>

          {submitError && (
            <AppText style={[styles.formError, { color: colors.error }]}>
              {submitError}
            </AppText>
          )}

          <AppButton
            title="Login"
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
          <AppText>Don't have an account? </AppText>

          <Link href="/auth/register" asChild>
            <TouchableOpacity>
              <AppText style={[styles.link, { color: colors.primary }]}>
                Register
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

  forgot: {
    textAlign: "right",
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
