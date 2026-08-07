import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Trophy,
  Activity,
  Sparkles,
  Award,
  Calendar,
  Flame,
  Brain,
  Clock,
  Zap,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  Bell,
  Moon,
  Sun,
  Star,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { ChallengeEngineView } from './ChallengeEngine';
import { ChallengeInsightsView } from './ChallengeInsights';
import { HabitTrackerView } from './HabitTracker';
import { AiAssistantView } from './AiAssistant';
import { LeaderboardAndBadgesView } from './LeaderboardAndBadges';
import { AlarmEngine } from './AlarmEngine';

export const UserDashboard: React.FC = () => {
  const { currentUser, challenges, logs } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'alarm' | 'challenges' | 'insights' | 'habits' | 'ai' | 'leaderboard'>('overview');

  const activeJoinedChallenges = challenges.filter((c) => c.isJoined);

  return (
    <div className="space-y-6">
      
      {/* Top Banner Hero Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/20 via-teal-500/10 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Level {currentUser.level} Member Workspace
              </span>
              <span className="text-xs text-slate-300">
                Coach: <span className="text-white font-semibold">{currentUser.assignedCoachName || 'Coach Marcus Vance'}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {currentUser.name}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              You are currently on a <span className="text-amber-400 font-bold">{currentUser.streak}-day streak</span>. Cognitive alarm wake-ups: 100% accuracy. You earned {currentUser.points} points!
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15 text-center">
              <Flame className="w-5 h-5 text-amber-400 mx-auto" />
              <p className="text-base font-extrabold text-white mt-1">{currentUser.streak} Days</p>
              <p className="text-xs text-slate-200 uppercase font-bold tracking-tight">Current Streak</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15 text-center">
              <Award className="w-5 h-5 text-emerald-400 mx-auto" />
              <p className="text-base font-extrabold text-white mt-1">{currentUser.points} Pts</p>
              <p className="text-xs text-slate-200 uppercase font-bold tracking-tight">Total Points</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15 text-center col-span-2 sm:col-span-1">
              <Brain className="w-5 h-5 text-cyan-400 mx-auto" />
              <p className="text-base font-extrabold text-white mt-1">92 Score</p>
              <p className="text-xs text-slate-200 uppercase font-bold tracking-tight">Cognitive Score</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation Bar */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview & Daily Log', icon: Activity },
          { id: 'alarm', label: 'Smart Alarm Clock', icon: Clock },
          { id: 'challenges', label: 'Challenge Engine', icon: Trophy },
          { id: 'insights', label: 'Challenge Insights', icon: BarChart3 },
          { id: 'habits', label: 'Habit Tracker', icon: TrendingUp },
          { id: 'ai', label: 'AI Assistant', icon: Sparkles },
          { id: 'leaderboard', label: 'Rankings & Badges', icon: Award },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Views */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
            {/* Card 1: Accuracy */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-2.5 min-w-0">
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] sm:text-xs font-black text-slate-700 uppercase tracking-wider">Accuracy</span>
                <div className="p-1.5 sm:p-2 bg-indigo-50 text-indigo-600 rounded-xl flex-shrink-0">
                  <Brain className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
              <div>
                <p className="text-sm sm:text-base md:text-lg font-black text-slate-900 leading-tight">50% Accuracy</p>
                <p className="text-xs font-bold text-slate-600 leading-tight mt-1">4 of 8 solved</p>
              </div>
            </div>

            {/* Card 2: Solve Speed */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-2.5 min-w-0">
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] sm:text-xs font-black text-slate-700 uppercase tracking-wider">Solve Speed</span>
                <div className="p-1.5 sm:p-2 bg-amber-50 text-amber-600 rounded-xl flex-shrink-0">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
              <div>
                <p className="text-sm sm:text-base md:text-lg font-black text-slate-900 leading-tight">15.5s Avg</p>
                <p className="text-xs font-bold text-emerald-700 leading-tight mt-1">Fastest 6.1s</p>
              </div>
            </div>

            {/* Card 3: Dismissal */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-2.5 min-w-0">
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] sm:text-xs font-black text-slate-700 uppercase tracking-wider">Dismissal</span>
                <div className="p-1.5 sm:p-2 bg-emerald-50 text-emerald-600 rounded-xl flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
              <div>
                <p className="text-sm sm:text-base md:text-lg font-black text-slate-900 leading-tight">100% Rate</p>
                <p className="text-xs font-bold text-slate-600 leading-tight mt-1">3 of 3 alarms</p>
              </div>
            </div>

            {/* Card 4: Completion */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-2.5 min-w-0">
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] sm:text-xs font-black text-slate-700 uppercase tracking-wider">Completion</span>
                <div className="p-1.5 sm:p-2 bg-cyan-50 text-cyan-600 rounded-xl flex-shrink-0">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
              <div>
                <p className="text-sm sm:text-base md:text-lg font-black text-slate-900 leading-tight">36% Rate</p>
                <p className="text-xs font-bold text-slate-600 leading-tight mt-1">4 of 11 completed</p>
              </div>
            </div>
          </div>

          {/* 📈 Cognitive Performance & Speed Chart */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>📈 Morning Cognitive Performance & Solve Speed Trend</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daily accuracy (%) and wake-up puzzle solve times over the past 7 days
                </p>
              </div>
              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
                Updated Today
              </span>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={logs} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="accuracyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="speedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px',
                      padding: '10px 14px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                    }}
                    formatter={(value: any, name: string) => [
                      name === 'cognitiveAccuracy' ? `${value}% Accuracy` : `${value} seconds`,
                      name === 'cognitiveAccuracy' ? 'Cognitive Accuracy' : 'Solve Speed',
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="cognitiveAccuracy"
                    name="cognitiveAccuracy"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#accuracyGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="solveTimeSeconds"
                    name="solveTimeSeconds"
                    stroke="#6366f1"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    fillOpacity={1}
                    fill="url(#speedGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-center space-x-6 text-xs text-slate-600 font-bold pt-1">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                <span>Accuracy (%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-indigo-500 border border-dashed border-indigo-700 inline-block" />
                <span>Solve Speed (s)</span>
              </div>
            </div>
          </div>

          {/* 🌅 Wake-up Achievements */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>🌅 Wake-up Achievements ({currentUser.badges.length})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Milestones achieved for wake-up consistency, no-snooze rate, and morning routines</p>
              </div>
              <button
                onClick={() => setActiveTab('leaderboard')}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 self-start sm:self-auto flex items-center space-x-1"
              >
                <span>View All 11 Achievements & Rankings →</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
              {currentUser.badges.map((badge) => (
                <div
                  key={badge.id}
                  className="p-3.5 sm:p-4 bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/20 rounded-2xl border border-slate-200/80 hover:border-emerald-400 transition-all flex flex-col justify-between space-y-3 min-w-0 shadow-2xs h-full"
                >
                  <div className="space-y-2.5 min-w-0">
                    {/* Top Row: Icon on Left, Status Badge on Right */}
                    <div className="flex items-center justify-between gap-1.5 min-w-0">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 text-amber-900 flex items-center justify-center text-lg sm:text-xl shadow-2xs flex-shrink-0 border border-amber-300/40">
                        {badge.icon}
                      </div>
                      <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200/80 uppercase tracking-wider flex-shrink-0">
                        UNLOCKED
                      </span>
                    </div>

                    {/* Middle: Title & Description */}
                    <div className="space-y-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">{badge.name}</h4>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                        {badge.description}
                      </p>
                    </div>
                  </div>

                  {/* Bottom: Checkmark */}
                  <div className="pt-2 text-[10px] text-emerald-700 font-bold flex items-center justify-between border-t border-emerald-100/80 mt-auto">
                    <div className="flex items-center space-x-1.5 min-w-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>Unlocked Badge</span>
                    </div>
                    {badge.unlockedAt && (
                      <span className="text-[10px] text-slate-500 font-medium">{badge.unlockedAt}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'alarm' && <AlarmEngine />}
      {activeTab === 'challenges' && <ChallengeEngineView />}
      {activeTab === 'insights' && <ChallengeInsightsView />}
      {activeTab === 'habits' && <HabitTrackerView />}
      {activeTab === 'ai' && <AiAssistantView />}
      {activeTab === 'leaderboard' && <LeaderboardAndBadgesView />}

    </div>
  );
};

