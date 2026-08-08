import 'package:flutter/material.dart';

/// Generic stat display used across User, Coach, and Admin dashboards.
/// Keep this dumb/data-driven — no dashboard-specific logic here.
class StatCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color? accentColor;

  /// Optional: e.g. "+12%" or "-3 this week". Shown in a smaller,
  /// muted line under the value. Pass null to omit.
  final String? trendLabel;
  final bool trendIsPositive;

  const StatCard({
    super.key,
    required this.label,
    required this.value,
    required this.icon,
    this.accentColor,
    this.trendLabel,
    this.trendIsPositive = true,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final color = accentColor ?? theme.colorScheme.primary;

    return Card(
      elevation: 1,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, size: 20, color: color),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    label,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              value,
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            if (trendLabel != null) ...[
              const SizedBox(height: 4),
              Text(
                trendLabel!,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: trendIsPositive ? Colors.green : Colors.redAccent,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}