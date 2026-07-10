import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, useTheme, Card, Switch, Snackbar } from 'react-native-paper';
import { useAdmin } from '../../hooks/useAdmin';
import AppButton from '../../components/common/AppButton';
import LoadingOverlay from '../../components/common/LoadingOverlay';

export const SystemSettingsScreen = () => {
  const theme = useTheme();
  const { settings, getSettings, updateSettings, isLoading, error, clearError } = useAdmin();

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowRegistrations, setAllowRegistrations] = useState(true);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  useEffect(() => {
    getSettings();
  }, [getSettings]);

  useEffect(() => {
    if (settings) {
      setMaintenanceMode(settings.maintenance_mode || false);
      setAllowRegistrations(settings.allow_registrations !== false);
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await updateSettings({
        maintenance_mode: maintenanceMode,
        allow_registrations: allowRegistrations,
      }).unwrap();
      setSnackbarMessage("Settings updated successfully");
    } catch (err) {
      setSnackbarMessage("Failed to save settings");
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LoadingOverlay visible={isLoading} />
      
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.onBackground }]}>System Settings</Text>
        <Text style={{ color: theme.colors.onSurfaceVariant }}>Global app parameters</Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.row}>
            <Text style={{ color: theme.colors.onSurface }}>Maintenance Mode</Text>
            <Switch value={maintenanceMode} onValueChange={setMaintenanceMode} />
          </View>

          <View style={styles.row}>
            <Text style={{ color: theme.colors.onSurface }}>Allow User Signups</Text>
            <Switch value={allowRegistrations} onValueChange={setAllowRegistrations} />
          </View>

          <AppButton mode="contained" onPress={handleSave} style={{ marginTop: 20 }}>
            Save Settings
          </AppButton>
        </Card.Content>
      </Card>

      <Snackbar
        visible={!!error || !!snackbarMessage}
        onDismiss={() => {
          setSnackbarMessage(null);
          clearError();
        }}
        action={{
          label: 'OK',
          onPress: () => {
            setSnackbarMessage(null);
            clearError();
          }
        }}
        style={{ backgroundColor: error ? theme.colors.error : theme.colors.primary }}
      >
        {error || snackbarMessage}
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  card: {
    borderRadius: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
});

export default SystemSettingsScreen;
