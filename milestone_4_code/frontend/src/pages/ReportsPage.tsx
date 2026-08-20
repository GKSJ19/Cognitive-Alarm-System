import React, { useState } from 'react';
import { useAsync } from '../hooks/useAsync';
import { apiClient } from '../services/apiClient';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Trophy,
  Brain,
  Clock,
  Target,
  TrendingUp,
  Zap,
  Medal,
  ChevronUp,
  ChevronDown,
  Loader2,
  History,
  FileText,
  FileSpreadsheet,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

/* ─── Types ─────────────────────────────────────────────────────────── */

interface ProgressSummary {
  total_challenges: number;
  challenges_won: number;
  success_rate: number;
  total_score: number;
  total_xp: number;
  level: number;
  avg_completion_time: number;
  current_streak: number;
  max_streak: number;
  badges_earned: number;
}

interface CategoryStat {
  category: string;
  total_attempts: number;
  successful: number;
  accuracy: number;
  avg_time: number;
  xp_earned: number;
}

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  full_name: string;
  email: string;
  total_xp: number;
  current_streak: number;
  max_streak: number;
}

interface ChallengeHistoryEntry {
  id: string;
  challenge_type: string;
  sub_type: string | null;
  difficulty: string;
  score: number;
  xp_earned: number;
  time_taken_seconds: number;
  is_successful: boolean;
  completed_at: string;
}

/* ─── Color palette ─────────────────────────────────────────────────── */

const CATEGORY_COLORS: Record<string, string> = {
  math: '#a78bfa',
  logic: '#34d399',
  memory: '#22d3ee',
  word_games: '#fb7185',
  pattern_recognition: '#38bdf8',
  riddles: '#818cf8',
  quick_quiz: '#2dd4bf',
};

const CATEGORY_LABELS: Record<string, string> = {
  math: 'Math',
  logic: 'Logic',
  memory: 'Memory',
  word_games: 'Word Games',
  pattern_recognition: 'Patterns',
  riddles: 'Riddles',
  quick_quiz: 'Quick Quiz',
};

const DIFFICULTY_BADGE: Record<string, string> = {
  easy: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  hard: 'bg-red-500/20 text-red-400 border-red-500/30',
};

/* ─── Component ─────────────────────────────────────────────────────── */

type Tab = 'overview' | 'categories' | 'leaderboard' | 'history';

export const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const { data: summary, loading: summaryLoading } = useAsync<ProgressSummary>(
    async () => {
      const res = await apiClient.get('/progress/summary');
      return res.data.data;
    },
    []
  );

  const { data: categories, loading: categoriesLoading } = useAsync<CategoryStat[]>(
    async () => {
      const res = await apiClient.get('/progress/categories');
      return res.data.data;
    },
    []
  );

  const { data: leaderboard, loading: leaderboardLoading } = useAsync<LeaderboardEntry[]>(
    async () => {
      const res = await apiClient.get('/progress/leaderboard?limit=20');
      return res.data.data;
    },
    []
  );

  const { data: history, loading: historyLoading } = useAsync<ChallengeHistoryEntry[]>(
    async () => {
      const res = await apiClient.get('/challenges/history?limit=30');
      return res.data.data;
    },
    []
  );

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 size={16} /> },
    { id: 'categories', label: 'Categories', icon: <Target size={16} /> },
    { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy size={16} /> },
    { id: 'history', label: 'History', icon: <History size={16} /> },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <BarChart3 className="text-sky-400" size={32} />
            Reports &amp; Analytics
          </h1>
          <p className="text-gray-400 mt-1">
            Dive deep into your performance metrics and track your cognitive growth.
          </p>
        </div>
        
        {/* Export Buttons */}
        <div className="flex items-center gap-3">
          <a 
            href="http://localhost:8000/api/v1/exports/pdf"
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-medium"
          >
            <FileText size={16} /> Export PDF
          </a>
          <a 
            href="http://localhost:8000/api/v1/exports/excel"
            className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition-colors text-sm font-medium"
          >
            <FileSpreadsheet size={16} /> Export Excel
          </a>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 bg-gray-800/60 backdrop-blur rounded-xl p-1 border border-gray-700/50 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={[
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              activeTab === tab.id
                ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5',
            ].join(' ')}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <OverviewTab summary={summary} loading={summaryLoading} categories={categories} />
      )}
      {activeTab === 'categories' && (
        <CategoriesTab categories={categories} loading={categoriesLoading} />
      )}
      {activeTab === 'leaderboard' && (
        <LeaderboardTab leaderboard={leaderboard} loading={leaderboardLoading} />
      )}
      {activeTab === 'history' && (
        <HistoryTab history={history} loading={historyLoading} />
      )}
    </div>
  );
};

