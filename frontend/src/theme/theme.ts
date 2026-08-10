import { MD3LightTheme } from 'react-native-paper';

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
export type AppTheme = typeof ICAPTheme;

