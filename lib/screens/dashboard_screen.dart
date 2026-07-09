import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/models.dart';
import '../state/app_state.dart';
import '../theme/app_theme.dart';
import '../widgets/alarm_tile.dart';
import '../widgets/neural_clock.dart';
import 'alarm_ring_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  TimeOfDay _newAlarmTime = const TimeOfDay(hour: 7, minute: 0);
  PuzzleMode _newAlarmMode = PuzzleMode.mixed;
  bool _navigatingToRing = false;

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    final data = app.data;

    // Push the full-screen puzzle whenever a session becomes active.
    if (app.activeSession != null && !_navigatingToRing) {
      _navigatingToRing = true;
      WidgetsBinding.instance.addPostFrameCallback((_) async {
        await Navigator.of(context).push(
          MaterialPageRoute(builder: (_) => const AlarmRingScreen(), fullscreenDialog: true),
        );
        _navigatingToRing = false;
      });
    }

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 40),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _topBar(app),
              const SizedBox(height: 12),
              Center(
                child: NeuralClock(
                  timeLabel:
                      '${app.now.hour.toString().padLeft(2, '0')}:${app.now.minute.toString().padLeft(2, '0')}',
                  subLabel: _nextAlarmLabel(data),
                ),
              ),
              const SizedBox(height: 26),
              _sectionLabel('Alarms'),
              if (data.alarms.isEmpty)
                _emptyNote('No alarms yet. Add one below.')
              else
                ...data.alarms.map((a) => AlarmTile(alarm: a, onToggle: () => app.toggleAlarm(a.id))),
              const SizedBox(height: 14),
              _addAlarmRow(app),
              const SizedBox(height: 10),
              OutlinedButton(
                onPressed: () => app.fireAlarm(_newAlarmMode),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: AppColors.line),
                  foregroundColor: AppColors.textDim,
                  padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                child: Text('▶ Test alarm (uses selected puzzle type above)', style: AppTextStyles.body(size: 12, color: AppColors.textDim)),
              ),
              const SizedBox(height: 26),
              _sectionLabel('Wake performance'),
              _statsGrid(data),
              const SizedBox(height: 26),
              _sectionLabel('Recent wake log'),
              if (data.log.isEmpty)
                _emptyNote('No wake events yet. Run a test alarm to see it here.')
              else
                ...data.log.map(_logRow),
            ],
          ),
        ),
      ),
    );
  }

  String _nextAlarmLabel(UserData data) {
    final active = data.alarms.where((a) => a.active).toList()
      ..sort((a, b) => (a.time.hour * 60 + a.time.minute).compareTo(b.time.hour * 60 + b.time.minute));
    if (active.isEmpty) return 'no active alarm';
    final t = active.first.time;
    return 'next: ${t.hour.toString().padLeft(2, '0')}:${t.minute.toString().padLeft(2, '0')}';
  }

  Widget _topBar(AppState app) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            SizedBox(width: 26, height: 26, child: CustomPaint(painter: _LogoDot())),
            const SizedBox(width: 8),
            Text('Lucid', style: AppTextStyles.display(size: 18)),
          ],
        ),
        Row(
          children: [
            _streakPill(app.data.streak),
            const SizedBox(width: 8),
            _userChip(app),
          ],
        ),
      ],
    );
  }

  Widget _streakPill(int streak) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: AppColors.bgElev,
          border: Border.all(color: AppColors.line),
          borderRadius: BorderRadius.circular(100),
        ),
        child: Text('🔥 $streak day streak', style: AppTextStyles.mono(size: 12, color: AppColors.amber)),
      );

  Widget _userChip(AppState app) => Container(
        padding: const EdgeInsets.only(left: 12, right: 4, top: 4, bottom: 4),
        decoration: BoxDecoration(
          color: AppColors.bgElev,
          border: Border.all(color: AppColors.line),
          borderRadius: BorderRadius.circular(100),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            CircleAvatar(
              radius: 10,
              backgroundColor: AppColors.violetDim,
              child: Text(
                (app.currentUser ?? '?').substring(0, 1).toUpperCase(),
                style: AppTextStyles.mono(size: 10, weight: FontWeight.w600, color: AppColors.violet),
              ),
            ),
            const SizedBox(width: 6),
            Text(app.currentUser ?? '', style: AppTextStyles.body(size: 12, color: AppColors.textDim)),
            IconButton(
              icon: const Icon(Icons.logout, size: 14, color: AppColors.textDim),
              onPressed: app.logout,
              splashRadius: 16,
            ),
          ],
        ),
      );

  Widget _sectionLabel(String text) => Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: Text(
          text.toUpperCase(),
          style: AppTextStyles.mono(size: 11, color: AppColors.textDim).copyWith(letterSpacing: 1.2),
        ),
      );

  Widget _emptyNote(String text) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Text(text, style: AppTextStyles.body(size: 13, color: AppColors.textDim)),
      );

  Widget _addAlarmRow(AppState app) {
    return Row(
      children: [
        Expanded(
          child: InkWell(
            onTap: () async {
              final picked = await showTimePicker(context: context, initialTime: _newAlarmTime);
              if (picked != null) setState(() => _newAlarmTime = picked);
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
              decoration: BoxDecoration(
                color: AppColors.bgElev,
                border: Border.all(color: AppColors.line),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                '${_newAlarmTime.hour.toString().padLeft(2, '0')}:${_newAlarmTime.minute.toString().padLeft(2, '0')}',
                style: AppTextStyles.mono(size: 15),
              ),
            ),
          ),
        ),
        const SizedBox(width: 10),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10),
          decoration: BoxDecoration(
            color: AppColors.bgElev,
            border: Border.all(color: AppColors.line),
            borderRadius: BorderRadius.circular(10),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<PuzzleMode>(
              value: _newAlarmMode,
              dropdownColor: AppColors.bgElev2,
              style: AppTextStyles.body(size: 13),
              items: PuzzleMode.values
                  .map((m) => DropdownMenuItem(value: m, child: Text(m.label)))
                  .toList(),
              onChanged: (m) => setState(() => _newAlarmMode = m ?? PuzzleMode.mixed),
            ),
          ),
        ),
        const SizedBox(width: 10),
        ElevatedButton(
          onPressed: () => app.addAlarm(_newAlarmTime, _newAlarmMode),
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.mint,
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
          child: Text('Add', style: AppTextStyles.body(size: 14, weight: FontWeight.w600, color: const Color(0xFF062018))),
        ),
      ],
    );
  }

  Widget _statsGrid(UserData data) {
    final avg = data.log.isEmpty
        ? '—'
        : '${(data.log.map((l) => l.solveSeconds).reduce((a, b) => a + b) / data.log.length).round()}s';
    final eng = data.log.isEmpty
        ? '—'
        : '${(data.log.map((l) => l.engagementScore).reduce((a, b) => a + b) / data.log.length).round()}';
    return Row(
      children: [
        Expanded(child: _statCard(avg, 'Avg solve time')),
        const SizedBox(width: 10),
        Expanded(child: _statCard(eng, 'Engagement score')),
      ],
    );
  }

  Widget _statCard(String value, String label) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: AppColors.bgElev,
          border: Border.all(color: AppColors.line),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(value, style: AppTextStyles.display(size: 26)),
            const SizedBox(height: 2),
            Text(label.toUpperCase(), style: AppTextStyles.body(size: 11, color: AppColors.textDim).copyWith(letterSpacing: 0.6)),
          ],
        ),
      );

  Widget _logRow(WakeLogEntry l) {
    final t = l.time;
    final timeStr = '${t.hour.toString().padLeft(2, '0')}:${t.minute.toString().padLeft(2, '0')}:${t.second.toString().padLeft(2, '0')}';
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(timeStr, style: AppTextStyles.mono(size: 13)),
          Text('${l.solveSeconds}s · ${l.wrongAttempts} wrong', style: AppTextStyles.body(size: 13)),
          Text('${l.engagementScore}', style: AppTextStyles.mono(size: 12, color: AppColors.mint)),
        ],
      ),
    );
  }
}

class _LogoDot extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final paint = Paint()..style = PaintingStyle.stroke..strokeWidth = 1.4;
    canvas.drawCircle(center, size.width * 0.43, paint..color = AppColors.mint.withOpacity(0.9));
    canvas.drawCircle(center, size.width * 0.27, paint..color = AppColors.mint.withOpacity(0.6));
    canvas.drawCircle(center, size.width * 0.1, Paint()..color = AppColors.mint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
