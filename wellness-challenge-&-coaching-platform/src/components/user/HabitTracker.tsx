import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Brain,
  Moon,
  Sun,
  Bell,
  Clock,
  Plus,
  Flame,
  CheckCircle2,
  TrendingUp,
  Activity,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export const HabitTrackerView: React.FC = () => {
  const { habits, updateHabitProgress, toggleHabitComplete, addNewHabit, logs, logDailyMetrics } = useApp();

  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitTarget, setNewHabitTarget] = useState(1);
  const [newHabitUnit, setNewHabitUnit] = useState('session');
  const [showAddHabit, setShowAddHabit] = useState(false);

  // Today log metrics state
  const todayLog = logs[0] || { cognitiveAccuracy: 100, solveTimeSeconds: 12, sleepHours: 7.5, mood: 'good' };
  const [mood, setMood] = useState<'great' | 'good' | 'okay' | 'tired' | 'stressed'>(todayLog.mood || 'good');

  const handleMoodSelect = (selectedMood: 'great' | 'good' | 'okay' | 'tired' | 'stressed') => {
    setMood(selectedMood);
    logDailyMetrics({ mood: selectedMood });
  };

  const handleAddHabitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;

    addNewHabit({
      title: newHabitTitle,
      category: 'sleep',
      targetValue: newHabitTarget,
      unit: newHabitUnit,
      icon: 'Moon',
    });

    setNewHabitTitle('');
    setShowAddHabit(false);
  };

  const getHabitIcon = (iconName: string) => {
    switch (iconName) {
      case 'Moon': return <Moon className="w-5 h-5 text-indigo-500" />;
      case 'Sun': return <Sun className="w-5 h-5 text-amber-500" />;
      case 'Bell': return <Bell className="w-5 h-5 text-purple-500" />;
      case 'Clock': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'Brain': return <Brain className="w-5 h-5 text-amber-500" />;
      default: return <Moon className="w-5 h-5 text-indigo-500" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Mood Check-In Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Daily Morning Energy & Focus Check-In</h3>
            <p className="text-xs text-slate-500">How alert is your mind today?</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
            Current: <span className="capitalize font-bold">{mood}</span>
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2 sm:gap-3 pt-1">
          {[
            { id: 'great', label: 'Razor Sharp', emoji: '😁', color: 'hover:bg-emerald-50 border-emerald-200' },
            { id: 'good', label: 'Focused', emoji: '😊', color: 'hover:bg-teal-50 border-teal-200' },
            { id: 'okay', label: 'Moderate', emoji: '😐', color: 'hover:bg-amber-50 border-amber-200' },
            { id: 'tired', label: 'Groggy', emoji: '😴', color: 'hover:bg-purple-50 border-purple-200' },
            { id: 'stressed', label: 'Restless', emoji: '😫', color: 'hover:bg-rose-50 border-rose-200' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => handleMoodSelect(m.id as any)}
              className={`p-3 rounded-2xl border transition-all text-center flex flex-col items-center space-y-1 ${
                mood === m.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/20'
                  : `bg-slate-50 text-slate-700 ${m.color}`
              }`}
            >
              <span className="text-xl">{m.emoji}</span>
              <span className="text-[11px] font-semibold">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Habits Checklist Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span>Daily Sleep & Wake-Up Habits</span>
          </h3>

          <button
            onClick={() => setShowAddHabit(!showAddHabit)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Habit</span>
          </button>
        </div>

        {/* Add Habit Inline Form */}
        {showAddHabit && (
          <form onSubmit={handleAddHabitSubmit} className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 space-y-3">
            <h4 className="text-xs font-bold text-emerald-900">Create New Habit</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Habit Title (e.g. Read 15 pages)"
                value={newHabitTitle}
                onChange={(e) => setNewHabitTitle(e.target.value)}
                className="text-xs p-2.5 bg-white border border-emerald-200 rounded-xl focus:outline-none"
                required
              />
              <input
                type="number"
                placeholder="Target Goal (e.g. 1)"
                value={newHabitTarget}
                onChange={(e) => setNewHabitTarget(Number(e.target.value))}
                className="text-xs p-2.5 bg-white border border-emerald-200 rounded-xl focus:outline-none"
                required
              />
              <input
                type="text"
                placeholder="Unit (e.g. session, pages)"
                value={newHabitUnit}
                onChange={(e) => setNewHabitUnit(e.target.value)}
                className="text-xs p-2.5 bg-white border border-emerald-200 rounded-xl focus:outline-none"
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowAddHabit(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 bg-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-2xs"
              >
                Save Habit
              </button>
            </div>
          </form>
        )}

        {/* 🌙 Sleep Habits Section */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
            <Moon className="w-5 h-5 text-indigo-600" />
            <h4 className="text-sm font-bold text-slate-900">🌙 Sleep Habits</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {habits
              .filter((h) => h.category === 'sleep' || h.title.toLowerCase().includes('sleep') || h.title.toLowerCase().includes('bed') || h.title.toLowerCase().includes('screen'))
              .map((habit) => {
                const progressPercent = Math.min(100, Math.round((habit.currentValue / habit.targetValue) * 100));

                return (
                  <div
                    key={habit.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3.5 ${
                      habit.completedToday
                        ? 'bg-indigo-50/40 border-indigo-200 shadow-2xs'
                        : 'bg-slate-50/60 border-slate-200/80 hover:border-indigo-200'
                    }`}
                  >
                    {/* Top Row: Icon on Left, Streak Badge + Checkmark Button on Right */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="p-2 rounded-xl bg-indigo-100/70 text-indigo-700 flex-shrink-0">
                        {getHabitIcon(habit.icon)}
                      </div>

                      <div className="flex items-center space-x-1.5 flex-shrink-0">
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-full border border-amber-200/80 flex items-center space-x-1 whitespace-nowrap">
                          <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span>{habit.streakDays}d</span>
                        </span>
                        <button
                          onClick={() => toggleHabitComplete(habit.id)}
                          className={`p-1.5 rounded-xl transition-all flex items-center justify-center ${
                            habit.completedToday
                              ? 'bg-indigo-600 text-white shadow-2xs'
                              : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-100'
                          }`}
                          title={habit.completedToday ? "Habit Completed Today" : "Mark as Complete"}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Middle Content: Full Width Title & Target Subtext */}
                    <div className="space-y-1 w-full">
                      <h5 className="text-xs font-extrabold text-slate-900 leading-snug">{habit.title}</h5>
                      <p className="text-xs font-semibold text-slate-700">
                        Target: {habit.currentValue} / {habit.targetValue} {habit.unit}
                      </p>
                    </div>

                    {/* Bottom Row: Progress Bar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="w-full bg-slate-200/70 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 rounded-full ${
                            habit.completedToday ? 'bg-indigo-600' : 'bg-indigo-400'
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-xs text-slate-600 font-bold">
                        <span>Progress</span>
                        <span className="text-indigo-700 font-bold">{progressPercent}% complete</span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* 🌅 Wake-up Habits Section */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
            <Sun className="w-5 h-5 text-amber-500" />
            <h4 className="text-sm font-bold text-slate-900">🌅 Wake-up Habits</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {habits
              .filter((h) => h.category === 'alarm' || h.title.toLowerCase().includes('wake') || h.title.toLowerCase().includes('snooz') || h.title.toLowerCase().includes('challenge'))
              .map((habit) => {
                const progressPercent = Math.min(100, Math.round((habit.currentValue / habit.targetValue) * 100));

                return (
                  <div
                    key={habit.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3.5 ${
                      habit.completedToday
                        ? 'bg-emerald-50/50 border-emerald-200 shadow-2xs'
                        : 'bg-slate-50/60 border-slate-200/80 hover:border-emerald-200'
                    }`}
                  >
                    {/* Top Row: Icon on Left, Streak Badge + Checkmark Button on Right */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="p-2 rounded-xl bg-emerald-100/70 text-emerald-700 flex-shrink-0">
                        {getHabitIcon(habit.icon)}
                      </div>

                      <div className="flex items-center space-x-1.5 flex-shrink-0">
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-full border border-amber-200/80 flex items-center space-x-1 whitespace-nowrap">
                          <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span>{habit.streakDays}d</span>
                        </span>
                        <button
                          onClick={() => toggleHabitComplete(habit.id)}
                          className={`p-1.5 rounded-xl transition-all flex items-center justify-center ${
                            habit.completedToday
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-100'
                          }`}
                          title={habit.completedToday ? "Habit Completed Today" : "Mark as Complete"}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Middle Content: Full Width Title & Target Subtext */}
                    <div className="space-y-1 w-full">
                      <h5 className="text-xs font-extrabold text-slate-900 leading-snug">{habit.title}</h5>
                      <p className="text-xs font-semibold text-slate-700">
                        Target: {habit.currentValue} / {habit.targetValue} {habit.unit}
                      </p>
                    </div>

                    {/* Bottom Row: Progress Bar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="w-full bg-slate-200/70 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 rounded-full ${
                            habit.completedToday ? 'bg-emerald-500' : 'bg-teal-500'
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-xs text-slate-600 font-bold">
                        <span>Progress</span>
                        <span className="text-emerald-700 font-bold">{progressPercent}% complete</span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Analytics Chart: Weekly Cognitive Accuracy & Speed Trend */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-3">
        <h3 className="text-sm font-bold text-slate-800">Weekly Cognitive Accuracy & Speed Trend</h3>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={logs}>
              <defs>
                <linearGradient id="colorCog" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
              />
              <Area type="monotone" dataKey="cognitiveAccuracy" stroke="#f59e0b" fillOpacity={1} fill="url(#colorCog)" name="Accuracy %" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
