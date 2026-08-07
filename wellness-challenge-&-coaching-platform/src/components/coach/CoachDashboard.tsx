import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  AlertTriangle,
  Award,
  Moon,
  TrendingUp,
  Search,
  UserCheck,
  History,
  Activity,
  Bell,
  CheckCircle2,
  XCircle,
  BarChart3,
  MessageSquare,
  Send,
  Target,
  Sliders,
  Sparkles,
  Calendar,
  Clock,
  Flame,
  FileText,
  UserPlus,
  Shield,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { UserProfile } from '../../types';

export const CoachDashboard: React.FC = () => {
  const { currentUser, users, messages, sendMessage } = useApp();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'monitoring' | 'analytics' | 'coaching'>('dashboard');

  // Filter state
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>('usr-1');
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly'>('weekly');

  // Coaching Forms State
  const [recMessage, setRecMessage] = useState('');
  const [motivationText, setMotivationText] = useState('');
  const [weeklyGoalText, setWeeklyGoalText] = useState('');
  const [suggestedDifficulty, setSuggestedDifficulty] = useState<'easy' | 'medium' | 'hard' | 'extreme'>('medium');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state for Habit & Sleep History
  const [historyModal, setHistoryModal] = useState<{ isOpen: boolean; type: 'habit' | 'sleep'; userName: string } | null>(null);

  // Filter client users
  const clientUsers = users.filter((u) => u.role === 'user');
  const activeClient = users.find((u) => u.id === selectedUserId) || clientUsers[0] || users[0];

  const filteredClients = clientUsers.filter(
    (c) =>
      c.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  // Calculated Stats
  const totalUsersAssigned = clientUsers.length;
  const usersNeedingAttention = clientUsers.filter((u) => (u.streak || 0) < 5 || (u.metrics?.snoozeRatePercent || 0) > 10).length || 1;
  const avgHabitScore = 91; // %
  const avgSleepDuration = '7.6 hrs';
  const weeklyProgress = '+8.4%';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Handlers
  const handleSendRecommendation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recMessage.trim()) return;
    sendMessage(selectedUserId, `💡 Coach Recommendation: ${recMessage}`);
    setRecMessage('');
    showToast(`Recommendation sent successfully to ${activeClient.name}!`);
  };

  const handleSendMotivationalMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivationText.trim()) return;
    sendMessage(selectedUserId, `🔥 Motivational Note: ${motivationText}`);
    setMotivationText('');
    showToast(`Motivational message sent to ${activeClient.name}!`);
  };

  const handleSetWeeklyGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weeklyGoalText.trim()) return;
    sendMessage(selectedUserId, `🎯 New Weekly Goal: ${weeklyGoalText}`);
    setWeeklyGoalText('');
    showToast(`Weekly goal set for ${activeClient.name}!`);
  };

  const handleSuggestDifficulty = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(selectedUserId, `⚙️ Difficulty Suggestion: Coach recommends upgrading your morning alarm challenges to ${suggestedDifficulty.toUpperCase()} mode.`);
    showToast(`Difficulty change suggestion sent to ${activeClient.name}!`);
  };

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="p-3.5 bg-teal-50 border border-teal-200 text-teal-900 rounded-2xl text-xs font-bold flex items-center space-x-2 animate-fade-in shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
      
      {/* 🩺 Wellness Coach Header Banner */}
      <div className="bg-gradient-to-r from-teal-950 via-cyan-900 to-slate-900 text-white rounded-3xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
              Wellness Coach Portal
            </span>
            <span className="text-xs text-slate-300">Emulator Mode Active</span>
          </div>

          <h1 className="text-xl font-extrabold tracking-tight">
            Coach Console: {currentUser.name} 🩺
          </h1>
          <p className="text-xs text-slate-300">
            Monitor client habits, wake-up consistency, issue direct coaching recommendations, and evaluate sleep adherence.
          </p>
        </div>

        {/* Quick Header Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 bg-slate-900/90 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 text-center shadow-md">
          <div className="p-2.5 bg-white/10 rounded-xl border border-white/10 flex flex-col items-center justify-center min-w-0">
            <p className="text-xl sm:text-2xl font-black text-white leading-none">{totalUsersAssigned}</p>
            <p className="text-xs text-teal-200 uppercase font-extrabold tracking-tight mt-1.5 leading-tight">Assigned</p>
          </div>
          <div className="p-2.5 bg-white/10 rounded-xl border border-white/10 flex flex-col items-center justify-center min-w-0">
            <p className="text-xl sm:text-2xl font-black text-amber-300 leading-none">{usersNeedingAttention}</p>
            <p className="text-xs text-amber-200 uppercase font-extrabold tracking-tight mt-1.5 leading-tight">Attention Needed</p>
          </div>
          <div className="p-2.5 bg-white/10 rounded-xl border border-white/10 flex flex-col items-center justify-center min-w-0">
            <p className="text-xl sm:text-2xl font-black text-emerald-300 leading-none">{avgHabitScore}%</p>
            <p className="text-xs text-teal-200 uppercase font-extrabold tracking-tight mt-1.5 leading-tight">Habit Score</p>
          </div>
          <div className="p-2.5 bg-white/10 rounded-xl border border-white/10 flex flex-col items-center justify-center min-w-0">
            <p className="text-xl sm:text-2xl font-black text-cyan-300 leading-none">{avgSleepDuration}</p>
            <p className="text-xs text-teal-200 uppercase font-extrabold tracking-tight mt-1.5 leading-tight">Avg Sleep</p>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation Bar */}
      <div className="flex items-center space-x-1.5 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: Activity },
          { id: 'users', label: 'User Management', icon: Users },
          { id: 'monitoring', label: 'Monitoring Hub', icon: Eye },
          { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 },
          { id: 'coaching', label: 'Coaching Tools', icon: MessageSquare },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                isActive
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION 1: COACH DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Key Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-2 min-w-0">
              <span className="text-xs text-slate-700 font-extrabold uppercase tracking-tight flex items-center space-x-1 leading-tight">
                <Users className="w-3.5 h-3.5 text-teal-700 flex-shrink-0" />
                <span className="truncate">Total Users Assigned</span>
              </span>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 leading-none py-1">{totalUsersAssigned}</p>
              <p className="text-xs text-teal-700 font-extrabold leading-tight">Active in roster</p>
            </div>

            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-2 min-w-0">
              <span className="text-xs text-slate-700 font-extrabold uppercase tracking-tight flex items-center space-x-1 leading-tight">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                <span className="truncate">Needing Attention</span>
              </span>
              <p className="text-2xl sm:text-3xl font-black text-amber-700 leading-none py-1">{usersNeedingAttention}</p>
              <p className="text-xs text-amber-700 font-extrabold leading-tight">Inconsistent wake-ups</p>
            </div>

            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-2 min-w-0">
              <span className="text-xs text-slate-700 font-extrabold uppercase tracking-tight flex items-center space-x-1 leading-tight">
                <Award className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                <span className="truncate">Average Habit Score</span>
              </span>
              <p className="text-2xl sm:text-3xl font-black text-emerald-700 leading-none py-1">{avgHabitScore}%</p>
              <p className="text-xs text-emerald-700 font-extrabold leading-tight">Morning routine completion</p>
            </div>

            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-2 min-w-0">
              <span className="text-xs text-slate-700 font-extrabold uppercase tracking-tight flex items-center space-x-1 leading-tight">
                <Moon className="w-3.5 h-3.5 text-indigo-700 flex-shrink-0" />
                <span className="truncate">Avg Sleep Duration</span>
              </span>
              <p className="text-2xl sm:text-3xl font-black text-indigo-800 leading-none py-1">{avgSleepDuration}</p>
              <p className="text-xs text-indigo-800 font-extrabold leading-tight">Optimal rest quality</p>
            </div>

            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-2 min-w-0 col-span-2 sm:col-span-1">
              <span className="text-xs text-slate-700 font-extrabold uppercase tracking-tight flex items-center space-x-1 leading-tight">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-700 flex-shrink-0" />
                <span className="truncate">Weekly Progress</span>
              </span>
              <p className="text-2xl sm:text-3xl font-black text-cyan-800 leading-none py-1">{weeklyProgress}</p>
              <p className="text-xs text-cyan-800 font-extrabold leading-tight">vs last week</p>
            </div>
          </div>

          {/* Attention Alerts & Quick Roster Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider text-amber-600 flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Clients Needing Immediate Attention</span>
              </h3>
              <div className="space-y-2">
                {clientUsers.slice(0, 2).map((u) => (
                  <div key={u.id} className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/60 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-amber-300" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{u.name}</h4>
                        <p className="text-[10px] text-amber-800 font-medium">Snoozed 2 times this morning • 6.2h sleep</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedUserId(u.id);
                        setActiveTab('coaching');
                      }}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-bold shadow-2xs"
                    >
                      Coach Now
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider text-teal-700 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Top Weekly Achievers</span>
              </h3>
              <div className="space-y-2">
                {clientUsers.map((u) => (
                  <div key={u.id} className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/60 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-300" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{u.name}</h4>
                        <p className="text-[10px] text-emerald-800 font-medium">{u.streak}d Wake Streak • 0 Snoozes</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                      100% Score
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: USER MANAGEMENT & PROFILES */}
      {activeTab === 'users' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                <Users className="w-4 h-4 text-teal-600" />
                <span>Assigned Users Directory</span>
              </h3>
              <p className="text-xs text-slate-500">View assigned clients, search user profiles, and inspect habit & sleep history logs</p>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search user by name or email..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none w-64"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredClients.map((client) => (
              <div key={client.id} className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3 flex flex-col justify-between">
                <div className="flex items-center space-x-3">
                  <img src={client.avatar} alt={client.name} className="w-11 h-11 rounded-full object-cover ring-2 ring-teal-400" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{client.name}</h4>
                    <p className="text-[11px] text-slate-500">{client.email}</p>
                    <span className="text-[10px] font-semibold text-teal-800 bg-teal-100 px-2 py-0.2 rounded-full inline-block mt-1">
                      Level {client.level} • {client.points} Pts
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs bg-white p-2.5 rounded-xl border border-slate-100">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Streak</p>
                    <p className="font-extrabold text-amber-600">{client.streak} Days</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Joined</p>
                    <p className="font-extrabold text-slate-700">{client.joinedDate}</p>
                  </div>
                </div>

                {/* History Action Buttons */}
                <div className="flex items-center space-x-2 pt-1">
                  <button
                    onClick={() => setHistoryModal({ isOpen: true, type: 'habit', userName: client.name })}
                    className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-xl border border-emerald-200 flex items-center justify-center space-x-1"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>Habit History</span>
                  </button>
                  <button
                    onClick={() => setHistoryModal({ isOpen: true, type: 'sleep', userName: client.name })}
                    className="flex-1 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-[11px] font-bold rounded-xl border border-indigo-200 flex items-center justify-center space-x-1"
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span>Sleep History</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: MONITORING HUB */}
      {activeTab === 'monitoring' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <Eye className="w-4 h-4 text-teal-600" />
              <span>Real-time Client Monitoring Matrix</span>
            </h3>
            <p className="text-xs text-slate-500">Track key biometric & habit metrics across snooze counts, missed alarms, and schedule adherence</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">Client User</th>
                  <th className="p-3">Habit Score</th>
                  <th className="p-3">Wake-up Consistency</th>
                  <th className="p-3">Snooze Count</th>
                  <th className="p-3">Challenge Accuracy</th>
                  <th className="p-3">Missed Alarms</th>
                  <th className="p-3">Sleep Schedule Adherence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clientUsers.map((client) => {
                  const habitScore = 93 + (client.name.length % 5);
                  const wakeConsistency = 95 + (client.name.length % 4);
                  const snoozeCount = client.name.length % 2;
                  const accuracy = 98;
                  const missedAlarms = 0;
                  const sleepAdherence = '96%';

                  return (
                    <tr key={client.id} className="hover:bg-slate-50/80">
                      <td className="p-3 font-bold text-slate-800 flex items-center space-x-2">
                        <img src={client.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                        <span>{client.name}</span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                          {habitScore}%
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-teal-700">{wakeConsistency}%</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold ${snoozeCount === 0 ? 'bg-slate-100 text-slate-700' : 'bg-amber-100 text-amber-800'}`}>
                          {snoozeCount} times
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-indigo-700">{accuracy}%</td>
                      <td className="p-3 font-bold text-slate-600">{missedAlarms}</td>
                      <td className="p-3 font-bold text-emerald-600">{sleepAdherence}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 4: ANALYTICS & REPORTS */}
      {activeTab === 'analytics' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-teal-600" />
                <span>Coach Analytics & Habit Trends</span>
              </h3>
              <p className="text-xs text-slate-500">Weekly and monthly reports comparing user progress and habit trajectory</p>
            </div>

            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setTimeframe('weekly')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  timeframe === 'weekly' ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Weekly Reports
              </button>
              <button
                onClick={() => setTimeframe('monthly')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  timeframe === 'monthly' ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Monthly Reports
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider text-teal-700">
                Progress Chart ({timeframe})
              </h4>
              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span>Morning Alarm Dismissal On First Attempt</span>
                    <strong className="text-emerald-600">96.4%</strong>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '96.4%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span>Average Sleep Duration Goal (7.5h+)</span>
                    <strong className="text-indigo-600">92.1%</strong>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: '92.1%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span>Cognitive Puzzle Solve Speed (&lt;15s)</span>
                    <strong className="text-cyan-600">94.8%</strong>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-cyan-500 h-full rounded-full" style={{ width: '94.8%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider text-teal-700">
                User Comparison & Habit Trends
              </h4>
              <div className="space-y-2 text-xs">
                {clientUsers.map((u) => (
                  <div key={u.id} className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{u.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-slate-500">Streak: {u.streak}d</span>
                      <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-bold text-[10px]">
                        +12% Trend
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: COACHING TOOLS */}
      {activeTab === 'coaching' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Form 1: Recommendations & Motivational Messages */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-teal-600" />
              <span>Send Recommendations & Messages</span>
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Select Client User</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              >
                {clientUsers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.email})
                  </option>
                ))}
              </select>
            </div>

            <form onSubmit={handleSendRecommendation} className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-800">Send Recommendations</label>
              <textarea
                rows={2}
                placeholder="Write customized wellness or wake-up recommendation..."
                value={recMessage}
                onChange={(e) => setRecMessage(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
              <button
                type="submit"
                className="w-full py-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-2xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Recommendation</span>
              </button>
            </form>

            <form onSubmit={handleSendMotivationalMessage} className="space-y-2 pt-3 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-800">Send Motivational Message</label>
              <input
                type="text"
                placeholder="e.g., You are on a 12-day streak! Keep up the morning focus!"
                value={motivationText}
                onChange={(e) => setMotivationText(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
              <button
                type="submit"
                className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-2xs"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Send Motivational Note</span>
              </button>
            </form>
          </div>

          {/* Form 2: Goals & Difficulty & Feedback */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <Target className="w-4 h-4 text-teal-600" />
              <span>Weekly Goals & Difficulty Suggestions</span>
            </h3>

            <form onSubmit={handleSetWeeklyGoal} className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">Set Weekly Goal</label>
              <input
                type="text"
                placeholder="e.g., Complete 7 morning cognitive puzzle alarms without snooze"
                value={weeklyGoalText}
                onChange={(e) => setWeeklyGoalText(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
              <button
                type="submit"
                className="w-full py-2 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-2xs"
              >
                <Target className="w-3.5 h-3.5" />
                <span>Set Weekly Goal</span>
              </button>
            </form>

            <form onSubmit={handleSuggestDifficulty} className="space-y-2 pt-3 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-800">Suggest Difficulty Changes</label>
              <select
                value={suggestedDifficulty}
                onChange={(e) => setSuggestedDifficulty(e.target.value as any)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              >
                <option value="easy">Easy (1 Math/Memory step)</option>
                <option value="medium">Medium (2 Math/Pattern steps)</option>
                <option value="hard">Hard (3 Math + Logic steps)</option>
                <option value="extreme">Extreme (Master Cognitive Sequence)</option>
              </select>
              <button
                type="submit"
                className="w-full py-2 bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-2xs"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Suggest Difficulty Change</span>
              </button>
            </form>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <h4 className="text-xs font-bold text-slate-800 flex items-center space-x-1">
                <FileText className="w-3.5 h-3.5 text-teal-600" />
                <span>View Client Feedback</span>
              </h4>
              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-1 border border-slate-100">
                <p className="italic">"The morning logic puzzle really woke up my brain before coffee today!"</p>
                <p className="text-[10px] text-slate-400 font-bold">— Nasritha (Yesterday 8:15 AM)</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HISTORY MODAL */}
      {historyModal?.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-100 relative space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              {historyModal.type === 'habit' ? '📋 Habit History' : '🌙 Sleep History'} — {historyModal.userName}
            </h3>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 text-xs">
              {historyModal.type === 'habit' ? (
                <>
                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 flex justify-between">
                    <span>Went to bed on time</span>
                    <strong className="text-emerald-700">Completed (7d streak)</strong>
                  </div>
                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 flex justify-between">
                    <span>Woke up on first alarm</span>
                    <strong className="text-emerald-700">Completed (12d streak)</strong>
                  </div>
                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 flex justify-between">
                    <span>No snoozing</span>
                    <strong className="text-emerald-700">Completed (10d streak)</strong>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-2.5 bg-indigo-50 rounded-xl border border-indigo-100 flex justify-between">
                    <span>Aug 04, 2026</span>
                    <strong className="text-indigo-700">7.8 hrs (Deep Rest)</strong>
                  </div>
                  <div className="p-2.5 bg-indigo-50 rounded-xl border border-indigo-100 flex justify-between">
                    <span>Aug 03, 2026</span>
                    <strong className="text-indigo-700">8.1 hrs (Restorative)</strong>
                  </div>
                  <div className="p-2.5 bg-indigo-50 rounded-xl border border-indigo-100 flex justify-between">
                    <span>Aug 02, 2026</span>
                    <strong className="text-indigo-700">7.4 hrs (On Schedule)</strong>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setHistoryModal(null)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl"
            >
              Close History View
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
