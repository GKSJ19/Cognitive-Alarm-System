import 'package:flutter/material.dart';

import 'package:cognitive_alarm_platform/core/themes/app_theme.dart';
import 'package:cognitive_alarm_platform/features/alarm/models/alarm_model.dart';

/// Small pill-tag row shown under an alarm's label on the alarm list:
/// challenge type, an "Adaptive" tag (only when the backend has actually
/// confirmed it — see AlarmModel.isAdaptive doc comment), and whether this
/// alarm fires on-device or via a server trigger.
class AlarmTagRow extends StatelessWidget {
  final AlarmModel alarm;
  const AlarmTagRow({super.key, required this.alarm});

  String get _challengeLabel {
    switch (alarm.challengeType) {
      case 'math':
        return 'Math';
      case 'shake':
        return 'Shake';
      case 'memory':
        return 'Memory';
      case 'qr':
        return 'QR scan';
      case 'photo':
        return 'Photo';
      case 'typing':
        return 'Typing';
      case 'puzzle':
        return 'Puzzle';
      default:
        return alarm.challengeType;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 6,
      runSpacing: 4,
      children: [
        _Tag(
          label: _challengeLabel,
          color: NueraColors.indigo,
        ),
        if (alarm.isAdaptive)
          const _Tag(
            label: 'Adaptive',
            color: NueraColors.dawnAmber,
            icon: Icons.auto_awesome_rounded,
          ),
        _Tag(
          label: alarm.scheduledVia == 'device' ? 'On device' : 'Server',
          color: Colors.grey,
          icon: alarm.scheduledVia == 'device'
              ? Icons.phone_android_rounded
              : Icons.cloud_outlined,
          subtle: true,
        ),
      ],
    );
  }
}

class _Tag extends StatelessWidget {
  final String label;
  final Color color;
  final IconData? icon;
  final bool subtle;

  const _Tag({
    required this.label,
    required this.color,
    this.icon,
    this.subtle = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: subtle ? 0.08 : 0.14),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 11, color: color),
            const SizedBox(width: 3),
          ],
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: subtle ? Colors.grey[700] : color,
            ),
          ),
        ],
      ),
    );
  }
}