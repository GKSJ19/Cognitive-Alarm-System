import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer, DarkTheme as NavigationDarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { useTheme, Avatar, Badge, Text } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useAuth } from '../hooks/useAuth';
import { COLORS } from '../theme/theme';

// Auth Navigation
import AuthNavigator from './AuthNavigator';

// Common Screens
import { SettingsScreen, AchievementsScreen, ReportsScreen } from '../screens/common/PlaceholderScreens';
import NotificationsScreen from '../screens/common/NotificationsScreen';

// User Flow Screens
import ChallengeScreen from '../screens/alarms/ChallengeScreen';
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
import AdminNotificationsScreen from '../screens/admin/AdminNotificationsScreen';

// Direct Messaging Chat Screens
import ConversationListScreen from '../screens/chat/ConversationListScreen';
import ChatDetailScreen from '../screens/chat/ChatDetailScreen';

import LoadingOverlay from '../components/common/LoadingOverlay';

const RootStack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

const screenHeaderOptions = {
  headerStyle: { backgroundColor: '#141021', elevation: 0, shadowOpacity: 0, borderBottomWidth: 1, borderBottomColor: 'rgba(165, 139, 255, 0.12)' },
  headerTintColor: '#FFFFFF',
  headerTitleStyle: { color: '#FFFFFF', fontWeight: 'bold' as const },
};

// Custom Drawer Component
const CustomDrawerContent = (props: any) => {
  const { logout, user } = useAuth();
  const theme = useTheme();

  return (
    <DrawerContentScrollView {...props} style={{ backgroundColor: '#141021' }}>
      <View style={styles.drawerHeader}>
        <Avatar.Text
          size={50}
          label={user?.full_name ? user.full_name.substring(0, 2).toUpperCase() : 'IC'}
          style={{ backgroundColor: '#A58BFF' }}
          color="#0D0B14"
        />
        <Text style={styles.drawerName}>{user?.full_name || 'User'}</Text>
        <Text style={styles.drawerRole}>{user?.role?.toUpperCase()}</Text>
      </View>
      <DrawerItemList {...props} />
      <DrawerItem
        label="Logout"
        onPress={logout}
        labelStyle={{ color: '#F87171', fontWeight: 'bold' }}
      />
    </DrawerContentScrollView>
  );
};

// --- CHAT STACK NAVIGATOR ---
const ChatStackNavigator = () => (
  <Stack.Navigator screenOptions={screenHeaderOptions}>
    <Stack.Screen name="ConversationList" component={ConversationListScreen} options={{ title: 'Direct Messages' }} />
    <Stack.Screen name="ChatDetail" component={ChatDetailScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);

// --- USER FLOW STACKS ---
const AlarmStackNavigator = () => (
  <Stack.Navigator screenOptions={screenHeaderOptions}>
    <Stack.Screen name="AlarmList" component={AlarmListScreen} options={{ title: 'Alarms' }} />
    <Stack.Screen name="CreateAlarm" component={CreateAlarmScreen} options={{ headerShown: false }} />
    <Stack.Screen name="EditAlarm" component={EditAlarmScreen} options={{ headerShown: false }} />
    <Stack.Screen name="AlarmDetails" component={AlarmDetailsScreen} options={{ title: 'Alarm Settings' }} />
    <Stack.Screen name="Challenge" component={ChallengeScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);

const HabitStackNavigator = () => (
  <Stack.Navigator screenOptions={screenHeaderOptions}>
    <Stack.Screen name="HabitScoreDashboard" component={HabitScoreDashboardScreen} options={{ title: 'Habit Score Dashboard' }} />
  </Stack.Navigator>
);

const ProfileStackNavigator = () => (
  <Stack.Navigator screenOptions={screenHeaderOptions}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{ title: 'Profile' }} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
  </Stack.Navigator>
);

const UserBottomTabNavigator = () => {
  const { unreadCount } = useSelector((state: RootState) => state.notifications);
  const { unreadTotal } = useSelector((state: RootState) => state.chat);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#141021', borderTopColor: 'rgba(165, 139, 255, 0.15)', height: 60, paddingBottom: 8 },
        tabBarActiveTintColor: '#A58BFF',
        tabBarInactiveTintColor: '#6D6586',
      }}
    >
      <Tab.Screen name="DashboardTab" component={UserDashboardScreen} options={{ title: 'Dashboard', tabBarIcon: ({ color }) => <Avatar.Icon size={24} icon="view-dashboard" color={color} style={{ backgroundColor: 'transparent' }} /> }} />
      <Tab.Screen name="Alarms" component={AlarmStackNavigator} options={{ title: 'Alarms', tabBarIcon: ({ color }) => <Avatar.Icon size={24} icon="alarm" color={color} style={{ backgroundColor: 'transparent' }} /> }} />
      <Tab.Screen name="ChatTab" component={ChatStackNavigator} options={{ title: 'Messages', tabBarBadge: unreadTotal > 0 ? unreadTotal : undefined, tabBarIcon: ({ color }) => <Avatar.Icon size={24} icon="message-text" color={color} style={{ backgroundColor: 'transparent' }} /> }} />
      <Tab.Screen name="Habits" component={HabitStackNavigator} options={{ title: 'Habits', tabBarIcon: ({ color }) => <Avatar.Icon size={24} icon="checkbox-marked-circle-outline" color={color} style={{ backgroundColor: 'transparent' }} /> }} />
      <Tab.Screen name="NotificationsTab" component={NotificationsScreen} options={{ title: 'Broadcasts', tabBarBadge: unreadCount > 0 ? unreadCount : undefined, tabBarIcon: ({ color }) => <Avatar.Icon size={24} icon="bell-outline" color={color} style={{ backgroundColor: 'transparent' }} /> }} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} options={{ title: 'Profile', tabBarIcon: ({ color }) => <Avatar.Icon size={24} icon="account-circle" color={color} style={{ backgroundColor: 'transparent' }} /> }} />
    </Tab.Navigator>
  );
};

