import 'package:flutter/material.dart';

import '../../../core/services/notification_service.dart';
import '../../../core/themes/app_theme.dart';
import '../../alarm/screens/alarm_list_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Nuera'),
        centerTitle: true,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Good Morning 👋',
              style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            const Text(
              'Time to wake your mind.',
              style: TextStyle(color: Colors.grey),
            ),
            const SizedBox(height: 20),
            Card(
              child: ListTile(
                leading: const Icon(
                  Icons.alarm,
                  size: 40,
                  color: NueraColors.indigo,
                ),
                title: const Text(
                  '06:30 AM',
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                ),
                subtitle: const Text('Morning Workout'),
                trailing: const Icon(Icons.arrow_forward_ios),
              ),
            ),
            const SizedBox(height: 30),
            const Text(
              'Quick Actions',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                ElevatedButton.icon(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => const AlarmListScreen(),
                      ),
                    );
                  },
                  icon: const Icon(Icons.add_alarm),
                  label: const Text('Add Alarm'),
                ),
                OutlinedButton.icon(
                  onPressed: () {},
                  icon: const Icon(Icons.bar_chart),
                  label: const Text('Analytics'),
                ),
              ],
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: NueraColors.dawnCoral,
        onPressed: () async {
          await NotificationService.showNotification();
        },
        child: const Icon(Icons.notifications, color: Colors.white),
      ),
    );
  }
}