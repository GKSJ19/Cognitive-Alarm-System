import 'dart:io' show Platform;
import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';

import 'package:cognitive_alarm_platform/core/themes/app_theme.dart';

/// Warns the user their alarms may not fire reliably if the OS is allowed
/// to kill the app in the background, and gives a one-tap fix.
///
/// Re-checks permission status every time the app resumes (not just once),
/// because OEMs like ColorOS/MIUI are known to silently re-revoke battery
/// exemptions after the user grants them — a banner that only checks once
/// at startup will miss that and give a false sense of safety.
///
/// Dismissal is session-only: if the user dismisses it but the OS later
/// revokes the exemption again, the banner comes back. It should never be
/// possible to permanently silence a real reliability problem.
class BatteryOptimizationBanner extends StatefulWidget {
  const BatteryOptimizationBanner({super.key});

  @override
  State<BatteryOptimizationBanner> createState() =>
      _BatteryOptimizationBannerState();
}

class _BatteryOptimizationBannerState extends State<BatteryOptimizationBanner>
    with WidgetsBindingObserver {
  bool _needsExemption = false;
  bool _dismissedThisSession = false;
  bool _checked = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _checkStatus();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    // Re-check whenever the user comes back — e.g. after visiting settings,
    // or after the OEM has silently revoked the exemption in the background.
    if (state == AppLifecycleState.resumed) {
      _checkStatus();
    }
  }

  Future<void> _checkStatus() async {
    if (!Platform.isAndroid) {
      setState(() {
        _needsExemption = false;
        _checked = true;
      });
      return;
    }
    final status = await Permission.ignoreBatteryOptimizations.status;
    if (!mounted) return;
    setState(() {
      final wasExempt = !_needsExemption && _checked;
      _needsExemption = !status.isGranted;
      _checked = true;
      // If the exemption was just re-revoked after being granted, surface
      // the banner again even if the user dismissed it earlier this session.
      if (_needsExemption && wasExempt) {
        _dismissedThisSession = false;
      }
    });
  }

  Future<void> _requestExemption() async {
    final result = await Permission.ignoreBatteryOptimizations.request();
    if (!mounted) return;
    if (!result.isGranted) {
      // Standard Android dialog didn't grant it (or this is an OEM like
      // ColorOS with its own extra whitelist) — fall back to app settings
      // and tell the user what to look for.
      _showColorOSFallbackDialog();
    } else {
      setState(() => _needsExemption = false);
    }
  }

  void _showColorOSFallbackDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('One more step for this device'),
        content: const Text(
          'Some phone makers (like ColorOS/MIUI) have their own battery '
              'and auto-start settings on top of Android\'s. In the settings '
              'screen that opens, look for "Auto-start" or "Battery" for this '
              'app and make sure both are allowed — otherwise alarms may not '
              'fire when the app is closed.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () {
              Navigator.of(ctx).pop();
              openAppSettings();
            },
            child: const Text('Open settings'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (!_checked || !_needsExemption || _dismissedThisSession) {
      return const SizedBox.shrink();
    }

    return AnimatedContainer(
      duration: const Duration(milliseconds: 250),
      curve: Curves.easeOut,
      margin: const EdgeInsets.fromLTRB(16, 8, 16, 0),
      child: Material(
        borderRadius: BorderRadius.circular(14),
        color: NueraColors.dawnAmber.withValues(alpha: 0.12),
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: NueraColors.dawnAmber.withValues(alpha: 0.35),
              width: 1,
            ),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: NueraColors.dawnAmber.withValues(alpha: 0.18),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.battery_alert_rounded,
                  color: NueraColors.dawnAmber,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Alarms may not go off',
                      style: Theme.of(context)
                          .textTheme
                          .titleSmall
                          ?.copyWith(fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Your phone can silently stop this app in the '
                          'background. Exempt it from battery optimization so '
                          'alarms fire on time.',
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        FilledButton.tonal(
                          onPressed: _requestExemption,
                          style: FilledButton.styleFrom(
                            backgroundColor:
                            NueraColors.dawnAmber.withValues(alpha: 0.22),
                            foregroundColor: NueraColors.indigoDeep,
                            padding: const EdgeInsets.symmetric(
                                horizontal: 14, vertical: 8),
                            minimumSize: Size.zero,
                            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                          ),
                          child: const Text('Fix now'),
                        ),
                        const SizedBox(width: 4),
                        TextButton(
                          onPressed: () =>
                              setState(() => _dismissedThisSession = true),
                          child: const Text('Not now'),
                        ),
                      ],
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