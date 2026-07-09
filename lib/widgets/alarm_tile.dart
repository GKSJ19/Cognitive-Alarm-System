import 'package:flutter/material.dart';
import '../models/models.dart';
import '../theme/app_theme.dart';

class AlarmTile extends StatelessWidget {
  final Alarm alarm;
  final VoidCallback onToggle;

  const AlarmTile({super.key, required this.alarm, required this.onToggle});

  @override
  Widget build(BuildContext context) {
    final timeStr =
        '${alarm.time.hour.toString().padLeft(2, '0')}:${alarm.time.minute.toString().padLeft(2, '0')}';
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
      decoration: BoxDecoration(
        color: AppColors.bgElev,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.line),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(timeStr, style: AppTextStyles.mono(size: 22, weight: FontWeight.w500)),
              const SizedBox(height: 2),
              Text(
                '${alarm.mode.label} · ${alarm.active ? 'active' : 'off'}',
                style: AppTextStyles.body(size: 12, color: AppColors.textDim),
              ),
            ],
          ),
          Switch(
            value: alarm.active,
            onChanged: (_) => onToggle(),
            activeColor: AppColors.mint,
            activeTrackColor: AppColors.mintDim,
            inactiveThumbColor: AppColors.textDim,
            inactiveTrackColor: AppColors.line,
          ),
        ],
      ),
    );
  }
}
