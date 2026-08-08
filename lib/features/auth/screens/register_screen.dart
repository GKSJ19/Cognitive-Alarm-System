import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:cognitive_alarm_platform/core/providers/auth_provider.dart';
import 'package:cognitive_alarm_platform/core/routes/app.routes.dart';
import 'package:cognitive_alarm_platform/core/themes/app_theme.dart';
import 'package:cognitive_alarm_platform/core/widgets/auth_header.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final TextEditingController usernameController = TextEditingController();
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  final TextEditingController confirmPasswordController = TextEditingController();

  bool _isGoogleSigningIn = false;
  bool _isRegistering = false;

  @override
  void dispose() {
    usernameController.dispose();
    emailController.dispose();
    passwordController.dispose();
    confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _handleRegister() async {
    final username = usernameController.text.trim();
    final email = emailController.text.trim();
    final password = passwordController.text;

    if (username.isEmpty || email.isEmpty || password.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Please fill in all fields")),
      );
      return;
    }

    if (password != confirmPasswordController.text) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Passwords do not match")),
      );
      return;
    }

    setState(() => _isRegistering = true);
    try {
      // Registers against the backend (not Firebase) — matches what
      // loginWithBackend checks. Backend's UserCreate model has no
      // "full_name" field, only username.
      await ref.read(authRepositoryProvider).registerWithBackend(
        username: username,
        email: email,
        password: password,
      );

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Account created! Please log in.')),
      );

      // Registration doesn't return tokens (only /auth/login does), so
      // send them to login rather than straight into the app.
      if (Navigator.canPop(context)) {
        Navigator.pop(context);
      } else {
        context.go(AppRoutes.login);
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Registration failed: $e")),
      );
    } finally {
      if (mounted) setState(() => _isRegistering = false);
    }
  }

  Future<void> _handleGoogleSignIn() async {
    setState(() => _isGoogleSigningIn = true);
    try {
      final loggedIn = await ref.read(authRepositoryProvider).loginWithGoogle();
      if (!mounted) return;
      if (!loggedIn) return; // user cancelled the Google picker
      context.go(AppRoutes.home);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Google sign-in failed: $e")),
      );
    } finally {
      if (mounted) setState(() => _isGoogleSigningIn = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            children: [
              const AuthHeader(
                icon: Icons.person_add_alt_1_outlined,
                title: 'Create account',
                subtitle: 'Set up your profile to start training your mornings',
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(24, 28, 24, 24),
                child: Column(
                  children: [
                    AuthTextField(
                      controller: usernameController,
                      label: 'Username',
                      icon: Icons.person_outline,
                    ),
                    const SizedBox(height: 16),
                    AuthTextField(
                      controller: emailController,
                      label: 'Email',
                      icon: Icons.mail_outline,
                      keyboardType: TextInputType.emailAddress,
                    ),
                    const SizedBox(height: 16),
                    AuthTextField(
                      controller: passwordController,
                      label: 'Password',
                      icon: Icons.lock_outline,
                      obscureText: true,
                    ),
                    const SizedBox(height: 16),
                    AuthTextField(
                      controller: confirmPasswordController,
                      label: 'Confirm password',
                      icon: Icons.lock_outline,
                      obscureText: true,
                    ),
                    const SizedBox(height: 28),
                    SizedBox(
                      width: double.infinity,
                      height: 52,
                      child: ElevatedButton(
                        onPressed: _isRegistering ? null : _handleRegister,
                        child: _isRegistering
                            ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                            : const Text('Create account', style: TextStyle(fontSize: 16)),
                      ),
                    ),
                    const SizedBox(height: 20),
                    const AuthDivider(),
                    const SizedBox(height: 20),
                    GoogleSignInButton(
                      isLoading: _isGoogleSigningIn,
                      onPressed: _handleGoogleSignIn,
                      label: 'Sign up with Google',
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
