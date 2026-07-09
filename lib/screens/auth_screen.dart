import 'package:flutter/material.dart';
import 'package:flutter/gestures.dart';
import 'package:provider/provider.dart';
import '../state/app_state.dart';
import '../theme/app_theme.dart';

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  bool _showRegister = false;

  final _loginUser = TextEditingController();
  final _loginPass = TextEditingController();
  final _regUser = TextEditingController();
  final _regPass = TextEditingController();
  final _regPass2 = TextEditingController();

  String? _error;

  void _doLogin(AppState app) {
    final err = app.login(_loginUser.text.trim(), _loginPass.text);
    setState(() => _error = err);
  }

  void _doRegister(AppState app) {
    final err = app.register(_regUser.text.trim(), _regPass.text, _regPass2.text);
    setState(() => _error = err);
  }

  @override
  Widget build(BuildContext context) {
    final app = context.read<AppState>();
    return Scaffold(
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 380),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                _Brand(),
                const SizedBox(height: 36),
                Container(
                  padding: const EdgeInsets.all(26),
                  decoration: BoxDecoration(
                    color: AppColors.bgElev,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: AppColors.line),
                  ),
                  child: _showRegister ? _registerForm(app) : _loginForm(app),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _loginForm(AppState app) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text('Welcome back', style: AppTextStyles.display()),
        const SizedBox(height: 4),
        Text('Log in to your alarms and wake history.', style: AppTextStyles.body(size: 13, color: AppColors.textDim)),
        const SizedBox(height: 22),
        _label('Username'),
        TextField(controller: _loginUser, style: AppTextStyles.body(), decoration: const InputDecoration(hintText: 'e.g. arjun')),
        const SizedBox(height: 16),
        _label('Password'),
        TextField(controller: _loginPass, obscureText: true, style: AppTextStyles.body(), decoration: const InputDecoration(hintText: '••••••••')),
        const SizedBox(height: 8),
        if (_error != null) Text(_error!, style: AppTextStyles.body(size: 12, color: AppColors.violet)),
        const SizedBox(height: 10),
        _primaryButton('Log in', () => _doLogin(app)),
        const SizedBox(height: 16),
        _switchRow('New here?', 'Create an account', () => setState(() { _showRegister = true; _error = null; })),
      ],
    );
  }

  Widget _registerForm(AppState app) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text('Create account', style: AppTextStyles.display()),
        const SizedBox(height: 4),
        Text('Takes 10 seconds. No email needed for this demo.', style: AppTextStyles.body(size: 13, color: AppColors.textDim)),
        const SizedBox(height: 22),
        _label('Username'),
        TextField(controller: _regUser, style: AppTextStyles.body(), decoration: const InputDecoration(hintText: 'pick a username')),
        const SizedBox(height: 16),
        _label('Password'),
        TextField(controller: _regPass, obscureText: true, style: AppTextStyles.body(), decoration: const InputDecoration(hintText: 'min 4 characters')),
        const SizedBox(height: 16),
        _label('Confirm password'),
        TextField(controller: _regPass2, obscureText: true, style: AppTextStyles.body(), decoration: const InputDecoration(hintText: 'repeat password')),
        const SizedBox(height: 8),
        if (_error != null) Text(_error!, style: AppTextStyles.body(size: 12, color: AppColors.violet)),
        const SizedBox(height: 10),
        _primaryButton('Create account', () => _doRegister(app)),
        const SizedBox(height: 16),
        _switchRow('Already have an account?', 'Log in', () => setState(() { _showRegister = false; _error = null; })),
      ],
    );
  }

  Widget _label(String text) => Padding(
        padding: const EdgeInsets.only(bottom: 6),
        child: Text(text, style: AppTextStyles.body(size: 12, color: AppColors.textDim)),
      );

  Widget _primaryButton(String label, VoidCallback onTap) => SizedBox(
        width: double.infinity,
        child: ElevatedButton(
          onPressed: onTap,
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.mint,
            foregroundColor: const Color(0xFF062018),
            padding: const EdgeInsets.symmetric(vertical: 14),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
          child: Text(label, style: AppTextStyles.body(size: 14, weight: FontWeight.w600, color: const Color(0xFF062018))),
        ),
      );

  Widget _switchRow(String lead, String action, VoidCallback onTap) => Center(
        child: RichText(
          text: TextSpan(
            style: AppTextStyles.body(size: 13, color: AppColors.textDim),
            children: [
              TextSpan(text: '$lead '),
              TextSpan(
                text: action,
                style: AppTextStyles.body(size: 13, color: AppColors.mint),
                recognizer: TapGestureRecognizer()..onTap = onTap,
              ),
            ],
          ),
        ),
      );
}

class _Brand extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        SizedBox(
          width: 30,
          height: 30,
          child: CustomPaint(painter: _LogoPainter()),
        ),
        const SizedBox(width: 10),
        Text('Lucid', style: AppTextStyles.display(size: 19)),
      ],
    );
  }
}

class _LogoPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final paint = Paint()..style = PaintingStyle.stroke..strokeWidth = 1.5..color = AppColors.mint;
    canvas.drawCircle(center, size.width * 0.43, paint..color = AppColors.mint.withOpacity(0.9));
    canvas.drawCircle(center, size.width * 0.27, paint..color = AppColors.mint.withOpacity(0.6));
    canvas.drawCircle(center, size.width * 0.1, Paint()..color = AppColors.mint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
