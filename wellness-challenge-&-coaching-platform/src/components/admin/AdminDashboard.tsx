import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  UserCheck,
  Clock,
  Activity,
  Award,
  PlusCircle,
  Trash2,
  Edit,
  Key,
  Shield,
  Search,
  CheckCircle2,
  XCircle,
  BarChart3,
  Megaphone,
  TrendingUp,
  Sliders,
  Settings,
  Database,
  FileText,
  Bell,
  RefreshCw,
  Trophy,
  Tag,
  Zap,
  Lock,
  Download,
  Upload,
  UserPlus,
  AlertTriangle,
} from 'lucide-react';
import { UserRole } from '../../types';

export const AdminDashboard: React.FC = () => {
  const {
    analytics,
    users,
    updateUserRole,
    assignUserToCoach,
    deleteUser,
    addUser,
    announcements,
    addAnnouncement,
    challenges,
    addChallenge,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'coaches' | 'platform' | 'analytics' | 'system'>('dashboard');

  // Search filter states
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [coachSearchTerm, setCoachSearchTerm] = useState('');

  // Coach Assignment, Removal, Delete & Toast States
  const [assigningCoach, setAssigningCoach] = useState<any | null>(null);
  const [assignSearchTerm, setAssignSearchTerm] = useState('');
  const [coachToast, setCoachToast] = useState<string | null>(null);
  const [coachToRemove, setCoachToRemove] = useState<any | null>(null);
  const [userToDelete, setUserToDelete] = useState<any | null>(null);

  // User Management States
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('user');

  // Edit User Modal
  const [editUser, setEditUser] = useState<{ id: string; name: string; email: string; role: UserRole; isActive: boolean } | null>(null);

  // User status mapping (Active / Deactivated)
  const [userStatuses, setUserStatuses] = useState<Record<string, boolean>>({
    'usr-1': true,
    'cch-1': true,
    'adm-1': true,
  });

  // Coach Management States
  const [showAddCoachModal, setShowAddCoachModal] = useState(false);
  const [coachName, setCoachName] = useState('');
  const [coachEmail, setCoachEmail] = useState('');

  // Platform Management States (Categories, Notifications, Recommendations)
  const [categories, setCategories] = useState<string[]>(['Cognitive Wake-up', 'Sleep Hygiene', 'Mindfulness', 'Morning Routine']);
  const [newCategory, setNewCategory] = useState('');

  // Announcement Modal State
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annPriority, setAnnPriority] = useState<'normal' | 'high' | 'urgent'>('normal');

  // System Settings State
  const [systemSettingTheme, setSystemSettingTheme] = useState('Emerald Minimalist');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Backup / Restore UI Toast state
  const [sysLog, setSysLog] = useState<string | null>(null);

  // Calculated Stats
  const totalUsers = users.length;
  const totalCoaches = users.filter((u) => u.role === 'coach').length;
  const totalActiveAlarms = 24;
  const dailyActiveUsers = analytics.dailyActiveUsers || 840;
  const platformUsage = '98%';
  const avgHabitScore = 93; // %

  // Handlers
  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    addUser({
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
    });

    setNewUserName('');
    setNewUserEmail('');
    setShowAddUserModal(false);
  };

  const handleAddCoachSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coachName.trim() || !coachEmail.trim()) return;

    addUser({
      name: coachName,
      email: coachEmail,
      role: 'coach',
    });

    setCoachName('');
    setCoachEmail('');
    setShowAddCoachModal(false);
  };

  const handleToggleUserStatus = (userId: string) => {
    setUserStatuses((prev) => ({
      ...prev,
      [userId]: prev[userId] === undefined ? false : !prev[userId],
    }));
  };

  const handleResetPassword = (userName: string) => {
    setCoachToast(`Password reset link generated and sent to ${userName}!`);
    setTimeout(() => setCoachToast(null), 4000);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    setCategories((prev) => [...prev, newCategory.trim()]);
    setNewCategory('');
  };

  const handleAddAnnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;

    addAnnouncement({
      title: annTitle,
      content: annContent,
      priority: annPriority,
    });

    setAnnTitle('');
    setAnnContent('');
    setShowAnnModal(false);
  };

  const handleRemoveCoach = (coach: any) => {
    setCoachToRemove(coach);
  };

  const confirmRemoveCoach = (coach: any) => {
    if (!coach) return;
    // Unassign all users assigned to this coach
    users
      .filter((u) => u.assignedCoachId === coach.id)
      .forEach((client) => {
        assignUserToCoach(client.id, null);
      });

    updateUserRole(coach.id, 'user');
    setCoachToRemove(null);
    setCoachToast(`Removed coach status from ${coach.name}. Updated role to Standard Member.`);
    setTimeout(() => setCoachToast(null), 4000);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  const coachUsers = users.filter(
    (u) =>
      u.role === 'coach' &&
      (u.name.toLowerCase().includes(coachSearchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(coachSearchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      
      {/* 👨‍💼 Admin Header Dashboard Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              System Admin Console
            </span>
            <span className="text-xs text-slate-300">Emulator System Active</span>
          </div>

          <h1 className="text-xl font-extrabold tracking-tight">
            Administrator Workspace 👨‍💼
          </h1>
          <p className="text-xs text-slate-300">
            Complete platform management: user accounts, coaches, categories, notifications, system analytics, and security controls.
          </p>
        </div>

        {/* Dashboard Stat Overview (6 Key requested metrics) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 bg-slate-900/95 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-white/15 text-center shadow-md w-full">
          <div className="p-3 bg-white/10 rounded-xl border border-white/10 flex flex-col items-center justify-center text-center space-y-1 min-w-0 h-full w-full">
            <p className="text-2xl sm:text-3xl font-black text-purple-200 leading-none whitespace-nowrap">{totalUsers}</p>
            <p className="text-xs text-slate-200 uppercase font-extrabold tracking-tight leading-tight text-center whitespace-normal break-words">Total Users</p>
          </div>
          <div className="p-3 bg-white/10 rounded-xl border border-white/10 flex flex-col items-center justify-center text-center space-y-1 min-w-0 h-full w-full">
            <p className="text-2xl sm:text-3xl font-black text-emerald-300 leading-none whitespace-nowrap">{totalCoaches}</p>
            <p className="text-xs text-slate-200 uppercase font-extrabold tracking-tight leading-tight text-center whitespace-normal break-words">Coaches</p>
          </div>
          <div className="p-3 bg-white/10 rounded-xl border border-white/10 flex flex-col items-center justify-center text-center space-y-1 min-w-0 h-full w-full">
            <p className="text-2xl sm:text-3xl font-black text-amber-300 leading-none whitespace-nowrap">{totalActiveAlarms}</p>
            <p className="text-xs text-slate-200 uppercase font-extrabold tracking-tight leading-tight text-center whitespace-normal break-words">Active Alarms</p>
          </div>
          <div className="p-3 bg-white/10 rounded-xl border border-white/10 flex flex-col items-center justify-center text-center space-y-1 min-w-0 h-full w-full">
            <p className="text-2xl sm:text-3xl font-black text-cyan-300 leading-none whitespace-nowrap">{dailyActiveUsers}</p>
            <p className="text-xs text-slate-200 uppercase font-extrabold tracking-tight leading-tight text-center whitespace-normal break-words">DAU</p>
          </div>
          <div className="p-3 bg-white/10 rounded-xl border border-white/10 flex flex-col items-center justify-center text-center space-y-1 min-w-0 h-full w-full">
            <p className="text-2xl sm:text-3xl font-black text-indigo-200 leading-none whitespace-nowrap">{platformUsage}</p>
            <p className="text-xs text-slate-200 uppercase font-extrabold tracking-tight leading-tight text-center whitespace-normal break-words">Platform Usage</p>
          </div>
          <div className="p-3 bg-white/10 rounded-xl border border-white/10 flex flex-col items-center justify-center text-center space-y-1 min-w-0 h-full w-full">
            <p className="text-2xl sm:text-3xl font-black text-teal-300 leading-none whitespace-nowrap">{avgHabitScore}%</p>
            <p className="text-xs text-slate-200 uppercase font-extrabold tracking-tight leading-tight text-center whitespace-normal break-words">Avg Habit</p>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation Bar */}
      <div className="flex items-center space-x-1.5 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: Activity },
          { id: 'users', label: 'User Management', icon: Users },
          { id: 'coaches', label: 'Coach Management', icon: UserCheck },
          { id: 'platform', label: 'Platform Management', icon: Sliders },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          { id: 'system', label: 'System & Settings', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                isActive
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION 1: DASHBOARD OVERVIEW */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col items-center justify-between text-center space-y-1.5 min-w-0 h-full min-h-[110px]">
              <span className="text-xs text-slate-700 font-extrabold uppercase tracking-tight leading-tight text-center whitespace-normal break-words">Total Users</span>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 leading-none whitespace-nowrap py-0.5">{totalUsers}</p>
              <p className="text-xs text-purple-700 font-extrabold leading-tight text-center whitespace-normal break-words">Members & Staff</p>
            </div>

            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col items-center justify-between text-center space-y-1.5 min-w-0 h-full min-h-[110px]">
              <span className="text-xs text-slate-700 font-extrabold uppercase tracking-tight leading-tight text-center whitespace-normal break-words">Total Coaches</span>
              <p className="text-2xl sm:text-3xl font-black text-emerald-700 leading-none whitespace-nowrap py-0.5">{totalCoaches}</p>
              <p className="text-xs text-emerald-700 font-extrabold leading-tight text-center whitespace-normal break-words">Assigned to clients</p>
            </div>

            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col items-center justify-between text-center space-y-1.5 min-w-0 h-full min-h-[110px]">
              <span className="text-xs text-slate-700 font-extrabold uppercase tracking-tight leading-tight text-center whitespace-normal break-words">Active Alarms</span>
              <p className="text-2xl sm:text-3xl font-black text-amber-700 leading-none whitespace-nowrap py-0.5">{totalActiveAlarms}</p>
              <p className="text-xs text-amber-700 font-extrabold leading-tight text-center whitespace-normal break-words">Cognitive alarms set</p>
            </div>

            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col items-center justify-between text-center space-y-1.5 min-w-0 h-full min-h-[110px]">
              <span className="text-xs text-slate-700 font-extrabold uppercase tracking-tight leading-tight text-center whitespace-normal break-words">Daily Active Users</span>
              <p className="text-2xl sm:text-3xl font-black text-cyan-800 leading-none whitespace-nowrap py-0.5">{dailyActiveUsers}</p>
              <p className="text-xs text-cyan-800 font-extrabold leading-tight text-center whitespace-normal break-words">Active this morning</p>
            </div>

            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col items-center justify-between text-center space-y-1.5 min-w-0 h-full min-h-[110px]">
              <span className="text-xs text-slate-700 font-extrabold uppercase tracking-tight leading-tight text-center whitespace-normal break-words">Platform Usage</span>
              <p className="text-2xl sm:text-3xl font-black text-indigo-800 leading-none whitespace-nowrap py-0.5">{platformUsage}</p>
              <p className="text-xs text-indigo-800 font-extrabold leading-tight text-center whitespace-normal break-words">Server uptime</p>
            </div>

            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col items-center justify-between text-center space-y-1.5 min-w-0 h-full min-h-[110px]">
              <span className="text-xs text-slate-700 font-extrabold uppercase tracking-tight leading-tight text-center whitespace-normal break-words">Avg Habit Score</span>
              <p className="text-2xl sm:text-3xl font-black text-teal-800 leading-none whitespace-nowrap py-0.5">{avgHabitScore}%</p>
              <p className="text-xs text-teal-800 font-extrabold leading-tight text-center whitespace-normal break-words">Routine adherence</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider text-purple-700">
                System Role Allocations
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-800">Members (Standard Users)</span>
                  <span className="text-base font-black text-slate-900">{users.filter(u => u.role === 'user').length}</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-cyan-50 rounded-xl text-cyan-950 border border-cyan-200">
                  <span className="font-bold">Wellness Coaches</span>
                  <span className="text-base font-black text-cyan-900">{totalCoaches}</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-purple-50 rounded-xl text-purple-950 border border-purple-200">
                  <span className="font-bold">System Administrators</span>
                  <span className="text-base font-black text-purple-900">{users.filter(u => u.role === 'admin').length}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider text-purple-700">
                Platform Performance
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center p-2.5 bg-emerald-50 rounded-xl text-emerald-950 border border-emerald-200">
                  <span className="font-bold">Zero-Snooze Rate</span>
                  <span className="text-base font-black text-emerald-900">95.2%</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-amber-50 rounded-xl text-amber-950 border border-amber-200">
                  <span className="font-bold">Avg Alarm Solve Speed</span>
                  <span className="text-base font-black text-amber-900">12.8s</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-indigo-50 rounded-xl text-indigo-950 border border-indigo-200">
                  <span className="font-bold">Challenge Proof Submissions</span>
                  <span className="text-base font-black text-indigo-900">100% Approved</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                <Users className="w-4 h-4 text-purple-600" />
                <span>User Management Console</span>
              </h3>
              <p className="text-xs text-slate-500">Add, edit, activate/deactivate, delete users, assign roles, or reset passwords</p>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none w-48 sm:w-60"
                />
              </div>

              <button
                onClick={() => setShowAddUserModal(true)}
                className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 shadow-2xs whitespace-nowrap"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add User</span>
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredUsers.map((u) => {
              const isActive = userStatuses[u.id] !== false;

              return (
                <div key={u.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-300" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-xs font-bold text-slate-800">{u.name}</h4>
                        <span className={`text-[9px] font-bold px-2 py-0.2 rounded-full uppercase ${
                          u.role === 'admin' ? 'bg-purple-100 text-purple-800' : u.role === 'coach' ? 'bg-cyan-100 text-cyan-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {u.role}
                        </span>
                        <span className={`text-[9px] font-bold px-2 py-0.2 rounded-full uppercase ${
                          isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">{u.email} • Joined {u.joinedDate}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Role selector */}
                    <select
                      value={u.role}
                      onChange={(e) => updateUserRole(u.id, e.target.value as UserRole)}
                      className="text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    >
                      <option value="user">User</option>
                      <option value="coach">Coach</option>
                      <option value="admin">Admin</option>
                    </select>

                    {/* Activate/Deactivate Toggle */}
                    <button
                      onClick={() => handleToggleUserStatus(u.id)}
                      className={`px-2.5 py-1.5 text-xs font-bold rounded-xl border transition-colors ${
                        isActive
                          ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {isActive ? 'Deactivate' : 'Activate'}
                    </button>

                    {/* Reset Password UI */}
                    <button
                      onClick={() => handleResetPassword(u.name)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center space-x-1"
                      title="Reset Password"
                    >
                      <Key className="w-3.5 h-3.5 text-slate-500" />
                      <span>Reset Pwd</span>
                    </button>

                    {/* Delete User */}
                    <button
                      onClick={() => setUserToDelete(u)}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold cursor-pointer"
                      title="Delete User"
                    >
                      <Trash2 className="w-4 h-4 text-rose-600" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 3: COACH MANAGEMENT */}
      {activeTab === 'coaches' && (
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-5">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-purple-600 flex-shrink-0" />
                <span>Coach Management & Roster Assignment</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Add coaches, assign client rosters, remove coach status, or monitor coaching performance.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 sm:w-48 min-w-[140px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter coaches..."
                  value={coachSearchTerm}
                  onChange={(e) => setCoachSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
              <button
                onClick={() => setShowAddCoachModal(true)}
                className="px-3.5 py-2 bg-purple-700 hover:bg-purple-800 active:scale-[0.98] text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-2xs transition-all whitespace-nowrap"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Coach</span>
              </button>
            </div>
          </div>

          {/* Toast Notification */}
          {coachToast && (
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-purple-900 text-xs font-bold flex items-center space-x-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <span>{coachToast}</span>
            </div>
          )}

          {/* Coach Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {coachUsers.length === 0 ? (
              <div className="col-span-full p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-sm font-bold text-slate-600">No coaches found.</p>
                <p className="text-xs text-slate-400 mt-1">Click "Add Coach" or promote a user to Coach role in User Management.</p>
              </div>
            ) : (
              coachUsers.map((coach) => {
                const assignedClientsCount = users.filter((u) => u.assignedCoachId === coach.id).length;
                return (
                  <div key={coach.id} className="p-4 sm:p-5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-4 min-w-0 shadow-2xs">
                    {/* Coach Profile Header */}
                    <div className="flex items-center space-x-3 min-w-0">
                      <img src={coach.avatar} alt={coach.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-cyan-500/60 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-black text-slate-900 truncate">{coach.name}</h4>
                        <p className="text-xs text-slate-500 truncate">{coach.email}</p>
                        <span className="text-[10px] font-extrabold text-cyan-800 bg-cyan-100/90 px-2.5 py-0.5 rounded-full inline-block mt-1 uppercase tracking-tight">
                          Certified Wellness Coach
                        </span>
                      </div>
                    </div>

                    {/* Clean & Spacious Performance Metrics Grid */}
                    <div className="grid grid-cols-3 divide-x divide-slate-100 bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                      <div className="flex flex-col items-center justify-between text-center px-1 py-1 space-y-1.5 min-w-0">
                        <p className="text-[10px] sm:text-xs text-slate-500 font-extrabold uppercase tracking-wider text-center leading-tight truncate w-full">
                          Assigned
                        </p>
                        <p className="text-xs sm:text-sm font-black text-slate-900 leading-none truncate w-full">
                          {assignedClientsCount} {assignedClientsCount === 1 ? 'Client' : 'Clients'}
                        </p>
                      </div>

                      <div className="flex flex-col items-center justify-between text-center px-1 py-1 space-y-1.5 min-w-0">
                        <p className="text-[10px] sm:text-xs text-slate-500 font-extrabold uppercase tracking-wider text-center leading-tight truncate w-full">
                          Habit Rating
                        </p>
                        <p className="text-xs sm:text-sm font-black text-emerald-700 leading-none truncate w-full">
                          96.8%
                        </p>
                      </div>

                      <div className="flex flex-col items-center justify-between text-center px-1 py-1 space-y-1.5 min-w-0">
                        <p className="text-[10px] sm:text-xs text-slate-500 font-extrabold uppercase tracking-wider text-center leading-tight truncate w-full">
                          Performance
                        </p>
                        <p className="text-xs sm:text-sm font-black text-cyan-800 leading-none truncate w-full">
                          Top Tier
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                      <button
                        onClick={() => setAssigningCoach(coach)}
                        className="w-full sm:flex-1 py-2 px-3 bg-purple-700 hover:bg-purple-800 active:scale-[0.98] text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 shadow-2xs transition-all whitespace-nowrap"
                      >
                        <UserPlus className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Assign Users ({assignedClientsCount})</span>
                      </button>
                      <button
                        onClick={() => handleRemoveCoach(coach)}
                        className="w-full sm:flex-1 py-2 px-3 bg-rose-50 hover:bg-rose-100 active:scale-[0.98] text-rose-700 border border-rose-200 text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition-all whitespace-nowrap"
                      >
                        <Trash2 className="w-3.5 h-3.5 flex-shrink-0 text-rose-600" />
                        <span>Remove Coach</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* SECTION 4: PLATFORM MANAGEMENT */}
      {activeTab === 'platform' && (
        <div className="space-y-6">
          {/* Sub-block 1: Manage Challenges & Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider text-purple-700 flex items-center space-x-1.5">
                <Trophy className="w-4 h-4" />
                <span>Manage Challenges ({challenges.length})</span>
              </h3>
              <div className="space-y-2 text-xs">
                {challenges.map((c) => (
                  <div key={c.id} className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
                    <span className="font-semibold text-slate-800">{c.title}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      {c.rewardPoints} Pts
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider text-purple-700 flex items-center space-x-1.5">
                <Tag className="w-4 h-4" />
                <span>Manage Categories ({categories.length})</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat, i) => (
                  <span key={i} className="px-2.5 py-1 bg-purple-50 text-purple-800 border border-purple-200 rounded-xl text-xs font-bold">
                    {cat}
                  </span>
                ))}
              </div>
              <form onSubmit={handleAddCategory} className="flex space-x-2 pt-2">
                <input
                  type="text"
                  placeholder="New Category..."
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="flex-1 text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
                <button type="submit" className="px-3 py-1.5 bg-purple-700 text-white text-xs font-bold rounded-xl">
                  Add
                </button>
              </form>
            </div>
          </div>

          {/* Sub-block 2: Manage Notifications & Announcements & Recommendations */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                  <Megaphone className="w-4 h-4 text-purple-600" />
                  <span>Manage Notifications & Broadcast Announcements</span>
                </h3>
                <p className="text-xs text-slate-500">Publish announcements and set global system recommendations</p>
              </div>

              <button
                onClick={() => setShowAnnModal(true)}
                className="px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-semibold shadow-2xs flex items-center space-x-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Publish Announcement</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {announcements.map((ann) => (
                <div key={ann.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                      {ann.priority}
                    </span>
                    <span className="text-[10px] text-slate-400">{ann.createdAt}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">{ann.title}</h4>
                  <p className="text-xs text-slate-600">{ann.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-xs text-slate-700 font-extrabold uppercase tracking-tight">Platform Statistics</span>
              <p className="text-2xl font-black text-slate-900">100% Operational</p>
              <p className="text-xs text-emerald-700 font-extrabold">Cloud sync active</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-xs text-slate-700 font-extrabold uppercase tracking-tight">Alarm Statistics</span>
              <p className="text-2xl font-black text-amber-700">96.8% Solved</p>
              <p className="text-xs text-amber-700 font-extrabold">First attempt dismissal</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-xs text-slate-700 font-extrabold uppercase tracking-tight">Challenge Statistics</span>
              <p className="text-2xl font-black text-cyan-800">42 Proofs Verified</p>
              <p className="text-xs text-cyan-800 font-extrabold">Active participation</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-xs text-slate-700 font-extrabold uppercase tracking-tight">User Growth</span>
              <p className="text-2xl font-black text-purple-800">+24.5% MoM</p>
              <p className="text-xs text-purple-700 font-extrabold">Consistent expansion</p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 6: SYSTEM & SETTINGS */}
      {activeTab === 'system' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Settings & Role Management */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <Settings className="w-4 h-4 text-purple-600" />
              <span>Platform Settings & Role Management</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">UI Visual Theme</label>
                <select
                  value={systemSettingTheme}
                  onChange={(e) => setSystemSettingTheme(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="Emerald Minimalist">Emerald Minimalist (Default)</option>
                  <option value="Indigo Twilight">Indigo Twilight</option>
                  <option value="Cyan Modern">Cyan Modern</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <h4 className="font-bold text-slate-900">Maintenance Mode</h4>
                  <p className="text-[10px] text-slate-500">Restricts platform login during updates</p>
                </div>
                <button
                  onClick={() => setMaintenanceMode(!maintenanceMode)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs ${
                    maintenanceMode ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {maintenanceMode ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>
            </div>

            {/* Backup / Restore Controls */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <h4 className="text-xs font-bold text-slate-800 flex items-center space-x-1">
                <Database className="w-3.5 h-3.5 text-purple-600" />
                <span>Backup / Restore System (UI)</span>
              </h4>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSysLog('Database snapshot backup generated at ' + new Date().toLocaleTimeString());
                    setTimeout(() => setSysLog(null), 3000);
                  }}
                  className="flex-1 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Backup System</span>
                </button>
                <button
                  onClick={() => {
                    setSysLog('Database state restored to last verified checkpoint.');
                    setTimeout(() => setSysLog(null), 3000);
                  }}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 border border-slate-200"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Restore System</span>
                </button>
              </div>
              {sysLog && (
                <p className="text-[11px] font-bold text-emerald-600 bg-emerald-50 p-2 rounded-xl border border-emerald-200 text-center">
                  {sysLog}
                </p>
              )}
            </div>
          </div>

          {/* Audit Logs */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-purple-600" />
              <span>Security Audit Logs (UI)</span>
            </h3>

            <div className="space-y-2 max-h-72 overflow-y-auto text-xs pr-1">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>Role Permission Updated</span>
                  <span className="text-[10px] text-slate-400">Today 10:12 AM</span>
                </div>
                <p className="text-[11px] text-slate-500">Admin Dr. Elena Rostova assigned coach role to Marcus Vance.</p>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>Cognitive Alarm Challenge Added</span>
                  <span className="text-[10px] text-slate-400">Today 09:45 AM</span>
                </div>
                <p className="text-[11px] text-slate-500">New challenge '30-Day Cognitive Awakening Reset' published.</p>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>Announcement Broadcasted</span>
                  <span className="text-[10px] text-slate-400">Today 08:00 AM</span>
                </div>
                <p className="text-[11px] text-slate-500">Global system announcement published to all active users.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD USER MODAL */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-100 relative">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Add New User Account</h3>
            <form onSubmit={handleAddUserSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Jenkins"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="sarah@wellness.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Assign Role</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="user">User (Member)</option>
                  <option value="coach">Wellness Coach</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-xl shadow-2xs"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD COACH MODAL */}
      {showAddCoachModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-100 relative">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Add Certified Wellness Coach</h3>
            <form onSubmit={handleAddCoachSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Coach Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Coach David Miller"
                  value={coachName}
                  onChange={(e) => setCoachName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="david@wellness.com"
                  value={coachEmail}
                  onChange={(e) => setCoachEmail(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCoachModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-xl shadow-2xs"
                >
                  Add Coach
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BROADCAST ANNOUNCEMENT MODAL */}
      {showAnnModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-100 relative">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Broadcast Announcement / Notification</h3>
            <form onSubmit={handleAddAnnSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Notification Title</label>
                <input
                  type="text"
                  placeholder="e.g. Schedule Maintenance & Feature Rollout"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Priority Level</label>
                <select
                  value={annPriority}
                  onChange={(e) => setAnnPriority(e.target.value as any)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="normal">Normal Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent Priority</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Message Content</label>
                <textarea
                  rows={3}
                  placeholder="Notification content for all users..."
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAnnModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-xl shadow-2xs"
                >
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN USERS TO COACH MODAL */}
      {assigningCoach && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] space-y-4">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <img
                  src={assigningCoach.avatar}
                  alt={assigningCoach.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-500/40"
                />
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Assign Clients to {assigningCoach.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Manage client roster assignments for this coach.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAssigningCoach(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Search Filter */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search clients by name or email..."
                value={assignSearchTerm}
                onChange={(e) => setAssignSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            {/* Client List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[200px]">
              {users
                .filter(
                  (u) =>
                    u.role === 'user' &&
                    (u.name.toLowerCase().includes(assignSearchTerm.toLowerCase()) ||
                      u.email.toLowerCase().includes(assignSearchTerm.toLowerCase()))
                )
                .map((client) => {
                  const isAssignedToThisCoach = client.assignedCoachId === assigningCoach.id;
                  const isAssignedToOther = client.assignedCoachId && client.assignedCoachId !== assigningCoach.id;

                  return (
                    <div
                      key={client.id}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                        isAssignedToThisCoach
                          ? 'bg-purple-50/80 border-purple-200'
                          : 'bg-white border-slate-200/80 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <img
                          src={client.avatar}
                          alt={client.name}
                          className="w-9 h-9 rounded-full object-cover flex-shrink-0 ring-1 ring-slate-200"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 truncate">{client.name}</p>
                          <p className="text-[11px] text-slate-500 truncate">{client.email}</p>
                          {isAssignedToOther && (
                            <span className="text-[10px] text-purple-700 font-semibold italic block truncate">
                              Assigned to {client.assignedCoachName || 'Other Coach'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      <div>
                        {isAssignedToThisCoach ? (
                          <button
                            onClick={() => assignUserToCoach(client.id, null)}
                            className="px-3 py-1 bg-purple-200/80 hover:bg-rose-100 text-purple-900 hover:text-rose-700 text-xs font-extrabold rounded-lg border border-purple-300/80 hover:border-rose-300 transition-all flex items-center space-x-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-purple-700" />
                            <span>Assigned</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => assignUserToCoach(client.id, assigningCoach.id, assigningCoach.name)}
                            className="px-3 py-1 bg-purple-700 hover:bg-purple-800 text-white text-xs font-extrabold rounded-lg shadow-2xs transition-all flex items-center space-x-1 whitespace-nowrap"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>{isAssignedToOther ? 'Reassign' : 'Assign'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-purple-900">
                Total Assigned: {users.filter((u) => u.assignedCoachId === assigningCoach.id).length} Clients
              </span>
              <button
                onClick={() => setAssigningCoach(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-2xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM REMOVE COACH MODAL */}
      {coachToRemove && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="p-2.5 bg-rose-100/80 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Remove Coach Status</h3>
                <p className="text-xs text-slate-500 font-medium">Demote coach to standard member</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Are you sure you want to remove coach privileges from <strong className="text-slate-900">{coachToRemove.name}</strong>? All currently assigned clients will be unassigned and their role updated to Standard Member.
            </p>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setCoachToRemove(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmRemoveCoach(coachToRemove)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-2xs transition-all"
              >
                Confirm Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE USER MODAL */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="p-2.5 bg-rose-100/80 rounded-xl">
                <Trash2 className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Delete User</h3>
                <p className="text-xs text-slate-500 font-medium">Irreversible user removal</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Are you sure you want to delete <strong className="text-slate-900">{userToDelete.name}</strong> ({userToDelete.email})? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteUser(userToDelete.id);
                  setUserToDelete(null);
                  setCoachToast(`User ${userToDelete.name} deleted successfully.`);
                  setTimeout(() => setCoachToast(null), 4000);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-2xs transition-all"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
