import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import AlarmsScreen from './src/screens/AlarmsScreen';
import AlarmEditScreen from './src/screens/AlarmEditScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AlarmTriggerScreen from './src/screens/AlarmTriggerScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import { getAuth } from './src/lib/api';
import { colors } from './src/theme/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const navTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    primary: colors.primary,
    notification: colors.primary,
  },
};

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.bg, borderBottomWidth: 0, elevation: 0, shadowOpacity: 0 },
        headerTitleStyle: { color: colors.text, fontWeight: '700', fontSize: 20 },
        headerTitleAlign: 'left',
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, size, focused }) => {
          const map = { Alarms: 'alarm', History: 'stats-chart', Profile: 'person-circle' };
          const name = focused ? map[route.name] : `${map[route.name]}-outline`;
          return <Ionicons name={name} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Alarms" component={AlarmsScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [initial, setInitial] = useState(null);
  useEffect(() => { getAuth().then(t => setInitial(t ? 'Tabs' : 'Login')); }, []);
  if (!initial) return null;
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator
          initialRouteName={initial}
          screenOptions={{
            headerStyle: { backgroundColor: colors.bg },
            headerTintColor: colors.text,
            headerTitleStyle: { fontWeight: '700' },
            contentStyle: { backgroundColor: colors.bg },
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
          <Stack.Screen name="AlarmEdit" component={AlarmEditScreen} options={{ title: 'Alarm' }} />
          <Stack.Screen name="AlarmTrigger" component={AlarmTriggerScreen} options={{ headerShown: false, gestureEnabled: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}