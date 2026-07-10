import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dart:math' as math;

import '../../../core/themes/app_theme.dart';
import 'login_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with TickerProviderStateMixin {
  late final AnimationController _controller;
  late final AnimationController _entranceController;
  late final Animation<double> _logoScale;
  late final Animation<double> _logoFade;
  late final Animation<double> _titleFade;
  late final Animation<Offset> _titleSlide;
  late final Animation<double> _taglineFade;
  late final Animation<double> _glowPulse;

  @override
  void initState() {
    super.initState();

    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2200),
    )..repeat(reverse: true, period: const Duration(seconds: 2));

    // One-shot entrance controller (separate from the looping glow pulse).
    _entranceController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1100),
    )..forward();

    _logoScale = Tween<double>(begin: 0.6, end: 1.0).animate(
      CurvedAnimation(
        parent: _entranceController,
        curve: const Interval(0.0, 0.6, curve: Curves.elasticOut),
      ),
    );
    _logoFade = CurvedAnimation(
      parent: _entranceController,
      curve: const Interval(0.0, 0.4, curve: Curves.easeOut),
    );
    _titleFade = CurvedAnimation(
      parent: _entranceController,
      curve: const Interval(0.35, 0.7, curve: Curves.easeOut),
    );
    _titleSlide = Tween<Offset>(
      begin: const Offset(0, 0.3),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(
        parent: _entranceController,
        curve: const Interval(0.35, 0.7, curve: Curves.easeOut),
      ),
    );
    _taglineFade = CurvedAnimation(
      parent: _entranceController,
      curve: const Interval(0.55, 0.85, curve: Curves.easeOut),
    );
    _glowPulse = Tween<double>(begin: 0.55, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );

    Future.delayed(const Duration(seconds: 3), () {
      if (!mounted) return;
      Navigator.pushReplacement(
        context,
        PageRouteBuilder(
          transitionDuration: const Duration(milliseconds: 500),
          pageBuilder: (_, animation, __) => FadeTransition(
            opacity: animation,
            child: const LoginScreen(),
          ),
        ),
      );
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    _entranceController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    return Scaffold(
      body: Stack(
        fit: StackFit.expand,
        children: [
          // Base gradient — deep navy to slate for a calm, corporate feel.
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Color(0xFF0A0F1C),
                  Color(0xFF141F33),
                  Color(0xFF223449),
                ],
                stops: [0.0, 0.55, 1.0],
              ),
            ),
          ),

          // Decorative soft blobs — subtle, low-saturation depth rather
          // than bright accent color washes.
          Positioned(
            top: -size.width * 0.25,
            right: -size.width * 0.2,
            child: _SoftGlow(
              diameter: size.width * 0.8,
              color: const Color(0xFF3E5C7A).withValues(alpha: 0.22),
            ),
          ),
          Positioned(
            bottom: -size.width * 0.3,
            left: -size.width * 0.25,
            child: _SoftGlow(
              diameter: size.width * 0.9,
              color: const Color(0xFF1F3A52).withValues(alpha: 0.28),
            ),
          ),

          // Faint scattered "spark" dots for texture.
          const Positioned.fill(child: _SparkField()),

          // Foreground content.
          SafeArea(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Spacer(flex: 3),

                // Logo with pulsing glow + glass ring.
                AnimatedBuilder(
                  animation: Listenable.merge([_controller, _logoScale]),
                  builder: (context, child) {
                    return FadeTransition(
                      opacity: _logoFade,
                      child: Transform.scale(
                        scale: _logoScale.value,
                        child: child,
                      ),
                    );
                  },
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      AnimatedBuilder(
                        animation: _glowPulse,
                        builder: (context, _) => Container(
                          width: 150,
                          height: 150,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: NueraColors.dawnCoral
                                    .withValues(alpha: 0.35 * _glowPulse.value),
                                blurRadius: 50,
                                spreadRadius: 6,
                              ),
                            ],
                          ),
                        ),
                      ),
                      Container(
                        width: 118,
                        height: 118,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: LinearGradient(
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                            colors: [
                              Colors.white.withValues(alpha: 0.22),
                              Colors.white.withValues(alpha: 0.06),
                            ],
                          ),
                          border: Border.all(
                            color: Colors.white.withValues(alpha: 0.35),
                            width: 1.2,
                          ),
                        ),
                        child: const _NueraMark(),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 28),

                // Title with a slow shimmer sweep and lifted shadow.
                SlideTransition(
                  position: _titleSlide,
                  child: FadeTransition(
                    opacity: _titleFade,
                    child: AnimatedBuilder(
                      animation: _controller,
                      builder: (context, child) {
                        final t = _controller.value; // 0 -> 1 -> 0 (looping)
                        return ShaderMask(
                          blendMode: BlendMode.srcIn,
                          shaderCallback: (bounds) => LinearGradient(
                            begin: Alignment(-1.6 + t * 3.2, 0),
                            end: Alignment(0.4 + t * 3.2, 0),
                            colors: const [
                              Colors.white,
                              Color(0xFFFFE1D6),
                              Colors.white,
                            ],
                            stops: const [0.3, 0.5, 0.7],
                          ).createShader(bounds),
                          child: child,
                        );
                      },
                      child: Text(
                        'Nuera',
                        style: GoogleFonts.comfortaa(
                          fontSize: 46,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                          letterSpacing: 1.2,
                          height: 1.0,
                          shadows: [
                            Shadow(
                              color: Colors.black.withValues(alpha: 0.28),
                              blurRadius: 18,
                              offset: const Offset(0, 6),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 14),

                FadeTransition(
                  opacity: _taglineFade,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 18,
                      vertical: 7,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.10),
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(
                        color: Colors.white.withValues(alpha: 0.28),
                        width: 1,
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 6,
                          height: 6,
                          decoration: const BoxDecoration(
                            shape: BoxShape.circle,
                            color: NueraColors.dawnCoral,
                          ),
                        ),
                        const SizedBox(width: 9),
                        Text(
                          'WAKE YOUR MIND',
                          style: GoogleFonts.comfortaa(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            letterSpacing: 3,
                            color: Colors.white.withValues(alpha: 0.85),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                const Spacer(flex: 3),

                // Refined loading indicator: three softly pulsing dots.
                FadeTransition(
                  opacity: _taglineFade,
                  child: const _PulsingDots(),
                ),

                const SizedBox(height: 40),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// A soft, blurred circular glow used as a decorative background accent.
class _SoftGlow extends StatelessWidget {
  final double diameter;
  final Color color;

  const _SoftGlow({required this.diameter, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: diameter,
      height: diameter,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: RadialGradient(
          colors: [color, color.withValues(alpha: 0.0)],
        ),
      ),
    );
  }
}

/// Scattered faint dots painted once for subtle texture across the screen.
class _SparkField extends StatelessWidget {
  const _SparkField();

  @override
  Widget build(BuildContext context) {
    return CustomPaint(painter: _SparkPainter());
  }
}

class _SparkPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final rand = math.Random(7); // fixed seed => stable layout
    final paint = Paint()..color = Colors.white.withValues(alpha: 0.22);

    for (int i = 0; i < 24; i++) {
      final dx = rand.nextDouble() * size.width;
      final dy = rand.nextDouble() * size.height;
      final radius = rand.nextDouble() * 1.3 + 0.4;
      paint.color = Colors.white.withValues(alpha: rand.nextDouble() * 0.20 + 0.04);
      canvas.drawCircle(Offset(dx, dy), radius, paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

/// Three dots that gently pulse in sequence — a friendlier loading cue
/// than a bare CircularProgressIndicator.
class _PulsingDots extends StatefulWidget {
  const _PulsingDots();

  @override
  State<_PulsingDots> createState() => _PulsingDotsState();
}

class _PulsingDotsState extends State<_PulsingDots>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, _) {
        return Row(
          mainAxisSize: MainAxisSize.min,
          children: List.generate(3, (i) {
            final t = (_controller.value - i * 0.2) % 1.0;
            final scale = 0.6 + 0.4 * (0.5 + 0.5 * math.sin(t * 2 * math.pi));
            return Padding(
              padding: const EdgeInsets.symmetric(horizontal: 5),
              child: Transform.scale(
                scale: scale,
                child: Container(
                  width: 10,
                  height: 10,
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    color: NueraColors.dawnCoral,
                  ),
                ),
              ),
            );
          }),
        );
      },
    );
  }
}

/// The Nuera logo mark: a calm "mind" figure with a small awakening spark
/// badge layered on top — reads as an intentional logo rather than a bare
/// stock icon.
class _NueraMark extends StatelessWidget {
  const _NueraMark();

  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: Alignment.center,
      children: [
        const Icon(
          Icons.self_improvement_rounded,
          size: 58,
          color: Colors.white,
        ),
        Positioned(
          top: 14,
          right: 14,
          child: Container(
            width: 26,
            height: 26,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: NueraColors.dawnCoral,
              border: Border.all(color: Colors.white.withValues(alpha: 0.85), width: 1.6),
              boxShadow: [
                BoxShadow(
                  color: NueraColors.dawnCoral.withValues(alpha: 0.55),
                  blurRadius: 10,
                  spreadRadius: 1,
                ),
              ],
            ),
            child: const Icon(
              Icons.auto_awesome_rounded,
              size: 14,
              color: Colors.white,
            ),
          ),
        ),
      ],
    );
  }
}