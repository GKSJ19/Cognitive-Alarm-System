import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  Mail,
  Camera,
  Target,
  Bell,
  Clock,
  Shield,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  Sparkles,
  Award,
  Key,
  Download,
  Brain,
  Volume2,
  Lock,
  Heart,
  ChevronRight,
  Flame,
} from 'lucide-react';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
];

const DEFAULT_HEALTH_GOALS = [
  '5:30 AM Early Wake-Up Routine',
  'Zero Snooze Consistency',
  'Daily Morning Sunlight (15 min)',
  '8 Hours Sleep Target',
  'Cognitive Math & Logic Warmup',
];

export const ProfileSettingsView: React.FC = () => {
  const { currentUser, updateUserProfile } = useApp();

  // Form States
  const [name, setName] = useState(currentUser.name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [bio, setBio] = useState(currentUser.bio || 'Dedicated to early morning wake-ups and cognitive performance.');
  const [avatar, setAvatar] = useState(currentUser.avatar || PRESET_AVATARS[0]);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // Health Goals State
  const [goals, setGoals] = useState<string[]>(
    currentUser.healthGoals && currentUser.healthGoals.length > 0
      ? currentUser.healthGoals
      : DEFAULT_HEALTH_GOALS
  );
  const [newGoalInput, setNewGoalInput] = useState('');

  // Wake-up & Alarm Preferences
  const [defaultSound, setDefaultSound] = useState('gentle_chime');
  const [defaultCognitiveType, setDefaultCognitiveType] = useState('math');
  const [defaultDifficulty, setDefaultDifficulty] = useState('medium');
  const [maxSnooze, setMaxSnooze] = useState('1');

  // Notification Toggles
  const [notifyMorning, setNotifyMorning] = useState(true);
  const [notifyBedtime, setNotifyBedtime] = useState(true);
  const [notifyCoachMsg, setNotifyCoachMsg] = useState(true);
  const [notifyWeeklyEmail, setNotifyWeeklyEmail] = useState(false);

  // Feedback State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name,
      email,
      bio,
      avatar,
      healthGoals: goals,
    });
    showToast('Profile settings saved successfully!');
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalInput.trim()) return;
    if (goals.includes(newGoalInput.trim())) return;
    setGoals([...goals, newGoalInput.trim()]);
    setNewGoalInput('');
  };

  const handleRemoveGoal = (goalToRemove: string) => {
    setGoals(goals.filter((g) => g !== goalToRemove));
  };

  const handleResetPassword = () => {
    showToast(`Password reset link sent to ${email}`);
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentUser, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `wellness_profile_${currentUser.name.replace(/\s+/g, '_').toLowerCase()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Downloaded wellness profile JSON.');
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-extrabold flex items-center space-x-2 animate-fade-in shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Profile Overview Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <img
                src={avatar}
                alt={name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-4 ring-emerald-500/20 shadow-xs"
              />
              <button
                type="button"
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="absolute bottom-0 right-0 p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-xs transition-transform active:scale-90"
                title="Change Avatar"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 truncate">{name}</h2>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200/80 uppercase tracking-tight">
                  Level {currentUser.level || 1} Member
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">{email}</p>
              <p className="text-xs text-slate-600 font-medium italic truncate max-w-md mt-0.5">
                "{bio}"
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-stretch sm:self-auto justify-end">
            <button
              onClick={handleSaveProfile}
              className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-extrabold rounded-xl flex items-center justify-center space-x-2 shadow-2xs transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>

        {/* Avatar Selection Picker Drawer */}
        {showAvatarPicker && (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-800">Select Preset Avatar</span>
              <button
                onClick={() => setShowAvatarPicker(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                Close
              </button>
            </div>

            <div className="flex items-center space-x-3 overflow-x-auto pb-2">
              {PRESET_AVATARS.map((preset, idx) => (
                <img
                  key={idx}
                  src={preset}
                  alt={`Avatar ${idx}`}
                  onClick={() => {
                    setAvatar(preset);
                    setShowAvatarPicker(false);
                  }}
                  className={`w-12 h-12 rounded-full object-cover cursor-pointer transition-transform hover:scale-105 ${
                    avatar === preset ? 'ring-4 ring-emerald-500 scale-105' : 'opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200/60 flex items-center space-x-2">
              <input
                type="text"
                placeholder="Or paste custom image URL..."
                value={customAvatarUrl}
                onChange={(e) => setCustomAvatarUrl(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
              />
              <button
                type="button"
                onClick={() => {
                  if (customAvatarUrl.trim()) {
                    setAvatar(customAvatarUrl.trim());
                    setCustomAvatarUrl('');
                    setShowAvatarPicker(false);
                  }
                }}
                className="px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl"
              >
                Apply
              </button>
            </div>
          </div>
        )}

        {/* User Stats Quick Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
            <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-tight">Active Streak</p>
            <p className="text-base font-black text-amber-600 mt-0.5 flex items-center justify-center space-x-1">
              <Flame className="w-4 h-4 text-amber-500 inline" />
              <span>{currentUser.streak} Days</span>
            </p>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
            <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-tight">Total Points</p>
            <p className="text-base font-black text-emerald-700 mt-0.5 flex items-center justify-center space-x-1">
              <Award className="w-4 h-4 text-emerald-600 inline" />
              <span>{currentUser.points} Pts</span>
            </p>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
            <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-tight">Assigned Coach</p>
            <p className="text-xs font-black text-slate-800 mt-1 truncate">
              {currentUser.assignedCoachName || 'Coach Marcus Vance'}
            </p>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
            <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-tight">Member Since</p>
            <p className="text-xs font-black text-slate-800 mt-1">{currentUser.joinedDate || '2025-01-10'}</p>
          </div>
        </div>
      </div>

      {/* Main Settings Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* SECTION 1: PERSONAL INFORMATION */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center space-x-2">
            <User className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-extrabold text-slate-900">Personal Information</h3>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">
                Full Display Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">
                Personal Bio & Morning Mantra
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Share your morning wake-up goals or mindset..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </form>
        </div>

        {/* SECTION 2: HEALTH & WELLNESS GOALS */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center space-x-2">
            <Target className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-extrabold text-slate-900">Personal Health & Wellness Goals</h3>
          </div>

          <p className="text-xs text-slate-500 font-medium">
            Define target morning habits and wake-up milestones you want your coach to track.
          </p>

          <form onSubmit={handleAddGoal} className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="e.g. 10 mins Morning Breathing..."
              value={newGoalInput}
              onChange={(e) => setNewGoalInput(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl flex items-center space-x-1 shadow-2xs whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Goal</span>
            </button>
          </form>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {goals.map((goal, idx) => (
              <div
                key={idx}
                className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-2"
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="text-xs font-bold text-slate-800 truncate">{goal}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveGoal(goal)}
                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                  title="Remove goal"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3: WAKE-UP & ALARM PREFERENCES */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center space-x-2">
            <Brain className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-extrabold text-slate-900">Default Alarm & Cognitive Preferences</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">
                Default Wake-Up Sound
              </label>
              <select
                value={defaultSound}
                onChange={(e) => setDefaultSound(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="gentle_chime">Gentle Zen Chime</option>
                <option value="energetic_synth">Energetic Morning Synth</option>
                <option value="nature_birds">Nature Birds & Forest Stream</option>
                <option value="radar_pulse">Radar Pulse Alert</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">
                Default Cognitive Challenge Task
              </label>
              <select
                value={defaultCognitiveType}
                onChange={(e) => setDefaultCognitiveType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="math">Speed Arithmetic (Math Equations)</option>
                <option value="trivia">Cognitive Trivia & Knowledge</option>
                <option value="pattern">Visual Sequence Pattern</option>
                <option value="word">Word Anagram & Unscramble</option>
                <option value="riddle">Mindfulness Brain Riddle</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Default Difficulty
                </label>
                <select
                  value={defaultDifficulty}
                  onChange={(e) => setDefaultDifficulty(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="easy">Easy (1 Step)</option>
                  <option value="medium">Medium (2 Steps)</option>
                  <option value="hard">Hard (3 Steps)</option>
                  <option value="extreme">Extreme Mode</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Snooze Protocol
                </label>
                <select
                  value={maxSnooze}
                  onChange={(e) => setMaxSnooze(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="0">Strict No Snooze (Recommended)</option>
                  <option value="1">1 Snooze Allowed (5 Mins)</option>
                  <option value="2">2 Snoozes Max</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: NOTIFICATION REMINDERS & SECURITY */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center space-x-2">
            <Bell className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-extrabold text-slate-900">Notifications & Security</h3>
          </div>

          <div className="space-y-3">
            {/* Toggle 1 */}
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-900">Morning Wake-up Alert</p>
                <p className="text-[10px] text-slate-500">Pre-alarm audio prompt 5 mins prior</p>
              </div>
              <input
                type="checkbox"
                checked={notifyMorning}
                onChange={(e) => setNotifyMorning(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 cursor-pointer"
              />
            </div>

            {/* Toggle 2 */}
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-900">Bedtime Wind-Down Reminder</p>
                <p className="text-[10px] text-slate-500">Digital sunset notification at 10 PM</p>
              </div>
              <input
                type="checkbox"
                checked={notifyBedtime}
                onChange={(e) => setNotifyBedtime(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 cursor-pointer"
              />
            </div>

            {/* Toggle 3 */}
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-900">Coach Messages & Feedback</p>
                <p className="text-[10px] text-slate-500">Instant notification on coach notes</p>
              </div>
              <input
                type="checkbox"
                checked={notifyCoachMsg}
                onChange={(e) => setNotifyCoachMsg(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 cursor-pointer"
              />
            </div>

            {/* Security Actions */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-2">
              <button
                type="button"
                onClick={handleResetPassword}
                className="w-full sm:flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Reset Password</span>
              </button>

              <button
                type="button"
                onClick={handleExportData}
                className="w-full sm:flex-1 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export Wellness Data</span>
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
