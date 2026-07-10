import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { splashTheme, typography, radius, spacing } from './colors';
import BackgroundShapes from './BackgroundShapes';
import ClockIcon from './ClockIcon';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export default function SplashScreen({ navigation }: Props) {
  useEffect(() => {
    // Auto-advance once "loading" finishes. Swap this timeout for your real
    // bootstrap logic (auth check, fetching config, etc.) later.
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={splashTheme.background} />

      {/* Interactive background — draggable geometric shapes, layered
          behind everything else via render order + zIndex below. */}
      <BackgroundShapes preset="splash" />

      {/* Content is centered as one vertical group in the middle of the
          screen now that the old empty hero box is gone — no more dead
          space between the wordmark and the bottom of the screen. */}
      <View style={styles.content} pointerEvents="box-none">
        {/* Pagination dots + progress pill */}
        <View style={styles.dotsRow}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.progressPill} />
        </View>

        {/* Wordmark — "BRAIN 'CLOCK' ", a single centered row.
            The apostrophes on either side of the clock icon are the
            literal quote marks the wordplay needs (as in "brain
            o'clock"), now with the clock standing in for the "o". The
            whole group sits centered as one line via the row's
            justifyContent, instead of the previous diagonal stagger. */}
        <View style={styles.titleRow}>
          <Text style={styles.title}>BRAIN</Text>
          <Text style={styles.quote}>'</Text>
          <View style={styles.clockSlot}>
            <ClockIcon size={56} startX={0} startY={0} />
          </View>
          <Text style={styles.quote}>'</Text>
          <Text style={styles.title}>CLOCK</Text>
        </View>

        <Text style={styles.tagline}>Wake up. Prove it. Own your morning.</Text>

        <Text style={styles.loadingText}>Loading ...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: splashTheme.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    // Centers the wordmark group in the middle of the screen now that
    // there's no hero card below it competing for space.
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10, // sits above the draggable background shapes
  },
  dotsRow: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.circle,
    backgroundColor: splashTheme.dotInactive,
    marginRight: spacing.xs,
  },
  progressPill: {
    width: 56,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: splashTheme.accent,
    marginLeft: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  title: {
    // fontFamily falls back to system bold automatically if the custom
    // font hasn't finished loading yet — see App.tsx for the useFonts setup.
    fontFamily: typography.splashBold,
    fontWeight: '700',
    fontSize: 32,
    letterSpacing: 1,
    color: splashTheme.textPrimary,
  },
  quote: {
    fontFamily: typography.splashBold,
    fontWeight: '700',
    fontSize: 32,
    color: splashTheme.accent,
  },
  clockSlot: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 1,
  },
  tagline: {
    marginTop: spacing.md,
    textAlign: 'center',
    fontFamily: typography.splashMedium,
    fontSize: 14,
    color: 'rgba(255,255,255,0.55)',
  },
  loadingText: {
    textAlign: 'center',
    fontFamily: typography.splashMedium,
    fontSize: 13,
    color: splashTheme.loadingText,
    marginTop: spacing.xl,
  },
});
