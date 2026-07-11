import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Surface, List, Switch, Divider, useTheme, Button } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { logout } from '../store/authSlice';

export default function SettingsScreen({ navigation }: any) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Surface style={styles.section} elevation={2}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Account</Text>
        <Divider />
        <List.Item
          title="Email"
          description={user?.email || '—'}
          left={props => <List.Icon {...props} icon="email" />}
        />
        <List.Item
          title="Role"
          description={user?.role || 'user'}
          left={props => <List.Icon {...props} icon="shield-account" />}
        />
        <List.Item
          title="Edit Profile"
          left={props => <List.Icon {...props} icon="account-edit" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('EditProfile')}
        />
      </Surface>

      <Surface style={styles.section} elevation={2}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Notifications</Text>
        <Divider />
        <List.Item
          title="Alarm Notifications"
          description="Receive alarm reminders"
          left={props => <List.Icon {...props} icon="bell" />}
          right={() => <Switch value={true} onValueChange={() => {}} color={theme.colors.primary} />}
        />
        <List.Item
          title="Challenge Reminders"
          description="Daily challenge prompts"
          left={props => <List.Icon {...props} icon="brain" />}
          right={() => <Switch value={true} onValueChange={() => {}} color={theme.colors.primary} />}
        />
      </Surface>

      <Surface style={styles.section} elevation={2}>
        <Text variant="titleMedium" style={styles.sectionTitle}>About</Text>
        <Divider />
        <List.Item
          title="App Version"
          description="1.0.0 – Milestone 1"
          left={props => <List.Icon {...props} icon="information" />}
        />
        <List.Item
          title="Platform"
          description="AI Intelligent Cognitive Alarm"
          left={props => <List.Icon {...props} icon="alarm" />}
        />
      </Surface>

      <View style={styles.logoutContainer}>
        <Button
          mode="outlined"
          onPress={() => dispatch(logout())}
          icon="logout"
          textColor={theme.colors.error}
          style={[styles.logoutBtn, { borderColor: theme.colors.error }]}
        >
          Log Out
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: { margin: 16, marginBottom: 0, borderRadius: 16, overflow: 'hidden' },
  sectionTitle: { fontWeight: 'bold', padding: 16, paddingBottom: 8 },
  logoutContainer: { padding: 16, marginTop: 8 },
  logoutBtn: { borderRadius: 30 },
});
