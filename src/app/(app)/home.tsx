import { View, StyleSheet } from "react-native";
import { router } from "expo-router";

import Screen from "@/components/common/Screen";
import AppText from "@/components/common/AppText";
import AppButton from "@/components/buttons/AppButton";
import { useAuthStore } from "@/store/authStore";

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    router.replace("/auth/login");
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.content}>
        <AppText variant="caption" style={styles.eyebrow}>
          WAKEWISE
        </AppText>

        <AppText variant="title" style={styles.title}>
          Welcome, {user?.fullName ?? "there"} 👋
        </AppText>

        <AppText variant="body" style={styles.subtitle}>
          {user?.email}
        </AppText>

        <AppText variant="body" style={styles.description}>
          You're logged in. This is where your cognitive alarms, sleep
          insights, and challenges will live.
        </AppText>
      </View>

      <AppButton title="Log Out" variant="outline" onPress={handleLogout} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    justifyContent: "space-between",
  },

  content: {
    marginTop: 40,
  },

  eyebrow: {
    color: "#2563EB",
    fontWeight: "700",
    letterSpacing: 1,
  },

  title: {
    marginTop: 8,
  },

  subtitle: {
    marginTop: 4,
    color: "#64748B",
  },

  description: {
    marginTop: 24,
    color: "#334155",
    lineHeight: 22,
  },
});
