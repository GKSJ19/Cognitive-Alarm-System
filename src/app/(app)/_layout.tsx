import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ensureNotificationSetup, registerAlarmNotificationEvents } from "@/services/notifications/alarmScheduler";

export default function RootLayout() {
  useEffect(() => {
    ensureNotificationSetup().catch(() => {});
    registerAlarmNotificationEvents();
  }, []);

  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
        }}
      />
    </>
  );
}