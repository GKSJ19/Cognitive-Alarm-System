/**
 * Analytics Dashboard Page — Milestone 3 & 4
 *
 * Professional analytics dashboard with:
 *   - Stat Cards (Habit Score, Difficulty, Streak, Accuracy, Sleep, Delay, Snooze)
 *   - Progress Bars (habit score sub-components)
 *   - Line Charts (habit score trend, consistency trend)
 *   - Bar Charts (challenge accuracy by day)
 *   - Pie/Donut Chart (habit score breakdown)
 *   - Calendar Heatmap (30-day wake-up grid)
 *   - Recent Recommendations (card list with priority badges)
 *   - Difficulty Timeline (visual change log)
 *   - Habit Score Gauge (SVG circular gauge)
 *
 * Uses Recharts for charting and Tailwind CSS for styling.
 */

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Brain,
  Moon,
  Clock,
  BellOff,
  Flame,
  Target,
  Activity,
  Lightbulb,
  RefreshCw,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Info,
  Zap,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import {
  getDailyDashboard,
  getWeeklyDashboard,
  getMonthlyDashboard,
  generateRecommendations,
  dismissRecommendation,
  getDifficultyHistory,
  computeDifficulty,
} from "../services/analyticsApi";
import type {
  DashboardData,
  DifficultyHistoryItem,
} from "../types";

// ── Animation variants ────────────────────────────────────────────────────
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" },
  }),
};

// ── Difficulty colors ─────────────────────────────────────────────────────
const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "from-green-400 to-emerald-500",
  easy: "from-blue-400 to-cyan-500",
  medium: "from-yellow-400 to-amber-500",
  hard: "from-orange-400 to-red-500",
  expert: "from-purple-500 to-pink-600",
};

const DIFFICULTY_BG: Record<string, string> = {
  beginner: "bg-green-500/20 text-green-400",
  easy: "bg-blue-500/20 text-blue-400",
  medium: "bg-yellow-500/20 text-yellow-400",
  hard: "bg-orange-500/20 text-orange-400",
  expert: "bg-purple-500/20 text-purple-400",
};

const PRIORITY_STYLES: Record<string, { bg: string; icon: typeof Info }> = {
  critical: { bg: "bg-red-500/20 text-red-400 border-red-500/30", icon: AlertTriangle },
  high: { bg: "bg-orange-500/20 text-orange-400 border-orange-500/30", icon: AlertTriangle },
  medium: { bg: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: Info },
  low: { bg: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: Lightbulb },
};

const PIE_COLORS = ["#8b5cf6", "#06b6d4", "#f59e0b", "#10b981"];

// ── Habit Score Gauge (SVG) ───────────────────────────────────────────────
function HabitScoreGauge({ score }: { score: number }) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color =
    score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : score >= 40 ? "#f97316" : "#ef4444";

  return (
    <div className="relative flex items-center justify-center">
      <svg width="200" height="200" className="-rotate-90">
        <circle
          cx="100" cy="100" r={radius}
          fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12"
        />
        <motion.circle
          cx="100" cy="100" r={radius}
          fill="none" stroke={color} strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute text-center">
        <motion.span
          className="text-4xl font-bold"
          style={{ color }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {Math.round(score)}
        </motion.span>
        <p className="text-xs text-muted-foreground mt-1">out of 100</p>
      </div>
    </div>
  );
}