const UserDrawerNavigator = () => (
  <Drawer.Navigator drawerContent={props => <CustomDrawerContent {...props} />} screenOptions={{ ...screenHeaderOptions, drawerStyle: { backgroundColor: '#141021' }, drawerActiveTintColor: '#A58BFF', drawerInactiveTintColor: '#A098BA' }}>
    <Drawer.Screen name="Home" component={UserBottomTabNavigator} options={{ title: 'Home' }} />
    <Drawer.Screen name="DirectMessages" component={ChatStackNavigator} options={{ title: 'Direct Messages' }} />
    <Drawer.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Broadcast Notifications' }} />
    <Drawer.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    <Drawer.Screen name="Achievements" component={AchievementsScreen} options={{ title: 'Achievements' }} />
    <Drawer.Screen name="Reports" component={ReportsScreen} options={{ title: 'Reports' }} />
  </Drawer.Navigator>
);

// --- COACH FLOW STACKS ---
const CoachUserStackNavigator = () => (
  <Stack.Navigator screenOptions={screenHeaderOptions}>
    <Stack.Screen name="AssignedUsersMain" component={AssignedUsersScreen} options={{ title: 'Clients List' }} />
    <Stack.Screen name="UserDetails" component={UserDetailsScreen} options={{ title: 'Client Analytics' }} />
    <Stack.Screen name="CoachNotifications" component={CoachNotificationsScreen} options={{ title: 'Smart Client Alerts' }} />
  </Stack.Navigator>
);

const CoachBottomTabNavigator = () => {
  const { unreadCount } = useSelector((state: RootState) => state.notifications);
  const { unreadTotal } = useSelector((state: RootState) => state.chat);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#141021', borderTopColor: 'rgba(165, 139, 255, 0.15)', height: 60, paddingBottom: 8 },
        tabBarActiveTintColor: '#A58BFF',
        tabBarInactiveTintColor: '#6D6586',
      }}
    >
      <Tab.Screen name="CoachDashboard" component={CoachDashboardScreen} options={{ title: 'Dashboard', tabBarIcon: ({ color }) => <Avatar.Icon size={24} icon="view-dashboard" color={color} style={{ backgroundColor: 'transparent' }} /> }} />
      <Tab.Screen name="AssignedUsers" component={CoachUserStackNavigator} options={{ title: 'Clients', tabBarIcon: ({ color }) => <Avatar.Icon size={24} icon="account-group" color={color} style={{ backgroundColor: 'transparent' }} /> }} />
      <Tab.Screen name="ChatTab" component={ChatStackNavigator} options={{ title: 'Messages', tabBarBadge: unreadTotal > 0 ? unreadTotal : undefined, tabBarIcon: ({ color }) => <Avatar.Icon size={24} icon="message-text" color={color} style={{ backgroundColor: 'transparent' }} /> }} />
      <Tab.Screen name="NotificationsTab" component={NotificationsScreen} options={{ title: 'Broadcasts', tabBarBadge: unreadCount > 0 ? unreadCount : undefined, tabBarIcon: ({ color }) => <Avatar.Icon size={24} icon="bell-outline" color={color} style={{ backgroundColor: 'transparent' }} /> }} />
      <Tab.Screen name="CoachReports" component={CoachReportsScreen} options={{ title: 'Reports', tabBarIcon: ({ color }) => <Avatar.Icon size={24} icon="file-document" color={color} style={{ backgroundColor: 'transparent' }} /> }} />
      <Tab.Screen name="CoachAnalytics" component={CoachAnalyticsScreen} options={{ title: 'Analytics', tabBarIcon: ({ color }) => <Avatar.Icon size={24} icon="google-analytics" color={color} style={{ backgroundColor: 'transparent' }} /> }} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} options={{ title: 'Profile', tabBarIcon: ({ color }) => <Avatar.Icon size={24} icon="account-circle" color={color} style={{ backgroundColor: 'transparent' }} /> }} />
    </Tab.Navigator>
  );
};