/* ─── Overview Tab ──────────────────────────────────────────────────── */

function OverviewTab({
  summary,
  loading,
  categories,
}: {
  summary: ProgressSummary | null;
  loading: boolean;
  categories: CategoryStat[] | null;
}) {
  if (loading) return <LoadingState />;
  if (!summary) return <EmptyState message="No progress data yet. Start solving challenges!" />;

  const statCards = [
    {
      label: 'Total Challenges',
      value: summary.total_challenges,
      icon: <Brain size={24} />,
      color: 'from-purple-900/50 to-violet-900/50',
      border: 'border-purple-700/50',
      iconColor: 'text-purple-400',
    },
    {
      label: 'Overall Accuracy',
      value: `${summary.success_rate?.toFixed(1) || '0.0'}%`,
      icon: <Target size={24} />,
      color: 'from-emerald-900/50 to-teal-900/50',
      border: 'border-emerald-700/50',
      iconColor: 'text-emerald-400',
    },
    {
      label: 'Total XP',
      value: summary.total_xp.toLocaleString(),
      icon: <Zap size={24} />,
      color: 'from-amber-900/50 to-orange-900/50',
      border: 'border-amber-700/50',
      iconColor: 'text-amber-400',
    },
    {
      label: 'Current Level',
      value: summary.level,
      icon: <Medal size={24} />,
      color: 'from-sky-900/50 to-blue-900/50',
      border: 'border-sky-700/50',
      iconColor: 'text-sky-400',
    },
    {
      label: 'Avg. Time',
      value: `${summary.avg_completion_time?.toFixed(1) || '0.0'}s`,
      icon: <Clock size={24} />,
      color: 'from-rose-900/50 to-pink-900/50',
      border: 'border-rose-700/50',
      iconColor: 'text-rose-400',
    },
    {
      label: 'Best Streak',
      value: summary.max_streak,
      icon: <TrendingUp size={24} />,
      color: 'from-indigo-900/50 to-blue-900/50',
      border: 'border-indigo-700/50',
      iconColor: 'text-indigo-400',
    },
  ];

  const chartData = (categories ?? []).map((c) => ({
    name: CATEGORY_LABELS[c.category] || c.category,
    accuracy: c.accuracy,
    fill: CATEGORY_COLORS[c.category] || '#64748b',
  }));

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className={`bg-gradient-to-br ${card.color} p-4 rounded-2xl border ${card.border} shadow-xl flex flex-col items-center justify-center text-center`}
          >
            <div className={`mb-2 ${card.iconColor}`}>{card.icon}</div>
            <div className="text-2xl font-black text-white">{card.value}</div>
            <div className="text-[11px] text-gray-400 uppercase tracking-wide mt-1">{card.label}</div>
          </motion.div>
        ))}
      </div>

      {chartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800/80 backdrop-blur rounded-2xl p-6 border border-gray-700 shadow-xl"
        >
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <BarChart3 className="text-sky-400" size={20} />
            Accuracy by Category
          </h2>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barCategoryGap="20%">
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${v}%`}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#f8fafc',
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Accuracy']}
                />
                <Bar dataKey="accuracy" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}
    </div>
  );
}

/* ─── Categories Tab ────────────────────────────────────────────────── */

function CategoriesTab({
  categories,
  loading,
}: {
  categories: CategoryStat[] | null;
  loading: boolean;
}) {
  if (loading) return <LoadingState />;
  if (!categories || categories.length === 0)
    return <EmptyState message="No category data yet. Complete some challenges first!" />;

  const pieData = categories.map((c) => ({
    name: CATEGORY_LABELS[c.category] || c.category,
    value: c.total_attempts,
    fill: CATEGORY_COLORS[c.category] || '#64748b',
  }));

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/80 backdrop-blur rounded-2xl p-6 border border-gray-700 shadow-xl"
      >
        <h2 className="text-lg font-bold text-white mb-6">Challenge Distribution</h2>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="h-[220px] w-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#f8fafc',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-3 flex-1">
            {pieData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.fill }} />
                <span className="text-sm text-gray-300">
                  {entry.name}{' '}
                  <span className="text-gray-500">({entry.value})</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat, i) => {
          const color = CATEGORY_COLORS[cat.category] || '#64748b';
          const label = CATEGORY_LABELS[cat.category] || cat.category;
          return (
            <motion.div
              key={cat.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-gray-800/80 backdrop-blur rounded-xl p-5 border border-gray-700 shadow-lg"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-white font-semibold text-lg" style={{ color }}>
                  {label}
                </span>
                <span className="text-xs text-gray-400">
                  {cat.successful}/{cat.total_attempts} solved
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden mb-3">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(cat.accuracy, 100)}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Accuracy: <span className="text-white font-medium">{cat.accuracy.toFixed(1)}%</span></span>
                <span>Avg Time: <span className="text-white font-medium">{(cat.avg_time ?? 0).toFixed(1)}s</span></span>
                <span>XP: <span className="text-white font-medium">{(cat.xp_earned ?? 0).toLocaleString()}</span></span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Leaderboard Tab ───────────────────────────────────────────────── */

function LeaderboardTab({
  leaderboard,
  loading,
}: {
  leaderboard: LeaderboardEntry[] | null;
  loading: boolean;
}) {
  if (loading) return <LoadingState />;
  if (!leaderboard || leaderboard.length === 0)
    return <EmptyState message="No leaderboard data available yet." />;

  const podiumColors = ['text-yellow-400', 'text-gray-300', 'text-amber-600'];
  const podiumBg = ['bg-yellow-500/10 border-yellow-500/30', 'bg-gray-500/10 border-gray-500/30', 'bg-amber-700/10 border-amber-700/30'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/80 backdrop-blur rounded-2xl border border-gray-700 shadow-xl overflow-hidden"
    >
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Trophy className="text-yellow-400" size={20} />
          XP Leaderboard
        </h2>
      </div>
      <div className="divide-y divide-gray-700/50">
        {leaderboard.map((entry, i) => {
          const isTop3 = i < 3;
          return (
            <div
              key={entry.user_id}
              className={`flex items-center gap-4 px-6 py-4 transition-colors hover:bg-white/5 ${
                isTop3 ? podiumBg[i] + ' border-l-2' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                  isTop3 ? podiumColors[i] : 'text-gray-500'
                }`}
              >
                {isTop3 ? (
                  <Trophy size={20} />
                ) : (
                  entry.rank ?? i + 1
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium truncate">
                  {entry.full_name || entry.email}
                </div>
                <div className="text-xs text-gray-500 truncate">{entry.email}</div>
              </div>
              <div className="text-right">
                <div className="text-white font-bold">{entry.total_xp.toLocaleString()} XP</div>
                <div className="text-xs text-gray-500">
                  🔥 {entry.current_streak} streak
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ─── History Tab ───────────────────────────────────────────────────── */

function HistoryTab({
  history,
  loading,
}: {
  history: ChallengeHistoryEntry[] | null;
  loading: boolean;
}) {
  if (loading) return <LoadingState />;
  if (!history || history.length === 0)
    return <EmptyState message="No challenge history yet. Start solving challenges!" />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/80 backdrop-blur rounded-2xl border border-gray-700 shadow-xl overflow-hidden"
    >
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <History className="text-sky-400" size={20} />
          Challenge History
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700 text-gray-400 text-left">
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Category</th>
              <th className="px-6 py-3 font-medium">Difficulty</th>
              <th className="px-6 py-3 font-medium">Score</th>
              <th className="px-6 py-3 font-medium">XP</th>
              <th className="px-6 py-3 font-medium">Time</th>
              <th className="px-6 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {history.map((entry) => {
              const diffClass = DIFFICULTY_BADGE[entry.difficulty] || 'bg-gray-700 text-gray-300';
              return (
                <tr key={entry.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-3">
                    {entry.is_successful ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                        <ChevronUp size={14} /> Pass
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-400 font-medium">
                        <ChevronDown size={14} /> Fail
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-white font-medium">
                    {CATEGORY_LABELS[entry.challenge_type] || entry.challenge_type}
                  </td>
                  <td className="px-6 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full border capitalize font-semibold ${diffClass}`}>
                      {entry.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-white font-medium">{entry.score}</td>
                  <td className="px-6 py-3 text-amber-400 font-medium">+{entry.xp_earned}</td>
                  <td className="px-6 py-3 text-gray-300">{entry.time_taken_seconds?.toFixed(1)}s</td>
                  <td className="px-6 py-3 text-gray-400 text-xs">
                    {entry.completed_at
                      ? new Date(entry.completed_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

/* ─── Shared UI ─────────────────────────────────────────────────────── */

function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-gray-500">
      <BarChart3 size={48} className="mb-4 opacity-30" />
      <p>{message}</p>
    </div>
  );
}
