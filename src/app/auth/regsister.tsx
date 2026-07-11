import React, { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Link } from "expo-router";

import AppLogo from "@/components/logo/AppLogo";
import AppInput from "@/components/forms/AppInput";
import AppButton from "@/components/buttons/AppButton";
import AppText from "@/components/common/AppText";

export default function RegisterScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <View style={styles.container}>

      <AppLogo />

      <AppText variant="heading">
        Create Account
      </AppText>

      <AppText style={styles.subtitle}>
        Register to start using WakeWise
      </AppText>

      <AppInput
        label="Full Name"
        placeholder="Enter your full name"
        value={fullName}
        onChangeText={setFullName}
      />

      <AppInput
        label="Email"
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <AppInput
        label="Password"
        placeholder="Create a password"
        value={password}
        onChangeText={setPassword}
        secure
      />

      <AppInput
        label="Confirm Password"
        placeholder="Re-enter your password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secure
      />

      <AppButton
        title="Register"
        onPress={() => {}}
      />

      <View style={styles.footer}>
        <AppText>
          Already have an account?
        </AppText>

        <Link href="/auth/login" asChild>
          <Pressable>
            <AppText style={styles.login}>
              {" "}Login
            </AppText>
          </Pressable>
        </Link>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  subtitle: {
    marginTop: 8,
    marginBottom: 30,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
  },

  login: {
    color: "#2563EB",
    fontWeight: "700",
  },
});