// ── Progress Bar ──────────────────────────────────────────────────────────
function ProgressBar({
  label, value, maxValue = 100, color,
}: {
  label: string; value: number; maxValue?: number; color: string;
}) {
  const pct = Math.min(100, (value / maxValue) * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value.toFixed(1)}</span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// ── Calendar Heatmap ──────────────────────────────────────────────────────
function CalendarHeatmap({
  data,
}: {
  data: Array<{ date: string; score: number; status: string }>;
}) {
  const getColor = (status: string) => {
    switch (status) {
      case "excellent": return "bg-green-500";
      case "good": return "bg-emerald-400/70";
      case "average": return "bg-yellow-500/60";
      case "poor": return "bg-red-500/50";
      default: return "bg-white/5";
    }
  };

  // Fill 30 days grid
  const today = new Date();
  const cells = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const entry = data.find((e) => e.date === dateStr);
    cells.push({
      date: dateStr,
      score: entry?.score ?? 0,
      status: entry?.status ?? "none",
      day: d.getDate(),
    });
  }

  return (
    <div className="grid grid-cols-10 gap-1.5">
      {cells.map((cell) => (
        <div
          key={cell.date}
          className={`w-8 h-8 rounded-md flex items-center justify-center text-[10px] font-medium ${getColor(cell.status)} transition-all hover:scale-110 cursor-default`}
          title={`${cell.date}: ${cell.score.toFixed(0)}`}
        >
          {cell.day}
        </div>
      ))}
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon, label, value, subtitle, gradient, index,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string | number;
  subtitle?: string;
  gradient: string;
  index: number;
}) {
  return (
    <motion.div
      variants={fadeIn} initial="hidden" animate="visible" custom={index}
      className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 hover:bg-white/[0.07] transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg bg-gradient-to-br ${gradient} bg-opacity-20`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
      {subtitle && <p className="text-[10px] text-muted-foreground/70 mt-0.5">{subtitle}</p>}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function AnalyticsDashboardPage() {
  const [activeTab, setActiveTab] = useState<"daily" | "weekly" | "monthly" | "insights">("daily");
  const [data, setData] = useState<DashboardData | null>(null);
  const [diffHistory, setDiffHistory] = useState<DifficultyHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let result: DashboardData;
      if (activeTab === "weekly") {
        result = await getWeeklyDashboard();
      } else if (activeTab === "monthly") {
        result = await getMonthlyDashboard();
      } else {
        result = await getDailyDashboard();
      }
      setData(result);

      // Also fetch difficulty history
      const history = await getDifficultyHistory(10);
      setDiffHistory(history);
    } catch (err) {
      console.error("Failed to fetch analytics data", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await computeDifficulty();
      await generateRecommendations();
      await fetchData();
    } catch (err) {
      console.error("Refresh failed", err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleDismissRec = async (recId: string) => {
    try {
      await dismissRecommendation(recId);
      await fetchData();
    } catch (err) {
      console.error("Dismiss failed", err);
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  const tabs = [
    { id: "daily" as const, label: "Daily" },
    { id: "weekly" as const, label: "Weekly" },
    { id: "monthly" as const, label: "Monthly" },
    { id: "insights" as const, label: "Insights" },
  ];

  const breakdown = data.habit_score_breakdown || {
    wake_up_consistency: 0, challenge_success: 0,
    snooze_reduction: 0, sleep_adherence: 0,
  };

  const pieData = [
    { name: "Consistency (35%)", value: breakdown.wake_up_consistency },
    { name: "Challenges (25%)", value: breakdown.challenge_success },
    { name: "Snooze (20%)", value: breakdown.snooze_reduction },
    { name: "Sleep (20%)", value: breakdown.sleep_adherence },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
            Analytics Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            AI-powered insights into your wake-up performance
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition text-sm font-medium disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <StatCard icon={Target} label="Habit Score" value={Math.round(data.habit_score)} gradient="from-purple-500 to-pink-500" index={0} />
        <StatCard icon={Brain} label="Difficulty" value={data.difficulty_level.charAt(0).toUpperCase() + data.difficulty_level.slice(1)} gradient={DIFFICULTY_COLORS[data.difficulty_level] || "from-gray-400 to-gray-500"} index={1} />
        <StatCard icon={Flame} label="Wake Streak" value={`${data.wake_up_streak} days`} gradient="from-orange-400 to-red-500" index={2} />
        <StatCard icon={Activity} label="Accuracy" value={`${data.challenge_accuracy.toFixed(1)}%`} gradient="from-green-400 to-emerald-500" index={3} />
        <StatCard icon={Moon} label="Avg Sleep" value={`${data.sleep_duration.toFixed(1)}h`} gradient="from-indigo-400 to-blue-500" index={4} />
        <StatCard icon={Clock} label="Wake Delay" value={`${data.wake_up_delay.toFixed(1)}m`} gradient="from-cyan-400 to-teal-500" index={5} />
        <StatCard icon={BellOff} label="Avg Snooze" value={data.snooze_statistics.avg_snooze.toFixed(1)} subtitle={`Trend: ${data.snooze_statistics.snooze_trend}`} gradient="from-yellow-400 to-amber-500" index={6} />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Habit Score Gauge + Breakdown (left column) */}
        <motion.div
          variants={fadeIn} initial="hidden" animate="visible" custom={7}
          className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6"
        >
          <h3 className="text-sm font-semibold text-muted-foreground mb-4">Habit Score</h3>
          <div className="flex justify-center mb-6">
            <HabitScoreGauge score={data.habit_score} />
          </div>
          <div className="space-y-3">
            <ProgressBar label="Wake-up Consistency (35%)" value={breakdown.wake_up_consistency} color="bg-purple-500" />
            <ProgressBar label="Challenge Success (25%)" value={breakdown.challenge_success} color="bg-cyan-500" />
            <ProgressBar label="Snooze Reduction (20%)" value={breakdown.snooze_reduction} color="bg-amber-500" />
            <ProgressBar label="Sleep Adherence (20%)" value={breakdown.sleep_adherence} color="bg-emerald-500" />
          </div>
        </motion.div>

        {/* Charts (center column - 2 wide) */}
        <motion.div
          variants={fadeIn} initial="hidden" animate="visible" custom={8}
          className="lg:col-span-2 space-y-6"
        >
          {/* Habit Score Trend */}
          <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-4">Habit Score Trend</h3>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={data.charts?.habit_score_trend || []}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="label" tick={{ fill: "#9ca3af", fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: "#1f2937", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                  labelStyle={{ color: "#d1d5db" }}
                />
                <Area type="monotone" dataKey="value" stroke="#8b5cf6" fill="url(#scoreGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Consistency + Breakdown charts side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Consistency Trend */}
            <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4">Consistency Trend</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data.charts?.consistency_trend || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="label" tick={{ fill: "#9ca3af", fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: "#9ca3af", fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ background: "#1f2937", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Score Breakdown Pie */}
            <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4">Score Breakdown</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%" cy="50%"
                    innerRadius={50} outerRadius={80}
                    dataKey="value"
                    paddingAngle={3}
                    stroke="none"
                  >
                    {pieData.map((_, idx) => (
                      <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "#1f2937", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 mt-3 justify-center">
                {pieData.map((entry, idx) => (
                  <div key={entry.name} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx] }} />
                    {entry.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom row: Recommendations + Difficulty Timeline + Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommendations */}
        <motion.div
          variants={fadeIn} initial="hidden" animate="visible" custom={9}
          className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground">Recommendations</h3>
            <Lightbulb className="h-4 w-4 text-yellow-400" />
          </div>
          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {(data.recommendations || []).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-400/50" />
                <p>All clear! No recommendations right now.</p>
                <p className="text-xs mt-1">Keep up the great work!</p>
              </div>
            ) : (
              data.recommendations.map((rec: any) => {
                const style = PRIORITY_STYLES[rec.priority] || PRIORITY_STYLES.medium;
                const PriorityIcon = style.icon;
                return (
                  <div
                    key={rec.id || rec.rule_id}
                    className={`rounded-lg border p-4 ${style.bg} space-y-2`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <PriorityIcon className="h-4 w-4 flex-shrink-0" />
                        <p className="text-sm font-medium">{rec.title}</p>
                      </div>
                      <span className="text-[10px] uppercase font-bold opacity-70">
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-xs opacity-80 leading-relaxed">{rec.description}</p>
                    {rec.id && (
                      <button
                        onClick={() => handleDismissRec(rec.id)}
                        className="text-[10px] text-white/40 hover:text-white/70 transition"
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </motion.div>

        {/* Difficulty Timeline */}
        <motion.div
          variants={fadeIn} initial="hidden" animate="visible" custom={10}
          className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground">Difficulty Timeline</h3>
            <div className={`px-2.5 py-1 rounded-full text-xs font-bold ${DIFFICULTY_BG[data.difficulty_level] || "bg-gray-500/20 text-gray-400"}`}>
              {data.difficulty_level.toUpperCase()}
            </div>
          </div>

          {/* Tier progress bar */}
          <div className="flex items-center gap-1 mb-6">
            {["beginner", "easy", "medium", "hard", "expert"].map((tier) => {
              const isActive = tier === data.difficulty_level;
              const tierIdx = ["beginner", "easy", "medium", "hard", "expert"].indexOf(tier);
              const currentIdx = ["beginner", "easy", "medium", "hard", "expert"].indexOf(data.difficulty_level);
              const isPast = tierIdx <= currentIdx;
              return (
                <div
                  key={tier}
                  className={`h-2 flex-1 rounded-full transition-all ${
                    isActive
                      ? `bg-gradient-to-r ${DIFFICULTY_COLORS[tier]}`
                      : isPast
                      ? "bg-white/20"
                      : "bg-white/5"
                  }`}
                />
              );
            })}
          </div>

          <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
            {diffHistory.length === 0 ? (
              <p className="text-center text-muted-foreground text-xs py-6">
                No difficulty changes yet
              </p>
            ) : (
              diffHistory.map((entry, idx) => (
                <div key={entry.id} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${
                      idx === 0 ? "bg-purple-500" : "bg-white/20"
                    }`} />
                    {idx < diffHistory.length - 1 && (
                      <div className="w-px h-8 bg-white/10" />
                    )}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${DIFFICULTY_BG[entry.previous_difficulty || ""] || ""}`}>
                        {entry.previous_difficulty || "—"}
                      </span>
                      <ChevronRight className="h-3 w-3 text-muted-foreground" />
                      <span className={`text-xs px-2 py-0.5 rounded font-bold ${DIFFICULTY_BG[entry.new_difficulty] || ""}`}>
                        {entry.new_difficulty}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {entry.reason || "System adjustment"}
                    </p>
                    <p className="text-[10px] text-muted-foreground/50">
                      {new Date(entry.changed_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Calendar Heatmap (monthly tab) or Bar Chart (daily/weekly) */}
        <motion.div
          variants={fadeIn} initial="hidden" animate="visible" custom={11}
          className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6"
        >
          {activeTab === "monthly" && data.calendar_heatmap ? (
            <>
              <h3 className="text-sm font-semibold text-muted-foreground mb-4">
                Wake-up Calendar
              </h3>
              <CalendarHeatmap data={data.calendar_heatmap} />
              <div className="flex items-center gap-4 mt-4 justify-center">
                {[
                  { label: "Excellent", color: "bg-green-500" },
                  { label: "Good", color: "bg-emerald-400/70" },
                  { label: "Average", color: "bg-yellow-500/60" },
                  { label: "Poor", color: "bg-red-500/50" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <div className={`w-2.5 h-2.5 rounded ${item.color}`} />
                    {item.label}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <h3 className="text-sm font-semibold text-muted-foreground mb-4">
                Daily Performance
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.charts?.habit_score_trend?.slice(-7) || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="label" tick={{ fill: "#9ca3af", fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: "#9ca3af", fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ background: "#1f2937", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {(data.charts?.habit_score_trend?.slice(-7) || []).map((_, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </motion.div>
      </div>

      {/* Insights tab extra content */}
      {activeTab === "insights" && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {/* Quick Stats */}
          <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-400" /> Quick Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Challenges Today</span>
                <span className="font-medium">{data.challenges_today ?? 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Productivity</span>
                <span className="font-medium">{(data.productivity_score ?? 0).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Snoozes</span>
                <span className="font-medium">{data.snooze_statistics.total_snooze}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Best Streak</span>
                <span className="font-medium">{data.wake_up_streak} days</span>
              </div>
            </div>
          </div>

          {/* Scoring Formula */}
          <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-400" /> Scoring Formula
            </h3>
            <div className="space-y-2 text-xs text-muted-foreground font-mono">
              <p>Habit Score =</p>
              <p className="pl-4 text-purple-400">35% × Wake-up Consistency</p>
              <p className="pl-4 text-cyan-400">+ 25% × Challenge Success</p>
              <p className="pl-4 text-amber-400">+ 20% × Snooze Reduction</p>
              <p className="pl-4 text-emerald-400">+ 20% × Sleep Adherence</p>
              <div className="border-t border-white/10 mt-3 pt-3">
                <p className="text-foreground font-semibold">
                  = {data.habit_score.toFixed(1)} / 100
                </p>
              </div>
            </div>
          </div>

          {/* Difficulty Explanation */}
          <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-400" /> Adaptive Difficulty
            </h3>
            <div className="space-y-2">
              {["beginner", "easy", "medium", "hard", "expert"].map((tier) => (
                <div
                  key={tier}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all ${
                    tier === data.difficulty_level
                      ? `${DIFFICULTY_BG[tier]} font-bold`
                      : "text-muted-foreground/50"
                  }`}
                >
                  {tier === data.difficulty_level && <ChevronRight className="h-3 w-3" />}
                  <span className="capitalize">{tier}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
