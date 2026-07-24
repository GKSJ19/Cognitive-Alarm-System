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
import { SettingsScreen, NotificationsScreen, AchievementsScreen, ReportsScreen } from '../screens/common/PlaceholderScreens';

// User Flow Screens
import UserDashboardScreen from '../screens/dashboard/UserDashboardScreen';
import AlarmListScreen from '../screens/alarms/AlarmListScreen';
import CreateAlarmScreen from '../screens/alarms/CreateAlarmScreen';
import EditAlarmScreen from '../screens/alarms/EditAlarmScreen';
import AlarmDetailsScreen from '../screens/alarms/AlarmDetailsScreen';

import HabitScoreDashboardScreen from '../screens/habits/HabitScoreDashboardScreen';

import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';

// Coach Flow Screens
import CoachDashboardScreen from '../screens/dashboard/CoachDashboardScreen';
import AssignedUsersScreen from '../screens/coach/AssignedUsersScreen';
import UserDetailsScreen from '../screens/coach/UserDetailsScreen';
import MessagesScreen from '../screens/coach/MessagesScreen';
import CoachReportsScreen from '../screens/coach/CoachReportsScreen';
import CoachAnalyticsScreen from '../screens/coach/CoachAnalyticsScreen';
import CoachNotificationsScreen from '../screens/coach/CoachNotificationsScreen';

// Admin Flow Screens
import AdminDashboardScreen from '../screens/dashboard/AdminDashboardScreen';
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import CoachManagementScreen from '../screens/admin/CoachManagementScreen';
import ChallengeManagementScreen from '../screens/admin/ChallengeManagementScreen';
import SystemSettingsScreen from '../screens/admin/SystemSettingsScreen';
import SystemLogsScreen from '../screens/admin/SystemLogsScreen';
import AdminUserAnalyticsScreen from '../screens/admin/AdminUserAnalyticsScreen';

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

const HabitStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#F8FAFC' }, headerTintColor: '#0F172A' }}>
    <Stack.Screen name="HabitScoreDashboard" component={HabitScoreDashboardScreen} options={{ title: 'Habit Score Dashboard' }} />
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
      <Tab.Screen name="Habits" component={HabitStackNavigator} options={{ title: 'Habits', tabBarIcon: ({ color }) => <Avatar.Icon size={24} icon="checkbox-marked-circle-outline" color={color} style={{ backgroundColor: 'transparent' }} /> }} />
      <Tab.Screen name="Reports" component={ReportsScreen} options={{ title: 'Reports', tabBarIcon: ({ color }) => <Avatar.Icon size={24} icon="chart-box-outline" color={color} style={{ backgroundColor: 'transparent' }} /> }} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} options={{ title: 'Profile', tabBarIcon: ({ color }) => <Avatar.Icon size={24} icon="account-circle" color={color} style={{ backgroundColor: 'transparent' }} /> }} />
    </Tab.Navigator>
  );
};

const UserDrawerNavigator = () => (
  <Drawer.Navigator drawerContent={props => <CustomDrawerContent {...props} />} screenOptions={{ headerStyle: { backgroundColor: '#F8FAFC' }, headerTintColor: '#0F172A', drawerStyle: { backgroundColor: '#FFFFFF' } }}>
    <Drawer.Screen name="Home" component={UserBottomTabNavigator} options={{ title: 'Home' }} />
    <Drawer.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    <Drawer.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
    <Drawer.Screen name="Achievements" component={AchievementsScreen} options={{ title: 'Achievements' }} />
  </Drawer.Navigator>
);

// --- COACH FLOW STACKS ---
const CoachUserStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#F8FAFC' }, headerTintColor: '#0F172A' }}>
    <Stack.Screen name="AssignedUsersMain" component={AssignedUsersScreen} options={{ title: 'Clients List' }} />
    <Stack.Screen name="UserDetails" component={UserDetailsScreen} options={{ title: 'Client Analytics' }} />
    <Stack.Screen name="CoachNotifications" component={CoachNotificationsScreen} options={{ title: 'Smart Client Alerts' }} />
  </Stack.Navigator>
);

