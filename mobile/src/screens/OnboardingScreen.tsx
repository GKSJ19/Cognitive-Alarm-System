import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const slides = [
  {
    icon: '🧠',
    title: 'Cognitive Wake-Up',
    description: 'Beat morning grogginess with AI-powered challenges that engage your brain the moment you wake up.',
    gradient: ['#1a1a2e', '#16213e'],
  },
  {
    icon: '⏰',
    title: 'Smart Alarm Scheduling',
    description: 'Set daily, weekday, weekend or one-time alarms. Customize sound, snooze, and vibration to your preference.',
    gradient: ['#0f3460', '#533483'],
  },
  {
    icon: '📊',
    title: 'Track Your Progress',
    description: 'Monitor your sleep patterns and morning productivity over time with intelligent insights.',
    gradient: ['#533483', '#e94560'],
  },
];

export default function OnboardingScreen({ navigation }: any) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.replace('Login');
    }
  };

  const slide = slides[currentIndex];

  return (
    <LinearGradient colors={slide.gradient as any} style={styles.container}>
      <View style={styles.skipContainer}>
        <Button
          mode="text"
          textColor="rgba(255,255,255,0.6)"
          onPress={() => navigation.replace('Login')}
        >
          Skip
        </Button>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{slide.icon}</Text>
        </View>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.description}>{slide.description}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.dotsContainer}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>
        <Button
          mode="contained"
          onPress={handleNext}
          style={styles.button}
          contentStyle={styles.buttonContent}
          buttonColor="#6366f1"
        >
          {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
        </Button>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  skipContainer: {
    alignItems: 'flex-end',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  icon: {
    fontSize: 64,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  footer: {
    alignItems: 'center',
    gap: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: '#6366f1',
  },
  dotInactive: {
    width: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  button: {
    width: width - 48,
    borderRadius: 30,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});
