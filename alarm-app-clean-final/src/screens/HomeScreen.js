import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { currentUser, signOut } from '../utils/auth';
import { getAlarms, getDashboardStats } from '../utils/storage';

export default function HomeScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [nextAlarm, setNextAlarm] = useState(null);
  const user = currentUser();

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const s = await getDashboardStats();
        const alarms = await getAlarms();
        const enabled = alarms
          .filter((a) => a.enabled)
          .sort((a, b) => a.timestamp - b.timestamp);
        setStats(s);
        setNextAlarm(enabled[0] ?? null);
      })();
    }, [])
  );

  const firstName = (user?.displayName || 'there').split(' ')[0];

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.greeting}>Hi, {firstName}</Text>
        <TouchableOpacity onPress={() => signOut()}>
          <Text style={styles.signOut}>Sign out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.nextCard}>
        <Text style={styles.nextLabel}>Next alarm</Text>
        <Text style={styles.nextTime}>
          {nextAlarm
            ? new Date(nextAlarm.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'None set'}
        </Text>
      </View>

      <View style={styles.grid}>
        <TouchableOpacity
          style={styles.tile}
          onPress={() => navigation.navigate('Alarms')}
        >
          <Text style={styles.tileTitle}>Alarms</Text>
          <Text style={styles.tileSub}>Set & manage</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tile}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <Text style={styles.tileTitle}>Dashboard</Text>
          <Text style={styles.tileSub}>
            {stats?.totalAlarms ? `Habit score: ${stats.habitScore}` : 'No data yet'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tile}
          onPress={() => navigation.navigate('Challenges')}
        >
          <Text style={styles.tileTitle}>Challenges</Text>
          <Text style={styles.tileSub}>
            {stats?.currentStreak ? `${stats.currentStreak}-day streak` : 'Get started'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1115', padding: 20 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  greeting: { color: '#fff', fontSize: 26, fontWeight: '700' },
  signOut: { color: '#8a8f98' },
  nextCard: {
    backgroundColor: '#1c1f26',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
  },
  nextLabel: { color: '#8a8f98' },
  nextTime: { color: '#fff', fontSize: 32, fontWeight: '700', marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 20 },
  tile: {
    backgroundColor: '#1c1f26',
    borderRadius: 14,
    padding: 18,
    width: '47%',
  },
  tileTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  tileSub: { color: '#8a8f98', marginTop: 4 },
});
