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

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const handleLogin = () => {
    // Frontend only — wire this up to your auth call later.
    console.log('Login pressed', { email, password, rememberMe });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={authTheme.background} />

      {/* Interactive background — draggable geometric shapes kept toward
          the edges so they stay clear of the form the user needs to tap. */}
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

          <View style={styles.rowBetween}>
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

            <TouchableOpacity>
              <Text style={styles.link}>Forgot password</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin} activeOpacity={0.85}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>

          <Text style={styles.orText}>Or</Text>

          <View style={styles.socialRow}>
            <SocialButton provider="google" style={{ marginRight: spacing.sm }} />
            <SocialButton provider="apple" />
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account ? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={[styles.link, styles.linkUnderline]}>Sign up</Text>
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
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
