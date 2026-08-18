import React, { useEffect } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';

import ThemeBackground from '../../components/common/ThemeBackground';

interface SplashScreenProps {
  navigation: any;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { bootstrapSession } = useAuth();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Check session
    const checkSessionAndNavigate = async () => {
      // Small artificial delay to show splash aesthetics
      const delay = new Promise((resolve) => setTimeout(resolve, 2000));
      
      let sessionLoaded = false;
      try {
        const session = await bootstrapSession();
        if (session) {
          sessionLoaded = true;
        }
      } catch (err) {
        console.log('No active session found.');
      }
      
      await delay;

      if (!sessionLoaded) {
        navigation.replace('Login');
      }
    };

    checkSessionAndNavigate();
  }, []);

  return (
    <ThemeBackground>
      <View style={styles.container}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={[styles.logoPlaceholder, { borderColor: '#A58BFF' }]}>
            <Text style={[styles.logoText, { color: '#A58BFF' }]}>ICAP</Text>
          </View>
          <Text style={[styles.title, { color: '#FFFFFF' }]}>
            Intelligent Cognitive Alarm Platform
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Wake Up Your Mind
          </Text>
        </Animated.View>
      </View>
    </ThemeBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#A58BFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    letterSpacing: 1,
  },
});

export default SplashScreen;

