import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { authTheme, radius, spacing } from './colors';
import AuthInput from './AuthInput';
import SocialButton from './SocialButton';
import BackgroundShapes from './BackgroundShapes';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

export default function SignUpScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSignUp = () => {
    // Frontend only — wire this up to your auth call later.
    console.log('Sign up pressed', { email, password, confirmPassword, rememberMe });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={authTheme.background} />

      <BackgroundShapes preset="auth" />

      <KeyboardAvoidingView
        style={{ flex: 1, zIndex: 10 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <AuthInput
            icon="mail"
            placeholder="Enter Your Email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <AuthInput
            icon="lock"
            placeholder="Password"
            isPassword
            value={password}
            onChangeText={setPassword}
          />

          <AuthInput
            icon="lock"
            placeholder="Confirm Password"
            isPassword
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <TouchableOpacity
            style={styles.rememberRow}
            onPress={() => setRememberMe((r) => !r)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
              {rememberMe && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.rememberText}>Remember me</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginButton} onPress={handleSignUp} activeOpacity={0.85}>
            <Text style={styles.loginButtonText}>Sign Up</Text>
          </TouchableOpacity>

          <Text style={styles.orText}>Or</Text>

          <View style={styles.socialRow}>
            <SocialButton provider="google" style={{ marginRight: spacing.sm }} />
            <SocialButton provider="apple" />
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account ? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.link, styles.linkUnderline]}>Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: authTheme.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    justifyContent: 'center',
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: authTheme.checkboxBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  checkboxChecked: {
    backgroundColor: authTheme.checkboxFill,
    borderColor: authTheme.checkboxFill,
  },
  checkmark: {
    color: authTheme.checkmarkColor,
    fontSize: 10,
    lineHeight: 12,
  },
  rememberText: {
    fontSize: 12.5,
    color: authTheme.textSecondary,
  },
  link: {
    fontSize: 12.5,
    color: authTheme.accent,
    fontWeight: '600',
  },
  linkUnderline: {
    textDecorationLine: 'underline',
  },
  loginButton: {
    backgroundColor: authTheme.accent,
    height: 48,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  orText: {
    textAlign: 'center',
    fontSize: 12.5,
    color: authTheme.textSecondary,
    marginBottom: spacing.md,
  },
  socialRow: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 12.5,
    color: authTheme.textPrimary,
  },
});
