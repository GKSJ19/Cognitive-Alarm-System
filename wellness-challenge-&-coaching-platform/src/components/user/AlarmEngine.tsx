import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Clock,
  Plus,
  Bell,
  Brain,
  Volume2,
  Trash2,
  Play,
  Check,
  Calendar,
  Sparkles,
  Zap,
  Flame,
  ShieldAlert,
} from 'lucide-react';
import { AlarmSound, CognitiveType, AlarmItem } from '../../types';
import { startAlarmSound, stopAlarmSound } from '../../utils/alarmAudio';

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const AlarmEngine: React.FC = () => {
  const { alarms, addAlarm, toggleAlarm, deleteAlarm, triggerTestAlarm } = useApp();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [time, setTime] = useState('07:30');
  const [label, setLabel] = useState('Morning Hydration & Mindfulness');
  const [sound, setSound] = useState<AlarmSound>('gentle_chime');
  const [cognitiveType, setCognitiveType] = useState<CognitiveType>('math');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [repeatDays, setRepeatDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [isPreviewing, setIsPreviewing] = useState(false);

  const handleToggleDay = (day: string) => {
    setRepeatDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handlePreviewSound = (soundType: AlarmSound) => {
    if (isPreviewing) {
      stopAlarmSound();
      setIsPreviewing(false);
    } else {
      startAlarmSound(soundType);
      setIsPreviewing(true);
      setTimeout(() => {
        stopAlarmSound();
        setIsPreviewing(false);
      }, 3500);
    }
  };

  const handleCreateAlarm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    addAlarm({
      time,
      label,
      enabled: true,
      repeatDays,
      sound,
      cognitiveType,
      cognitiveDifficulty: difficulty,
    });

    setShowAddModal(false);
    stopAlarmSound();
    setIsPreviewing(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black uppercase tracking-wider backdrop-blur-md flex items-center space-x-1.5">
              <Brain className="w-3.5 h-3.5 text-amber-300" />
              <span>Cognitive Lock Technology</span>
            </span>
            <button
              onClick={() => triggerTestAlarm()}
              className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-xl text-xs font-black shadow-md transition-all flex items-center space-x-1.5 active:scale-95"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Test Alarm & Challenge Now</span>
            </button>
          </div>

          <h2 className="text-2xl font-black tracking-tight">
            Smart Cognitive Wellness Alarms
          </h2>
          <p className="text-xs text-emerald-100 max-w-xl">
            Wake up your mind before turning off your alarm. Solve math, trivia, or memory puzzles to unlock the snooze or dismiss button!
          </p>
        </div>

        <Clock className="absolute -right-8 -bottom-8 w-44 h-44 text-white/10 pointer-events-none" />
      </div>

      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">Your Active Alarms</h3>
          <p className="text-xs text-slate-500">Configured times with Web Audio tones & brain locks</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-md transition-all flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Alarm</span>
        </button>
      </div>

      {/* Alarms List */}
      <div className="grid gap-4 sm:grid-cols-2">
        {alarms.map((alarm) => (
          <div
            key={alarm.id}
            className={`p-5 rounded-3xl border transition-all relative ${
              alarm.enabled
                ? 'bg-white border-slate-200 shadow-md ring-1 ring-emerald-500/10'
                : 'bg-slate-50 border-slate-200/80 opacity-70'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-3xl font-black text-slate-900 tracking-tight">
                    {alarm.time}
                  </span>
                  {alarm.snoozeCount > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                      Snoozed {alarm.snoozeCount}x
                    </span>
                  )}
                </div>

                <h4 className="text-xs font-bold text-slate-800 mt-1">
                  {alarm.label}
                </h4>
              </div>

              {/* Toggle Switch */}
              <button
                onClick={() => toggleAlarm(alarm.id)}
                className={`w-12 h-7 rounded-full transition-colors p-1 flex items-center ${
                  alarm.enabled ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-white shadow-md" />
              </button>
            </div>

            {/* Badges */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-bold flex items-center space-x-1">
                <Volume2 className="w-3 h-3 text-cyan-600" />
                <span className="capitalize">{alarm.sound.replace('_', ' ')}</span>
              </span>

              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-bold flex items-center space-x-1">
                <Brain className="w-3.5 h-3.5 text-emerald-600" />
                <span className="capitalize">{alarm.cognitiveType} ({alarm.cognitiveDifficulty})</span>
              </span>

              {/* Repeat Days */}
              <div className="flex items-center space-x-1 text-[10px] font-semibold text-slate-500 ml-auto">
                {alarm.repeatDays.map((d) => (
                  <span key={d} className="px-1.5 py-0.5 bg-slate-100 rounded">
                    {d}
                  </span>
                ))}
              </div>
            </div>

            {/* Delete Action */}
            <div className="mt-3 flex items-center justify-between text-xs">
              <button
                onClick={() => triggerTestAlarm(alarm)}
                className="text-emerald-600 hover:text-emerald-700 font-bold text-[11px] flex items-center space-x-1"
              >
                <Play className="w-3 h-3" />
                <span>Test Sound</span>
              </button>

              <button
                onClick={() => deleteAlarm(alarm.id)}
                className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Alarm Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 space-y-5 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">Create Smart Alarm</h3>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  stopAlarmSound();
                  setIsPreviewing(false);
                }}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateAlarm} className="space-y-4">
              
              {/* Time Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alarm Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full text-lg font-black p-3 bg-slate-50 border border-slate-200 rounded-2xl text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </div>

              {/* Label */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alarm Label / Purpose</label>
                <input
                  type="text"
                  placeholder="e.g. Zone-2 Cardio & Morning Hydration"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </div>

              {/* Repeat Days */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Repeat Days</label>
                <div className="flex flex-wrap gap-1.5">
                  {DAYS_OF_WEEK.map((day) => {
                    const selected = repeatDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleToggleDay(day)}
                        className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                          selected
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Audio Sound Selection with Preview */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Alarm Audio Sound Tone</label>
                  <button
                    type="button"
                    onClick={() => handlePreviewSound(sound)}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{isPreviewing ? 'Stop Preview' : 'Listen Tone'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'gentle_chime', label: 'Gentle Chime' },
                    { id: 'energetic_synth', label: 'Energetic Synth' },
                    { id: 'nature_birds', label: 'Nature Birds' },
                    { id: 'digital_beep', label: 'Digital Beep' },
                    { id: 'loud_siren', label: 'Loud Siren' },
                  ].map((snd) => (
                    <button
                      key={snd.id}
                      type="button"
                      onClick={() => {
                        setSound(snd.id as AlarmSound);
                        if (isPreviewing) {
                          startAlarmSound(snd.id);
                        }
                      }}
                      className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                        sound === snd.id
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {snd.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cognitive Challenge Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Cognitive Challenge Type (Snooze Lock)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'math', name: 'Math Puzzles', desc: 'Mental Arithmetic' },
                    { id: 'logic', name: 'Logic Puzzles', desc: 'Critical Thinking' },
                    { id: 'memory', name: 'Memory Challenges', desc: 'Recall & Sequence' },
                    { id: 'scramble', name: 'Word Scramble', desc: 'Anagrams & Words' },
                    { id: 'pattern', name: 'Pattern Sequence', desc: 'Spatial Logic' },
                    { id: 'riddle', name: 'Riddles & Quizzes', desc: 'Mind Activation' },
                  ].map((cog) => (
                    <button
                      key={cog.id}
                      type="button"
                      onClick={() => setCognitiveType(cog.id as CognitiveType)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        cognitiveType === cog.id
                          ? 'bg-teal-50 border-teal-500 text-teal-900 ring-2 ring-teal-500/20'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <p className="text-xs font-extrabold">{cog.name}</p>
                      <p className="text-[10px] text-slate-500">{cog.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Challenge Difficulty</label>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  {(['easy', 'medium', 'hard'] as const).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setDifficulty(diff)}
                      className={`flex-1 py-1.5 text-xs font-bold capitalize rounded-lg transition-all ${
                        difficulty === diff
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center space-x-2 mt-4"
              >
                <Sparkles className="w-4 h-4" />
                <span>Save & Set Alarm</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
