import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import OnboardingScreen from '../screens/OnboardingScreen';

// App Screens
import HomeScreen from '../screens/HomeScreen';
import AlarmsScreen from '../screens/AlarmsScreen';
import AddAlarmScreen from '../screens/AddAlarmScreen';
import EditAlarmScreen from '../screens/EditAlarmScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';

// Modals
import AlarmRingScreen from '../screens/AlarmRingScreen';
import ChallengeScreen from '../screens/ChallengeScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  const theme = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 0,
          elevation: 12,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, string> = {
            HomeDashboard: focused ? 'home' : 'home-outline',
            Alarms: focused ? 'alarm' : 'alarm-outline',
            Profile: focused ? 'account' : 'account-outline',
            Settings: focused ? 'cog' : 'cog-outline',
          };
          return (
            <MaterialCommunityIcons
              name={(icons[route.name] || 'circle') as any}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="HomeDashboard" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Alarms" component={AlarmsScreen} options={{ title: 'Alarms' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const theme = useTheme();

  return (
    <NavigationContainer theme={theme as any}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen name="AddAlarm" component={AddAlarmScreen} options={{ headerShown: true, title: 'New Alarm', presentation: 'modal' }} />
            <Stack.Screen name="EditAlarm" component={EditAlarmScreen} options={{ headerShown: true, title: 'Edit Alarm', presentation: 'modal' }} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: true, title: 'Edit Profile', presentation: 'modal' }} />
            <Stack.Screen name="AlarmRing" component={AlarmRingScreen} options={{ presentation: 'fullScreenModal' }} />
            <Stack.Screen name="Challenge" component={ChallengeScreen} options={{ presentation: 'fullScreenModal', gestureEnabled: false }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
