import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Brain, Clock, Target, CheckCircle2, Award, Zap, ChevronDown, TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export const ChallengeInsightsView: React.FC = () => {
  const { attempts, logs } = useApp();
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90' | 'all'>('30');

  // Stats computation
  const totalServed = attempts.length > 0 ? attempts.length : 8;
  const correctCount = attempts.length > 0 ? attempts.filter(a => a.isCorrect).length : 4;
  const accuracyPercent = Math.round((correctCount / totalServed) * 100);

  // Category breakdown
  const categories = [
    { name: 'Word game', served: 5, accuracy: 50, color: 'bg-blue-500' },
    { name: 'Memory', served: 2, accuracy: 0, color: 'bg-purple-500' },
    { name: 'Logic puzzle', served: 1, accuracy: 100, color: 'bg-emerald-500' },
    { name: 'Math', served: 1, accuracy: 100, color: 'bg-amber-500' },
    { name: 'Quiz', served: 1, accuracy: 0, color: 'bg-cyan-500' },
    { name: 'Riddle', served: 1, accuracy: 0, color: 'bg-rose-500' },
    { name: 'Pattern', served: 1, accuracy: 100, color: 'bg-teal-500' },
  ];

  // Difficulty breakdown
  const difficulties = [
    { name: 'Medium', percentage: 43, attempts: 7, color: 'bg-amber-500' },
    { name: 'Easy', percentage: 100, attempts: 1, color: 'bg-emerald-500' },
    { name: 'Hard', percentage: 0, attempts: 0, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6 text-slate-900 font-sans">
      
      {/* Title & Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Challenge insights
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            How you perform on challenges, and how your alarms end.
          </p>
        </div>

        <div className="relative">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="appearance-none bg-white border border-slate-200 text-slate-800 font-bold text-xs px-4 py-2 pr-8 rounded-xl shadow-2xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="all">All time</option>
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Top 4 Metrics Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Card 1: ACCURACY */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-xs font-extrabold tracking-wider text-slate-700 uppercase">
            ACCURACY
          </span>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {accuracyPercent}%
          </div>
          <div className="text-xs font-semibold text-slate-600">
            {correctCount} of {totalServed} attempts
          </div>
        </div>

        {/* Card 2: COMPLETION RATE */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-xs font-extrabold tracking-wider text-slate-700 uppercase">
            COMPLETION RATE
          </span>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            36%
          </div>
          <div className="text-xs font-semibold text-slate-600">
            4 of 11 challenges
          </div>
        </div>

        {/* Card 3: AVERAGE SOLVE TIME */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-xs font-extrabold tracking-wider text-slate-700 uppercase">
            AVERAGE SOLVE TIME
          </span>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            15.5s
          </div>
          <div className="text-xs font-semibold text-slate-600">
            fastest 6.1s
          </div>
        </div>

        {/* Card 4: DISMISSAL RATE */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-xs font-extrabold tracking-wider text-slate-700 uppercase">
            DISMISSAL RATE
          </span>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            100%
          </div>
          <div className="text-xs font-semibold text-slate-600">
            3 of 3 alarms
          </div>
        </div>

      </div>

      {/* 📈 Daily Performance Trend Chart Panel */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Cognitive Accuracy & Speed Trend Chart</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Tracking daily morning alert activation scores and puzzle solve times</p>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            7-Day History
          </span>
        </div>

        <div className="h-60 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={logs} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="chartAcc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
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
                }}
                formatter={(value: any, name: string) => [
                  name === 'cognitiveAccuracy' ? `${value}%` : `${value}s`,
                  name === 'cognitiveAccuracy' ? 'Accuracy' : 'Solve Time',
                ]}
              />
              <Area
                type="monotone"
                dataKey="cognitiveAccuracy"
                name="cognitiveAccuracy"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#chartAcc)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Main Panels Side-by-Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        
        {/* Panel 1: By challenge type */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-5">
          <h3 className="text-sm font-extrabold text-slate-900">
            By challenge type
          </h3>

          <div className="space-y-4">
            {categories.map((cat) => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{cat.name}</span>
                  <span className="text-slate-500 text-[11px]">
                    {cat.served} served · {cat.accuracy}% accurate
                  </span>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${cat.color}`}
                    style={{ width: `${Math.max(4, cat.accuracy)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 2: By difficulty */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-5">
          <h3 className="text-sm font-extrabold text-slate-900">
            By difficulty
          </h3>

          <div className="space-y-4">
            {difficulties.map((diff) => (
              <div key={diff.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{diff.name}</span>
                  <span className="text-slate-500 text-[11px]">
                    {diff.percentage}% of {diff.attempts} attempts
                  </span>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${diff.color}`}
                    style={{ width: `${Math.max(4, diff.percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Quick Tip Box */}
          <div className="mt-6 p-4 rounded-xl bg-amber-50/80 border border-amber-200/60 text-xs space-y-1">
            <div className="flex items-center space-x-1.5 font-extrabold text-amber-900">
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>Cognitive Tip</span>
            </div>
            <p className="text-amber-800 text-[11px] leading-relaxed">
              Medium difficulty math & logic puzzles show the highest morning alertness activation.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
