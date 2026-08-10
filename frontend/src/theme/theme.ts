import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const ICAPTheme = {
  ...MD3LightTheme,
  roundness: 12,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2563EB',       // Modern Blue
    onPrimary: '#FFFFFF',
    primaryContainer: '#DBEAFE',
    onPrimaryContainer: '#1E40AF',
    
    secondary: '#7C3AED',     // Deep Violet
    onSecondary: '#FFFFFF',
    secondaryContainer: '#EDE9FE',
    onSecondaryContainer: '#5B21B6',
    
    background: '#F8FAFC',    // Soft Slate Gray/White
    onBackground: '#0F172A',  // Slate-900 Dark text
    
    surface: '#FFFFFF',       // Pure White Surface
    onSurface: '#1E293B',     // Slate-800 Dark text
    surfaceVariant: '#F1F5F9',
    onSurfaceVariant: '#475569',
    
    error: '#DC2626',         // Coral Red
    onError: '#FFFFFF',
    
    outline: '#CBD5E1',       // Light gray borders
    placeholder: '#94A3B8',
  },
};

export const ICAPDarkTheme = {
  ...MD3DarkTheme,
  roundness: 12,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#60A5FA',       // Brighter blue for dark bg
    onPrimary: '#1E3A8A',
    primaryContainer: '#1E3A8A',
    onPrimaryContainer: '#BFDBFE',
    
    secondary: '#A78BFA',     // Lighter violet for dark bg
    onSecondary: '#4C1D95',
    secondaryContainer: '#5B21B6',
    onSecondaryContainer: '#DDD6FE',
    
    background: '#0F172A',    // Slate-900 (deep navy)
    onBackground: '#E2E8F0',  // Slate-200 (bright text)
    
    surface: '#1E293B',       // Slate-800 (clearly lighter than bg)
    onSurface: '#E2E8F0',     // Slate-200 (bright text on cards)
    surfaceVariant: '#334155', // Slate-700 (visible variant)
    onSurfaceVariant: '#CBD5E1', // Slate-300 (readable secondary text)
    
    error: '#F87171',         // Lighter red for dark bg
    onError: '#7F1D1D',
    
    outline: '#475569',       // Slate-600 (visible borders)
    placeholder: '#94A3B8',   // Slate-400
    
    elevation: {
      level0: 'transparent',
      level1: '#1E293B',
      level2: '#283548',
      level3: '#334155',
      level4: '#3D4F68',
      level5: '#475569',
    },
  },
};

export type AppTheme = typeof ICAPTheme;
