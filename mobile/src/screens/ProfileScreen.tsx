import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Surface, Avatar, Button, Divider, useTheme, ActivityIndicator, Chip } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { setProfile } from '../store/profileSlice';
import { logout } from '../store/authSlice';
import api from '../services/api';

export default function ProfileScreen({ navigation }: any) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const profile = useSelector((state: RootState) => state.profile.profile);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/profile');
      dispatch(setProfile(res.data));
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <Surface style={[styles.header, { backgroundColor: theme.colors.primaryContainer }]} elevation={0}>
        <View style={styles.avatarContainer}>
          {profile?.profile_image ? (
            <Avatar.Image size={90} source={{ uri: profile.profile_image }} />
          ) : (
            <Avatar.Text size={90} label={initials} style={{ backgroundColor: theme.colors.primary }} />
          )}
          <Button
            mode="outlined"
            compact
            onPress={() => navigation.navigate('EditProfile')}
            style={styles.editAvatarBtn}
          >
            Edit Photo
          </Button>
        </View>
        <Text variant="headlineSmall" style={styles.name}>{displayName}</Text>
        <Text variant="bodyMedium" style={styles.email}>{user?.email || ''}</Text>
        <Chip icon="shield-account" style={styles.roleChip}>{user?.role || 'user'}</Chip>
      </Surface>

      {/* Info */}
      <Surface style={styles.section} elevation={2}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Personal Info</Text>
        <Divider style={styles.divider} />
        {[
          { label: 'Phone', value: profile?.phone || 'Not set' },
          { label: 'Age', value: profile?.age ? `${profile.age} years` : 'Not set' },
          { label: 'Gender', value: profile?.gender || 'Not set' },
          { label: 'Time Zone', value: profile?.time_zone || 'UTC' },
        ].map((item) => (
          <View key={item.label} style={styles.infoRow}>
            <Text variant="bodyMedium" style={styles.infoLabel}>{item.label}</Text>
            <Text variant="bodyMedium" style={styles.infoValue}>{item.value}</Text>
          </View>
        ))}
      </Surface>

      {/* Alarm Preferences */}
      <Surface style={styles.section} elevation={2}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Alarm Preferences</Text>
        <Divider style={styles.divider} />
        {[
          { label: 'Wake-up Time', value: profile?.preferred_wakeup_time || '07:00' },
          { label: 'Sleep Goal', value: `${profile?.sleep_duration_goal || 8}h` },
          { label: 'Difficulty', value: profile?.difficulty_preference || 'Medium' },
        ].map((item) => (
          <View key={item.label} style={styles.infoRow}>
            <Text variant="bodyMedium" style={styles.infoLabel}>{item.label}</Text>
            <Text variant="bodyMedium" style={styles.infoValue}>{item.value}</Text>
          </View>
        ))}
      </Surface>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('EditProfile')}
          style={styles.actionBtn}
          icon="pencil"
        >
          Edit Profile
        </Button>
        <Button
          mode="outlined"
          onPress={handleLogout}
          style={styles.actionBtn}
          icon="logout"
          textColor={theme.colors.error}
        >
          Log Out
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    padding: 28,
    alignItems: 'center',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 16,
  },
  avatarContainer: { alignItems: 'center', marginBottom: 12 },
  editAvatarBtn: { marginTop: 8 },
  name: { fontWeight: 'bold', marginBottom: 4 },
  email: { opacity: 0.7, marginBottom: 12 },
  roleChip: { marginTop: 4 },
  section: {
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: { fontWeight: 'bold', marginBottom: 8 },
  divider: { marginBottom: 12 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.2)',
  },
  infoLabel: { opacity: 0.6 },
  infoValue: { fontWeight: '500' },
  actions: { padding: 16, gap: 12 },
  actionBtn: { borderRadius: 30 },
});
