import { MD3DarkTheme } from 'react-native-paper';

export const COLORS = {
  primary: '#A58BFF',            // Vibrant soft purple / lavender accent
  primaryDark: '#8A67FF',
  primaryLight: '#C4B5FF',
  secondary: '#B49BFF',
  secondaryContainer: '#2D2545',
  accent: '#A58BFF',
  
  background: '#0D0B14',         // Deep midnight violet/black background
  cardBackground: '#1A1626',     // Translucent dark purple card background
  surface: '#1A1626',            // Dark paper surface
  surfaceVariant: '#262036',     // Secondary surface / inputs
  
  primaryText: '#FFFFFF',        // Pure white for headers/active text
  secondaryText: '#A098BA',      // Soft muted lavender-gray
  mutedText: '#6D6586',          // Subdued text
  
  border: 'rgba(165, 139, 255, 0.18)',
  cardBorder: 'rgba(255, 255, 255, 0.08)',
  cardShadow: 'rgba(165, 139, 255, 0.15)',
  primaryContainer: '#2B2342',
  onPrimaryContainer: '#E2D9FF',
  onSecondaryContainer: '#B8A8FF',

  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',

  switchTrackActive: '#A58BFF',
  switchTrackInactive: '#352D4A',
  switchThumbActive: '#FFFFFF',
  switchThumbInactive: '#8A85A5',
  activePill: '#A58BFF',
  inactivePill: '#262036',
  bottomWave: '#B49BFF',
};

export const ICAPTheme = {
  ...MD3DarkTheme,
  dark: true,
  roundness: 20,
  colors: {
    ...MD3DarkTheme.colors,
    primary: COLORS.primary,
    onPrimary: '#0D0B14',
    primaryContainer: COLORS.primaryContainer,
    onPrimaryContainer: COLORS.onPrimaryContainer,
    
    secondary: COLORS.secondary,
    onSecondary: '#0D0B14',
    secondaryContainer: COLORS.secondaryContainer,
    onSecondaryContainer: COLORS.onSecondaryContainer,
    
    background: COLORS.background,
    onBackground: COLORS.primaryText,
    
    surface: COLORS.surface,
    onSurface: COLORS.primaryText,
    surfaceVariant: COLORS.surfaceVariant,
    onSurfaceVariant: COLORS.secondaryText,
    
    error: COLORS.error,
    onError: '#FFFFFF',
    
    outline: COLORS.border,
    placeholder: COLORS.mutedText,
    backdrop: 'rgba(13, 11, 20, 0.85)',
  },
};

export type AppTheme = typeof ICAPTheme;



