import { useState } from "react";
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Link, router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import AppText from "@/components/common/AppText";
import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/forms/AppInput";
import PasswordInput from "@/components/forms/PasswordInput";
import { useAuthStore } from "@/store/authStore";
import { AuthError } from "@/services/authService";

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
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View>
          <AppText variant="title">Create Account ✨</AppText>

          <AppText variant="body" style={styles.subtitle}>
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
              <AppText style={styles.fieldError}>
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
              <AppText style={styles.fieldError}>
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
              <AppText style={styles.fieldError}>
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
              <AppText style={styles.fieldError}>
                {errors.confirmPassword.message}
              </AppText>
            )}
          </View>

          {submitError && (
            <AppText style={styles.formError}>{submitError}</AppText>
          )}

          <AppButton
            title="Create Account"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
          />
        </View>

        <View style={styles.footer}>
          <AppText>Already have an account? </AppText>

          <Link href="/auth/login" asChild>
            <TouchableOpacity>
              <AppText style={styles.link}>Login</AppText>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#FFFFFF",
    padding: 24,
    justifyContent: "center",
  },

  subtitle: {
    marginTop: 10,
    marginBottom: 40,
    color: "#666",
  },

  form: {
    gap: 18,
  },

  fieldError: {
    color: "#EF4444",
    fontSize: 13,
    marginTop: 4,
    marginLeft: 4,
  },

  formError: {
    color: "#EF4444",
    fontSize: 14,
    textAlign: "center",
  },

  footer: {
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "center",
  },

  link: {
    color: "#2563EB",
    fontWeight: "700",
  },
});
