import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Smartphone,
  Monitor,
  Clock,
  Award,
  Flame,
  Brain,
  MessageSquare,
  Trophy,
  CheckCircle2,
  Wifi,
  BatteryCharging,
  Signal,
  LogOut,
  User,
  Shield,
  UserCheck,
  ChevronLeft,
  Settings,
  Sparkles,
} from 'lucide-react';
import { AlarmEngine } from '../user/AlarmEngine';
import { UserDashboard } from '../user/UserDashboard';
import { ChallengeEngineView } from '../user/ChallengeEngine';
import { HabitTrackerView } from '../user/HabitTracker';
import { AiAssistantView } from '../user/AiAssistant';
import { LeaderboardAndBadgesView } from '../user/LeaderboardAndBadges';
import { ProfileSettingsView } from '../user/ProfileSettings';
import { CoachDashboard } from '../coach/CoachDashboard';
import { AdminDashboard } from '../admin/AdminDashboard';
import { LoginRegister } from '../auth/LoginRegister';

type MobileTab = 'alarm' | 'overview' | 'challenges' | 'habits' | 'ai' | 'leaderboard' | 'settings';

export const MobileFrame: React.FC = () => {
  const { isAuthenticated, currentRole, switchUserRole, currentUser, logout } = useApp();
  const [isEmulatorMode, setIsEmulatorMode] = useState(true);
  const [activeTab, setActiveTab] = useState<MobileTab>('alarm');
  const [currentTimeStr, setCurrentTimeStr] = useState('10:42');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!isAuthenticated) {
    return <LoginRegister />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-start p-2 sm:p-6">
      
      {/* Top Floating Control Bar */}
      <div className="w-full max-w-5xl bg-white rounded-2xl border border-slate-200 shadow-sm p-3 mb-4 flex flex-wrap items-center justify-between gap-3">
        
        {/* User Role Switcher & Profile */}
        <div className="flex items-center space-x-3">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-9 h-9 rounded-full ring-2 ring-emerald-500/30 object-cover"
          />
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-black text-slate-900">{currentUser.name}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                {currentRole}
              </span>
            </div>
            <p className="text-[10px] text-slate-500">{currentUser.email}</p>
          </div>
        </div>

        {/* Quick Role Switch Buttons */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl space-x-1">
          <button
            onClick={() => switchUserRole('user')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
              currentRole === 'user'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            User
          </button>
          <button
            onClick={() => switchUserRole('coach')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
              currentRole === 'coach'
                ? 'bg-white text-cyan-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Coach
          </button>
          <button
            onClick={() => switchUserRole('admin')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
              currentRole === 'admin'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Admin
          </button>
        </div>

        {/* View Mode Toggle (Android Emulator vs Desktop Web) */}
        <div className="flex items-center space-x-2">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setIsEmulatorMode(true)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center space-x-1.5 ${
                isEmulatorMode ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Android Emulator</span>
            </button>
            <button
              onClick={() => setIsEmulatorMode(false)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center space-x-1.5 ${
                !isEmulatorMode ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop View</span>
            </button>
          </div>

          <button
            onClick={logout}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Main Container */}
      {isEmulatorMode ? (
        /* Android Phone Emulator Shell */
        <div className="w-full max-w-[420px] bg-slate-950 rounded-[40px] sm:rounded-[48px] p-2.5 sm:p-3.5 shadow-2xl ring-4 sm:ring-8 ring-slate-800/80 my-1 sm:my-2 relative">
          
          {/* Inner Phone Screen */}
          <div className="bg-slate-50 rounded-[32px] sm:rounded-[38px] overflow-hidden flex flex-col h-[780px] max-h-[82vh] min-h-[600px] relative border border-slate-200">
            
            {/* Android Status Bar */}
            <div className="bg-slate-900 text-white px-4 sm:px-5 py-2 flex items-center justify-between text-[11px] font-bold z-20 flex-shrink-0">
              <span>{currentTimeStr}</span>

              {/* Camera Notch Punch Hole */}
              <div className="w-3 h-3 bg-black rounded-full ring-1 ring-slate-800" />

              <div className="flex items-center space-x-2 text-slate-300">
                <Signal className="w-3 h-3" />
                <Wifi className="w-3 h-3" />
                <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>

            {/* Android App Header with Verve Wellness Logo & Title */}
            <div className="bg-white px-3.5 py-2.5 border-b border-slate-200 flex items-center justify-between z-20 shadow-xs flex-shrink-0">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-sm ring-2 ring-emerald-500/20 flex-shrink-0">
                  <Sparkles className="w-4.5 h-4.5 animate-pulse" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-black tracking-tight text-slate-900 truncate">
                    Verve Mind & Wellness
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider -mt-0.5 truncate">
                    {currentRole === 'admin' ? 'Admin Console' : currentRole === 'coach' ? 'Coach Portal' : 'Mobile Platform'}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tight ${
                  currentRole === 'admin' ? 'bg-purple-100 text-purple-900 border border-purple-200' :
                  currentRole === 'coach' ? 'bg-cyan-100 text-cyan-900 border border-cyan-200' :
                  'bg-emerald-100 text-emerald-900 border border-emerald-200'
                }`}>
                  {currentRole}
                </span>
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-emerald-500/30 flex-shrink-0"
                />
              </div>
            </div>

            {/* App Body Content */}
            <div className="flex-1 overflow-y-auto p-3.5 pb-6 space-y-4 bg-slate-50 overflow-x-hidden">
              {currentRole === 'coach' ? (
                <CoachDashboard />
              ) : currentRole === 'admin' ? (
                <AdminDashboard />
              ) : (
                <>
                  {activeTab === 'alarm' && <AlarmEngine />}
                  {activeTab === 'overview' && <UserDashboard />}
                  {activeTab === 'challenges' && <ChallengeEngineView />}
                  {activeTab === 'habits' && <HabitTrackerView />}
                  {activeTab === 'ai' && <AiAssistantView />}
                  {activeTab === 'leaderboard' && <LeaderboardAndBadgesView />}
                  {activeTab === 'settings' && <ProfileSettingsView />}
                </>
              )}
            </div>

            {/* Flutter Bottom Navigation Bar (for standard user) */}
            {currentRole === 'user' && (
              <div className="relative bg-white border-t border-slate-200 px-2 py-2 flex items-center space-x-1 flex-shrink-0 z-20 shadow-lg overflow-x-auto no-scrollbar scroll-smooth">
                {[
                  { id: 'alarm', label: 'Alarm', icon: Clock },
                  { id: 'overview', label: 'Overview', icon: Flame },
                  { id: 'challenges', label: 'Challenges', icon: Award },
                  { id: 'habits', label: 'Habits', icon: CheckCircle2 },
                  { id: 'ai', label: 'AI Coach', icon: MessageSquare },
                  { id: 'leaderboard', label: 'Rankings', icon: Trophy },
                  { id: 'settings', label: 'Profile', icon: Settings },
                ].map((item) => {
                  const IconComp = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as MobileTab)}
                      className={`flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl transition-all flex-shrink-0 min-w-[56px] ${
                        isActive
                          ? 'bg-emerald-600 text-white font-bold shadow-xs scale-105'
                          : 'text-slate-600 hover:text-slate-900 font-medium hover:bg-slate-100'
                      }`}
                    >
                      <IconComp className={`w-4 h-4 mb-0.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                      <span className="text-[10px] leading-none whitespace-nowrap">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Android Hardware Navigation Bar */}
            <div className="bg-slate-950 text-slate-400 py-1.5 flex items-center justify-center space-x-12 z-30 flex-shrink-0">
              <div className="w-3 h-3 border-l-2 border-b-2 border-slate-400 rotate-45 transform" />
              <div className="w-3.5 h-3.5 border-2 border-slate-400 rounded-full" />
              <div className="w-3 h-3 border-2 border-slate-400 rounded-sm" />
            </div>

          </div>
        </div>
      ) : (
        /* Full Desktop Responsive Layout */
        <div className="w-full max-w-5xl space-y-6">
          {currentRole === 'coach' ? (
            <CoachDashboard />
          ) : currentRole === 'admin' ? (
            <AdminDashboard />
          ) : (
            <UserDashboard />
          )}
        </div>
      )}

    </div>
  );
};
