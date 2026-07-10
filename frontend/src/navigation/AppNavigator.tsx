import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { useTheme, Avatar } from 'react-native-paper';
import { useAuth } from '../hooks/useAuth';

// Auth Navigation
import AuthNavigator from './AuthNavigator';

// Placeholders
import { SettingsScreen } from '../screens/common/PlaceholderScreens';

// User Flow Screens
import UserDashboardScreen from '../screens/dashboard/UserDashboardScreen';
import AlarmListScreen from '../screens/alarms/AlarmListScreen';
import CreateAlarmScreen from '../screens/alarms/CreateAlarmScreen';
import EditAlarmScreen from '../screens/alarms/EditAlarmScreen';
import AlarmDetailsScreen from '../screens/alarms/AlarmDetailsScreen';

import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';

const RootStack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

// Helper Custom Drawer to handle Logout
const CustomDrawerContent = (props: any) => {
  const { logout } = useAuth();
  const theme = useTheme();
  return (
    <DrawerContentScrollView {...props} style={{ backgroundColor: theme.colors.background }}>
      <DrawerItemList {...props} />
      <DrawerItem
        label="Logout"
        onPress={logout}
        labelStyle={{ color: theme.colors.error, fontWeight: 'bold' }}
      />
    </DrawerContentScrollView>
  );
};

// --- USER FLOW STACKS ---
const AlarmStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#F8FAFC' }, headerTintColor: '#0F172A' }}>
    <Stack.Screen name="AlarmList" component={AlarmListScreen} options={{ title: 'Alarms' }} />
    <Stack.Screen name="CreateAlarm" component={CreateAlarmScreen} options={{ title: 'New Alarm' }} />
    <Stack.Screen name="EditAlarm" component={EditAlarmScreen} options={{ title: 'Edit Alarm' }} />
    <Stack.Screen name="AlarmDetails" component={AlarmDetailsScreen} options={{ title: 'Alarm Settings' }} />
  </Stack.Navigator>
);

const ProfileStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#F8FAFC' }, headerTintColor: '#0F172A' }}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{ title: 'Profile' }} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
  </Stack.Navigator>
);

const UserBottomTabNavigator = () => {
  const theme = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#FFFFFF', borderTopColor: '#E2E8F0' },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: '#64748B',
      }}
    >
      <Tab.Screen name="DashboardTab" component={UserDashboardScreen} options={{ title: 'Dashboard', tabBarIcon: ({ color }) => <Avatar.Icon size={24} icon="view-dashboard" color={color} style={{ backgroundColor: 'transparent' }} /> }} />
      <Tab.Screen name="Alarms" component={AlarmStackNavigator} options={{ title: 'Alarms', tabBarIcon: ({ color }) => <Avatar.Icon size={24} icon="alarm" color={color} style={{ backgroundColor: 'transparent' }} /> }} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} options={{ title: 'Profile', tabBarIcon: ({ color }) => <Avatar.Icon size={24} icon="account-circle" color={color} style={{ backgroundColor: 'transparent' }} /> }} />
    </Tab.Navigator>
  );
};

const UserDrawerNavigator = () => (
  <Drawer.Navigator drawerContent={props => <CustomDrawerContent {...props} />} screenOptions={{ headerStyle: { backgroundColor: '#F8FAFC' }, headerTintColor: '#0F172A', drawerStyle: { backgroundColor: '#FFFFFF' } }}>
    <Drawer.Screen name="Home" component={UserBottomTabNavigator} options={{ title: 'Home' }} />
    <Drawer.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
  </Drawer.Navigator>
);

// --- MAIN NAVIGATOR ---
export const AppNavigator = () => {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <RootStack.Screen name="UserFlow" component={UserDrawerNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
