import React, { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { PaperProvider } from 'react-native-paper';
import { store } from './src/store/store';
import { darkTheme } from './src/theme/theme';
import RootNavigator from './src/navigation/RootNavigator';
import SplashScreen from './src/screens/SplashScreen';
import { alarmAudio } from './src/services/audioService';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Unlock audio on the very first user interaction anywhere in the app.
    // After this, alarm sounds will play automatically when the alarm fires.
    alarmAudio.initGlobalUnlock();
  }, []);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <Provider store={store}>
      <PaperProvider theme={darkTheme}>
        <RootNavigator />
      </PaperProvider>
    </Provider>
  );
}
