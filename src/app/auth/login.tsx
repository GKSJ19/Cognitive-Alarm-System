import React, { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Link } from "expo-router";
// Use react-native-vector-icons as a fallback to avoid missing @expo/vector-icons types
// @ts-ignore
import { Ionicons } from "@expo/vector-icons";

import AppLogo from "@/components/logo/AppLogo";
import AppInput from "@/components/forms/AppInput";
import AppButton from "@/components/buttons/AppButton";
import AppText from "@/components/common/AppText";
import Divider from "@/components/common/Divider";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View style={styles.container}>

      <AppLogo />

      <AppText variant="heading">
        Welcome Back 👋
      </AppText>

      <AppText style={styles.subtitle}>
        Login to continue using WakeWise
      </AppText>

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
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secure
      />

      <Pressable>
        <AppText style={styles.forgot}>
          Forgot Password?
        </AppText>
      </Pressable>

      <AppButton
        title="Login"
        onPress={() => {}}
      />

      <Divider />

      <Pressable style={styles.googleButton}>
        <Ionicons
          name="logo-google"
          size={22}
          color="#EA4335"
        />

        <AppText style={styles.googleText}>
          Continue with Google
        </AppText>
      </Pressable>

      <View style={styles.footer}>
        <AppText>
          Don't have an account?
        </AppText>

        <Link href={{ pathname: "/auth/regsister" }} asChild>
          <Pressable>
            <AppText style={styles.register}>
              {" "}Register
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

  forgot: {
    color: "#2563EB",
    textAlign: "right",
    marginBottom: 20,
  },

  googleButton: {
    height: 56,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },

  googleText: {
    fontWeight: "600",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
  },

  register: {
    color: "#2563EB",
    fontWeight: "700",
  },

});