const CoachDrawerNavigator = () => (
  <Drawer.Navigator drawerContent={props => <CustomDrawerContent {...props} />} screenOptions={{ ...screenHeaderOptions, drawerStyle: { backgroundColor: '#141021' }, drawerActiveTintColor: '#A58BFF', drawerInactiveTintColor: '#A098BA' }}>
    <Drawer.Screen name="Home" component={CoachBottomTabNavigator} options={{ title: 'Home' }} />
    <Drawer.Screen name="DirectMessages" component={ChatStackNavigator} options={{ title: 'Direct Messages' }} />
    <Drawer.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Broadcast Notifications' }} />
    <Drawer.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
  </Drawer.Navigator>
);

// --- ADMIN FLOW STACKS ---
const AdminUserStackNavigator = () => (
  <Stack.Navigator screenOptions={screenHeaderOptions}>
    <Stack.Screen name="UserManagementMain" component={UserManagementScreen} options={{ title: 'User Management' }} />
    <Stack.Screen name="AdminUserAnalytics" component={AdminUserAnalyticsScreen} options={{ title: 'User Performance Analytics' }} />
  </Stack.Navigator>
);

const AdminBottomTabNavigator = () => {
  const { unreadTotal } = useSelector((state: RootState) => state.chat);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#141021', borderTopColor: 'rgba(165, 139, 255, 0.15)', height: 60, paddingBottom: 8 },
        tabBarActiveTintColor: '#A58BFF',
        tabBarInactiveTintColor: '#6D6586',
      }}
    >
      <Tab.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'Dashboard', tabBarIcon: ({ color }) => <Avatar.Icon size={24} icon="view-dashboard" color={color} style={{ backgroundColor: 'transparent' }} /> }} />
      <Tab.Screen name="ChatTab" component={ChatStackNavigator} options={{ title: 'Messages', tabBarBadge: unreadTotal > 0 ? unreadTotal : undefined, tabBarIcon: ({ color }) => <Avatar.Icon size={24} icon="message-text" color={color} style={{ backgroundColor: 'transparent' }} /> }} />
      <Tab.Screen name="BroadcastManagement" component={AdminNotificationsScreen} options={{ title: 'Broadcasts', tabBarIcon: ({ color }) => <Avatar.Icon size={24} icon="bullhorn-outline" color={color} style={{ backgroundColor: 'transparent' }} /> }} />
      <Tab.Screen name="UserManagement" component={AdminUserStackNavigator} options={{ title: 'Users', tabBarIcon: ({ color }) => <Avatar.Icon size={24} icon="account-multiple" color={color} style={{ backgroundColor: 'transparent' }} /> }} />
      <Tab.Screen name="CoachManagement" component={CoachManagementScreen} options={{ title: 'Coaches', tabBarIcon: ({ color }) => <Avatar.Icon size={24} icon="teach" color={color} style={{ backgroundColor: 'transparent' }} /> }} />
      <Tab.Screen name="ChallengeManagement" component={ChallengeManagementScreen} options={{ title: 'Challenges', tabBarIcon: ({ color }) => <Avatar.Icon size={24} icon="puzzle" color={color} style={{ backgroundColor: 'transparent' }} /> }} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} options={{ title: 'Profile', tabBarIcon: ({ color }) => <Avatar.Icon size={24} icon="account-circle" color={color} style={{ backgroundColor: 'transparent' }} /> }} />
    </Tab.Navigator>
  );
};

const AdminDrawerNavigator = () => (
  <Drawer.Navigator drawerContent={props => <CustomDrawerContent {...props} />} screenOptions={{ ...screenHeaderOptions, drawerStyle: { backgroundColor: '#141021' }, drawerActiveTintColor: '#A58BFF', drawerInactiveTintColor: '#A098BA' }}>
    <Drawer.Screen name="Home" component={AdminBottomTabNavigator} options={{ title: 'Home' }} />
    <Drawer.Screen name="DirectMessages" component={ChatStackNavigator} options={{ title: 'Direct Messages' }} />
    <Drawer.Screen name="NotificationBroadcast" component={AdminNotificationsScreen} options={{ title: 'Broadcast Notifications' }} />
    <Drawer.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
  </Drawer.Navigator>
);

const navTheme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    background: '#0D0B14',
    card: '#141021',
    text: '#FFFFFF',
    border: 'rgba(165, 139, 255, 0.15)',
    primary: '#A58BFF',
  },
};

// --- MAIN NAVIGATOR ---
export const AppNavigator = () => {
  const { isAuthenticated, user, bootstrapSession } = useAuth();
  const [isInitializing, setIsInitializing] = React.useState(true);

  React.useEffect(() => {
    bootstrapSession().finally(() => setIsInitializing(false));
  }, []);

  if (isInitializing) {
    return <LoadingOverlay visible={true} message="Initializing ICAP..." />;
  }

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
    <NavigationContainer theme={navTheme}>
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

const styles = StyleSheet.create({
  drawerHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(165, 139, 255, 0.15)',
    alignItems: 'center',
    marginBottom: 10,
  },
  drawerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  drawerRole: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A58BFF',
    marginTop: 2,
  },
});

export default AppNavigator;

