import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { COLORS } from '../../theme/theme';

interface ThemeBackgroundProps {
  children: React.ReactNode;
  showWave?: boolean;
}

const { width } = Dimensions.get('window');

export const ThemeBackground: React.FC<ThemeBackgroundProps> = ({ children, showWave = true }) => {
  return (
    <View style={styles.container}>
      {/* Soft glowing ambient bubbles matching the theme design */}
      <View style={styles.topOrb} />
      <View style={styles.centerOrb} />
      <View style={styles.rightOrb} />

      {/* Screen Content */}
      <View style={styles.content}>{children}</View>

      {/* Signature bottom lavender organic wave shape from design */}
      {showWave && (
        <View pointerEvents="none" style={styles.bottomWaveContainer}>
          <View style={styles.waveLayer1} />
          <View style={styles.waveLayer2} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    position: 'relative',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    zIndex: 2,
  },
  topOrb: {
    position: 'absolute',
    top: -60,
    left: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(165, 139, 255, 0.12)',
    zIndex: 1,
  },
  centerOrb: {
    position: 'absolute',
    top: '35%',
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(165, 139, 255, 0.08)',
    zIndex: 1,
  },
  rightOrb: {
    position: 'absolute',
    bottom: 120,
    left: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(180, 155, 255, 0.09)',
    zIndex: 1,
  },
  bottomWaveContainer: {
    position: 'absolute',
    bottom: -30,
    left: -20,
    right: -20,
    height: 120,
    zIndex: 1,
  },
  waveLayer1: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: width + 40,
    height: 110,
    backgroundColor: 'rgba(180, 155, 255, 0.45)',
    borderTopLeftRadius: 180,
    borderTopRightRadius: 100,
    transform: [{ rotate: '-4deg' }],
  },
  waveLayer2: {
    position: 'absolute',
    bottom: -15,
    left: -10,
    width: width + 60,
    height: 100,
    backgroundColor: '#B49BFF',
    borderTopLeftRadius: 160,
    borderTopRightRadius: 140,
    opacity: 0.85,
    transform: [{ rotate: '2deg' }],
  },
});

export default ThemeBackground;
