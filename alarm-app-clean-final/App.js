import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import notifee, { EventType } from '@notifee/react-native';

import { subscribeToAuth } from './src/utils/auth';

import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import HomeScreen from './src/screens/HomeScreen';
import AlarmScreen from './src/screens/AlarmScreen';
import PuzzleScreen from './src/screens/PuzzleScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ChallengesScreen from './src/screens/ChallengesScreen';

const Stack = createNativeStackNavigator();
const navigationRef = React.createRef();

notifee.onBackgroundEvent(async () => {
  // Cold-start routing is handled by getInitialNotification() below.
});

export default function App() {
  const [user, setUser] = useState(undefined); // undefined = loading

  useEffect(() => {
    const unsub = subscribeToAuth(setUser);
    return unsub;
  }, []);

  useEffect(() => {
    (async () => {
      const initial = await notifee.getInitialNotification();
      if (initial) {
        const { alarmId, level } = initial.notification.data ?? {};
        navigationRef.current?.navigate('Puzzle', { alarmId, level });
      }
    })();

    const unsub = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) {
        const { alarmId, level } = detail.notification?.data ?? {};
        navigationRef.current?.navigate('Puzzle', { alarmId, level });
      }
    });

    return unsub;
  }, []);

  if (user === undefined) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#0f1115',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator color="#4f7cff" size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Alarms" component={AlarmScreen} />
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="Challenges" component={ChallengesScreen} />
            <Stack.Screen
              name="Puzzle"
              component={PuzzleScreen}
              options={{ gestureEnabled: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
