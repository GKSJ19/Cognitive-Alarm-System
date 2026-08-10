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
    primary: '#3B82F6',       // Vibrant Blue
    onPrimary: '#FFFFFF',
    primaryContainer: '#1E3A8A', // Darker Blue
    onPrimaryContainer: '#93C5FD',
    
    secondary: '#8B5CF6',     // Violet
    onSecondary: '#FFFFFF',
    secondaryContainer: '#4C1D95',
    onSecondaryContainer: '#DDD6FE',
    
    background: '#0B0F19',    // Very Dark Blue-Gray
    onBackground: '#F1F5F9',  // Light text
    
    surface: '#1E293B',       // Slate-800 Surface
    onSurface: '#F1F5F9',     // Light text
    surfaceVariant: '#0F172A', // Slate-900 Dark surface
    onSurfaceVariant: '#94A3B8',
    
    error: '#EF4444',
    onError: '#FFFFFF',
    
    outline: '#334155',
    placeholder: '#64748B',
  },
};

export type AppTheme = typeof ICAPTheme;
