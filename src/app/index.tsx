import { useEffect } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { router } from "expo-router";

import { useAuthStore } from "@/store/authStore";

/**
 * Root entry point. Waits for the persisted auth session to rehydrate from
 * AsyncStorage, then routes to the authenticated area or the login screen.
 */
export default function Index() {
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!hasHydrated) return;

    if (isAuthenticated) {
      router.replace("/(app)/home");
    } else {
      router.replace("/auth/login");
    }
  }, [hasHydrated, isAuthenticated]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#2563EB" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
});
