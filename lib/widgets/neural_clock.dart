import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

/// The pulsing concentric-rings clock face — the app's signature visual.
/// Three rings breathe outward on staggered delays, evoking a calm
/// neural/brainwave pulse while idle.
class NeuralClock extends StatefulWidget {
  final String timeLabel;
  final String subLabel;

  const NeuralClock({super.key, required this.timeLabel, required this.subLabel});

  @override
  State<NeuralClock> createState() => _NeuralClockState();
}

class _NeuralClockState extends State<NeuralClock> with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(milliseconds: 3400))..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 220,
      height: 220,
      child: Stack(
        alignment: Alignment.center,
        children: [
          AnimatedBuilder(
            animation: _controller,
            builder: (context, _) => CustomPaint(
              size: const Size(220, 220),
              painter: _RingsPainter(_controller.value),
            ),
          ),
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(widget.timeLabel, style: AppTextStyles.mono(size: 38, weight: FontWeight.w500)),
              const SizedBox(height: 4),
              Text(
                widget.subLabel.toUpperCase(),
                style: AppTextStyles.body(size: 12, color: AppColors.textDim).copyWith(letterSpacing: 1.2),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _RingsPainter extends CustomPainter {
  final double t; // 0..1 animation progress
  _RingsPainter(this.t);

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    _ring(canvas, center, 66, t, 0.0);
    _ring(canvas, center, 82, t, 0.15);
    _ring(canvas, center, 98, t, 0.3);
  }

  void _ring(Canvas canvas, Offset center, double baseRadius, double t, double delay) {
    final phase = ((t - delay) % 1.0 + 1.0) % 1.0;
    final scale = 1.0 + 0.06 * (0.5 - (phase - 0.5).abs()) * 2;
    final opacity = 0.9 - 0.5 * (0.5 - (phase - 0.5).abs()) * 2;
    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.2
      ..color = AppColors.mint.withOpacity(opacity.clamp(0.2, 0.9));
    canvas.drawCircle(center, baseRadius * scale, paint);
  }

  @override
  bool shouldRepaint(covariant _RingsPainter oldDelegate) => oldDelegate.t != t;
}
