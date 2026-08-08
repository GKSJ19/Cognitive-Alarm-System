// core/widgets/nuera_mark.dart
import 'package:flutter/material.dart';
import '../themes/app_theme.dart';


class NueraMark extends StatelessWidget {
  final double size;
  final Color iconColor;

  const NueraMark({
    super.key,
    this.size = 58,
    this.iconColor = Colors.white,
  });

  @override
  Widget build(BuildContext context) {

    final badgeSize = size * (26 / 58);
    final badgeIconSize = size * (14 / 58);
    final offset = size * (14 / 58);

    return SizedBox(
      width: size + offset,
      height: size + offset,
      child: Stack(
        alignment: Alignment.center,
        children: [
          Icon(
            Icons.self_improvement_rounded,
            size: size,
            color: iconColor,
          ),
          Positioned(
            top: 0,
            right: 0,
            child: Container(
              width: badgeSize,
              height: badgeSize,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: NueraColors.dawnCoral,
                border: Border.all(
                  color: Colors.white.withValues(alpha: 0.85),
                  width: size * (1.6 / 58),
                ),
                boxShadow: [
                  BoxShadow(
                    color: NueraColors.dawnCoral.withValues(alpha: 0.55),
                    blurRadius: size * (10 / 58),
                    spreadRadius: size * (1 / 58),
                  ),
                ],
              ),
              child: Icon(
                Icons.auto_awesome_rounded,
                size: badgeIconSize,
                color: Colors.white,
              ),
            ),
          ),
        ],
      ),
    );
  }
}