const CoachBottomTabNavigator = () => {
  const theme = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#FFFFFF', borderTopColor: '#E2E8F0' },
        tabBarActiveTintColor: theme.colors.secondary,
        tabBarInactiveTintColor: '#64748B',
      }}
    >
      <Tab.Screen name="CoachDashboard" component={CoachDashboardScreen} options={{ title: 'Dashboard', tabBarIcon: ({ color }) => <Avatar.Icon size={24} icon="view-dashboard" color={color} style={{ backgroundColor: 'transparent' }} /> }} />
      <Tab.Screen name="AssignedUsers" component={CoachUserStackNavigator} options={{ title: 'Clients', tabBarIcon: ({ color }) => <Avatar.Icon size={24} icon="account-group" color={color} style={{ backgroundColor: 'transparent' }} /> }} />
      <Tab.Screen name="CoachReports" component={CoachReportsScreen} options={{ title: 'Reports', tabBarIcon: ({ color }) => <Avatar.Icon size={24} icon="file-document" color={color} style={{ backgroundColor: 'transparent' }} /> }} />
      <Tab.Screen name="CoachAnalytics" component={CoachAnalyticsScreen} options={{ title: 'Analytics', tabBarIcon: ({ color }) => <Avatar.Icon size={24} icon="google-analytics" color={color} style={{ backgroundColor: 'transparent' }} /> }} />
      <Tab.Screen name="Messages" component={MessagesScreen} options={{ title: 'Messages', tabBarIcon: ({ color }) => <Avatar.Icon size={24} icon="message-text" color={color} style={{ backgroundColor: 'transparent' }} /> }} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} options={{ title: 'Profile', tabBarIcon: ({ color }) => <Avatar.Icon size={24} icon="account-circle" color={color} style={{ backgroundColor: 'transparent' }} /> }} />
    </Tab.Navigator>
  );
};

const CoachDrawerNavigator = () => (
  <Drawer.Navigator drawerContent={props => <CustomDrawerContent {...props} />} screenOptions={{ headerStyle: { backgroundColor: '#F8FAFC' }, headerTintColor: '#0F172A', drawerStyle: { backgroundColor: '#FFFFFF' } }}>
    <Drawer.Screen name="Home" component={CoachBottomTabNavigator} options={{ title: 'Home' }} />
    <Drawer.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
  </Drawer.Navigator>
);

// --- ADMIN FLOW STACKS ---
const AdminUserStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#F8FAFC' }, headerTintColor: '#0F172A' }}>
    <Stack.Screen name="UserManagementMain" component={UserManagementScreen} options={{ title: 'User Management' }} />
    <Stack.Screen name="AdminUserAnalytics" component={AdminUserAnalyticsScreen} options={{ title: 'User Performance Analytics' }} />
  </Stack.Navigator>
);

const AdminBottomTabNavigator = () => {
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
      <Tab.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'Dashboard', tabBarIcon: ({ color }) => <Avatar.Icon size={24} icon="view-dashboard" color={color} style={{ backgroundColor: 'transparent' }} /> }} />
      <Tab.Screen name="UserManagement" component={AdminUserStackNavigator} options={{ title: 'Users', tabBarIcon: ({ color }) => <Avatar.Icon size={24} icon="account-multiple" color={color} style={{ backgroundColor: 'transparent' }} /> }} />
      <Tab.Screen name="CoachManagement" component={CoachManagementScreen} options={{ title: 'Coaches', tabBarIcon: ({ color }) => <Avatar.Icon size={24} icon="teach" color={color} style={{ backgroundColor: 'transparent' }} /> }} />
      <Tab.Screen name="ChallengeManagement" component={ChallengeManagementScreen} options={{ title: 'Challenges', tabBarIcon: ({ color }) => <Avatar.Icon size={24} icon="puzzle" color={color} style={{ backgroundColor: 'transparent' }} /> }} />
      <Tab.Screen name="SystemSettings" component={SystemSettingsScreen} options={{ title: 'Settings', tabBarIcon: ({ color }) => <Avatar.Icon size={24} icon="cog-outline" color={color} style={{ backgroundColor: 'transparent' }} /> }} />
      <Tab.Screen name="SystemLogs" component={SystemLogsScreen} options={{ title: 'Logs', tabBarIcon: ({ color }) => <Avatar.Icon size={24} icon="script-text" color={color} style={{ backgroundColor: 'transparent' }} /> }} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} options={{ title: 'Profile', tabBarIcon: ({ color }) => <Avatar.Icon size={24} icon="account-circle" color={color} style={{ backgroundColor: 'transparent' }} /> }} />
    </Tab.Navigator>
  );
};

const AdminDrawerNavigator = () => (
  <Drawer.Navigator drawerContent={props => <CustomDrawerContent {...props} />} screenOptions={{ headerStyle: { backgroundColor: '#F8FAFC' }, headerTintColor: '#0F172A', drawerStyle: { backgroundColor: '#FFFFFF' } }}>
    <Drawer.Screen name="Home" component={AdminBottomTabNavigator} options={{ title: 'Home' }} />
    <Drawer.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
  </Drawer.Navigator>
);

// --- MAIN NAVIGATOR ---
export const AppNavigator = () => {
  const { isAuthenticated, user } = useAuth();

  const renderRoleBasedNavigator = () => {
    switch (user?.role) {
      case 'admin':
        return <RootStack.Screen name="AdminFlow" component={AdminDrawerNavigator} />;
      case 'coach':
        return <RootStack.Screen name="CoachFlow" component={CoachDrawerNavigator} />;
      default:
        return <RootStack.Screen name="UserFlow" component={UserDrawerNavigator} />;
    }
  };

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          renderRoleBasedNavigator()
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
