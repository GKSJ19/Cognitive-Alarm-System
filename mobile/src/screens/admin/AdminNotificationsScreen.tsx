import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, useTheme, Card, Chip, IconButton } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchAdminNotifications, publishNotification } from '../../store/slices/notificationSlice';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import ThemeBackground from '../../components/common/ThemeBackground';
import { BroadcastNotification } from '../../types/notification.types';

export const AdminNotificationsScreen: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { adminNotifications, isLoading, error } = useSelector((state: RootState) => state.notifications);

  // Form fields
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<string>('normal');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchAdminNotifications());
  }, [dispatch]);

  const handlePublish = async () => {
    if (!title.trim() || !message.trim()) {
      setValidationError('Please provide both Title and Message for the broadcast.');
      return;
    }

    setValidationError(null);
    setSuccessMessage(null);

    const result = await dispatch(publishNotification({
      title: title.trim(),
      message: message.trim(),
      priority: priority,
    }));

    if (publishNotification.fulfilled.match(result)) {
      setSuccessMessage('Broadcast notification published successfully to all users and coaches!');
      setTitle('');
      setMessage('');
      setPriority('normal');
    } else if (publishNotification.rejected.match(result)) {
      setValidationError((result.payload as string) || 'Failed to publish notification');
    }
  };

  const priorityOptions = [
    { value: 'low', label: 'Low', activeBg: '#A098BA', activeText: '#0D0B14', inactiveText: '#A098BA', border: 'rgba(160, 152, 186, 0.3)' },
    { value: 'normal', label: 'Normal', activeBg: '#A58BFF', activeText: '#0D0B14', inactiveText: '#A58BFF', border: 'rgba(165, 139, 255, 0.3)' },
    { value: 'high', label: 'High', activeBg: '#FBBF24', activeText: '#0D0B14', inactiveText: '#FBBF24', border: 'rgba(251, 191, 36, 0.3)' },
    { value: 'urgent', label: 'Urgent', activeBg: '#F87171', activeText: '#0D0B14', inactiveText: '#F87171', border: 'rgba(248, 113, 113, 0.3)' },
  ];

  const getPriorityColor = (p: string) => {
    switch (p.toLowerCase()) {
      case 'urgent': return { bg: '#451A1A', text: '#F87171' };
      case 'high': return { bg: '#3D2E14', text: '#FBBF24' };
      case 'low': return { bg: '#231E33', text: '#A098BA' };
      default: return { bg: '#2C2243', text: '#A58BFF' };
    }
  };

  const renderNotificationCard = ({ item }: { item: BroadcastNotification }) => {
    const pStyle = getPriorityColor(item.priority);
    const dateFormatted = item.created_at
      ? new Date(item.created_at).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : '';

    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Chip compact style={{ backgroundColor: pStyle.bg }}>
              <Text style={{ color: pStyle.text, fontWeight: 'bold', fontSize: 11 }}>
                {item.priority.toUpperCase()}
              </Text>
            </Chip>
          </View>
          <Text style={styles.cardMessage}>{item.message}</Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardFooterText}>Created by: {item.created_by_name}</Text>
            <Text style={styles.cardFooterText}>{dateFormatted}</Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <ThemeBackground>
      <View style={styles.container}>
        <LoadingOverlay visible={isLoading && adminNotifications.length === 0} message="Loading notifications..." />

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* CREATE NOTIFICATION FORM CARD */}
          <Card style={styles.formCard}>
            <Card.Content>
              <View style={styles.formHeader}>
                <IconButton icon="bullhorn-outline" size={28} iconColor="#A58BFF" style={{ margin: 0 }} />
                <Text style={styles.formTitle}>Broadcast Notification</Text>
              </View>
              <Text style={styles.formSub}>
                Publish announcements or system alerts to all registered Users and Wellness Coaches.
              </Text>

              <AppInput
                label="Notification Title"
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Scheduled System Maintenance"
                leftIcon="format-title"
              />

              <AppInput
                label="Notification Message"
                value={message}
                onChangeText={setMessage}
                placeholder="Enter complete broadcast message body..."
                leftIcon="message-text-outline"
                multiline
                numberOfLines={4}
              />

              <Text style={styles.priorityLabel}>Priority Level (Optional)</Text>
              
              {/* Sleek Custom Priority Pills */}
              <View style={styles.priorityRow}>
                {priorityOptions.map((opt) => {
                  const isSelected = priority === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={[
                        styles.priorityPill,
                        {
                          backgroundColor: isSelected ? opt.activeBg : '#262036',
                          borderColor: opt.border,
                        }
                      ]}
                      onPress={() => setPriority(opt.value)}
                    >
                      <Text
                        style={[
                          styles.priorityPillText,
                          { color: isSelected ? opt.activeText : opt.inactiveText }
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {validationError && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>⚠️ {validationError}</Text>
                </View>
              )}

              {successMessage && (
                <View style={styles.successBox}>
                  <Text style={styles.successText}>✅ {successMessage}</Text>
                </View>
              )}

              <AppButton
                mode="contained"
                onPress={handlePublish}
                loading={isLoading}
                style={styles.publishBtn}
                buttonColor="#A58BFF"
                textColor="#0D0B14"
              >
                Publish Notification
              </AppButton>
            </Card.Content>
          </Card>

          {/* PREVIOUSLY PUBLISHED NOTIFICATIONS LIST */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Broadcast History</Text>
          </View>

          {adminNotifications.length === 0 ? (
            <Card style={styles.card}>
              <Card.Content style={{ alignItems: 'center', paddingVertical: 24 }}>
                <Text style={{ color: '#A098BA' }}>No broadcast notifications published yet.</Text>
              </Card.Content>
            </Card>
          ) : (
            adminNotifications.map((item) => (
              <React.Fragment key={item.id}>
                {renderNotificationCard({ item })}
              </React.Fragment>
            ))
          )}
        </ScrollView>
      </View>
    </ThemeBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: 'rgba(26, 22, 38, 0.85)',
    borderRadius: 20,
    marginBottom: 20,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(165, 139, 255, 0.15)',
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  formSub: {
    fontSize: 13,
    color: '#A098BA',
    marginBottom: 16,
  },
  priorityLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 8,
  },
  priorityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  priorityPill: {
    flex: 0.23,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  priorityPillText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  errorBox: {
    backgroundColor: 'rgba(248, 113, 113, 0.15)',
    padding: 12,
    borderRadius: 12,
    marginVertical: 8,
  },
  errorText: {
    color: '#F87171',
    fontSize: 13,
    fontWeight: '600',
  },
  successBox: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    padding: 12,
    borderRadius: 12,
    marginVertical: 8,
  },
  successText: {
    color: '#34D399',
    fontSize: 13,
    fontWeight: '600',
  },
  publishBtn: {
    marginTop: 12,
    borderRadius: 20,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: 'rgba(26, 22, 38, 0.85)',
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(165, 139, 255, 0.15)',
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 8,
  },
  cardMessage: {
    fontSize: 13,
    color: '#A098BA',
    marginVertical: 8,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(165, 139, 255, 0.1)',
    paddingTop: 8,
    marginTop: 4,
  },
  cardFooterText: {
    fontSize: 11,
    color: '#6D6586',
  },
});

export default AdminNotificationsScreen;
