import 'package:cognitive_alarm_platform/data/models/admin_dashboard_model.dart';


class AdminDashboardRepository {
  AdminDashboardRepository();

  Future<AdminDashboardModel> getAdminDashboard() async {
    // --- REAL VERSION (once endpoint is confirmed) ---
    // final response = await apiClient.get('/admin/analytics');
    // return AdminDashboardModel.fromJson(response);

    // --- STUB VERSION (current) ---
    await Future.delayed(const Duration(milliseconds: 300));
    return AdminDashboardModel.stub();
  }
}