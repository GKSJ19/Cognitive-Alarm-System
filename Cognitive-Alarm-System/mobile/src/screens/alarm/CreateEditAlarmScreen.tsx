import React from 'react';
import { StyleSheet, Text, View, Switch } from 'react-native';
import { Controller, useForm } from 'react-hook-form';

import { AppButton } from '../../components/AppButton';
import { FormInput } from '../../components/FormInput';
import { ScreenContainer } from '../../components/ScreenContainer';
import { alarmsApi } from '../../services/api';
import { useAppDispatch } from '../../hooks/redux';
import { fetchAlarms } from '../../redux/slices/alarmsSlice';
import { theme } from '../../theme';

export function CreateEditAlarmScreen({ navigation, route }: any) {
  const dispatch = useAppDispatch();
  const alarm = route?.params?.alarm;

  const { control, handleSubmit } = useForm({
    defaultValues: {
      label: alarm?.label || '',
      time: alarm?.time || '06:30',
      is_active: alarm?.is_active ?? true,
      days_of_week: alarm?.days_of_week ? alarm.days_of_week.join(',') : '',
      alarm_type: alarm?.alarm_type || 'daily',
    },
  });

  const onSubmit = async (values: any) => {
    const payload = {
      label: values.label,
      time: values.time,
      is_active: values.is_active,
      days_of_week: values.days_of_week ? values.days_of_week.split(',').map((s: string) => Number(s.trim())) : undefined,
      alarm_type: values.alarm_type,
    };

    try {
      if (alarm?.id) {
        await alarmsApi.update(alarm.id, payload);
      } else {
        await alarmsApi.create(payload);
      }
      await dispatch(fetchAlarms());
      navigation.goBack();
    } catch (err: any) {
      console.warn('Failed to save alarm', err);
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>{alarm ? 'Edit Alarm' : 'Create Alarm'}</Text>

      <Controller
        control={control}
        name="label"
        render={({ field: { onChange, value } }) => <FormInput label="Label" value={value} onChangeText={onChange} placeholder="Morning alarm" />}
      />

      <Controller
        control={control}
        name="time"
        render={({ field: { onChange, value } }) => <FormInput label="Time (HH:MM)" value={value} onChangeText={onChange} placeholder="06:30" />}
      />

      <Controller
        control={control}
        name="days_of_week"
        render={({ field: { onChange, value } }) => (
          <FormInput label="Days (comma of numbers 0=Sun)" value={value} onChangeText={onChange} placeholder="1,2,3" />
        )}
      />

      <View style={styles.row}>
        <Text style={styles.label}>Active</Text>
        <Controller
          control={control}
          name="is_active"
          render={({ field: { onChange, value } }) => <Switch value={value} onValueChange={onChange} />}
        />
      </View>

      <AppButton title={alarm ? 'Save changes' : 'Create alarm'} onPress={handleSubmit(onSubmit)} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '700', color: theme.colors.text, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  label: { fontSize: 16, color: theme.colors.text },
});
