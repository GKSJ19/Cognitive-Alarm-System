import { useEffect, useState } from "react";
import { Activity, Bell, Brain, ChevronUp, Clock, User, Play, Loader2 } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { apiClient } from "../services/apiClient";
import type { DashboardStats, ApiResponse } from "../types";
import { getGreeting } from "../utils";

export function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const displayName = user?.full_name || user?.email?.split("@")[0] || "User";

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiClient.get<ApiResponse<DashboardStats>>("/dashboard/stats");
        setStats(response.data.data);
      } catch (err: any) {
        console.error("Failed to load dashboard stats:", err);
        setError("Could not load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex h-full min-h-[50vh] items-center justify-center">
        <p className="text-red-400">{error || "No data available."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background/50 p-6 space-y-8">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{getGreeting()}, {displayName}.</h1>
          <p className="text-muted-foreground mt-1">Here is your cognitive wake-up summary.</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition">
            <Bell className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-purple-500 p-0.5">
            <div className="h-full w-full rounded-full bg-background flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
          </div>
        </div>
      </header>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md relative overflow-hidden group"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-green-500/20 text-green-500">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="font-medium text-muted-foreground">Habit Score</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{stats.habit_score}</span>
            <span className="text-sm text-green-400 flex items-center"><ChevronUp className="w-4 h-4" /> {stats.habit_score_change}%</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md relative overflow-hidden group"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-blue-500/20 text-blue-500">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-medium text-muted-foreground">Avg. Wake Time</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{stats.avg_wake_time.split(" ")[0]}</span>
            <span className="text-sm text-muted-foreground">{stats.avg_wake_time.split(" ")[1]}</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md relative overflow-hidden group"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-purple-500/20 text-purple-500">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="font-medium text-muted-foreground">Puzzle Accuracy</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{stats.puzzle_accuracy}%</span>
            <span className="text-sm text-green-400 flex items-center"><ChevronUp className="w-4 h-4" /> {stats.puzzle_accuracy_change}%</span>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-semibold">Weekly Habit Score</h3>
            <select className="bg-background/50 border border-white/10 rounded-md px-3 py-1 text-sm outline-none">
              <option>This Week</option>
              <option>Last Week</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.weekly_scores}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Next Alarms */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Upcoming Alarms</h3>
            <button className="text-primary text-sm font-medium hover:underline">Manage All</button>
          </div>
          <div className="space-y-4 flex-1">
            {stats.upcoming_alarms.map((alarm, i) => (
              <div key={i} className={`p-4 rounded-xl border ${alarm.active ? 'border-primary/50 bg-primary/10' : 'border-white/10 bg-white/5'} flex items-center justify-between transition-colors`}>
                <div>
                  <h4 className={`text-xl font-bold tracking-tight ${!alarm.active && 'text-muted-foreground'}`}>{alarm.time}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-medium text-muted-foreground">{alarm.days}</span>
                    <span className="w-1 h-1 rounded-full bg-border"></span>
                    <span className="text-xs font-medium text-muted-foreground">{alarm.type}</span>
                  </div>
                </div>
                <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${alarm.active ? 'bg-primary' : 'bg-muted'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${alarm.active ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition">
            <Play className="w-4 h-4" /> Test Next Alarm
          </button>
        </motion.div>
      </div>
    </div>
  );
}
