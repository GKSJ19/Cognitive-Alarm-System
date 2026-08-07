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
} from 'lucide-react';
import { AlarmEngine } from '../user/AlarmEngine';
import { UserDashboard } from '../user/UserDashboard';
import { ChallengeEngineView } from '../user/ChallengeEngine';
import { HabitTrackerView } from '../user/HabitTracker';
import { AiAssistantView } from '../user/AiAssistant';
import { LeaderboardAndBadgesView } from '../user/LeaderboardAndBadges';
import { CoachDashboard } from '../coach/CoachDashboard';
import { AdminDashboard } from '../admin/AdminDashboard';
import { LoginRegister } from '../auth/LoginRegister';

type MobileTab = 'alarm' | 'overview' | 'challenges' | 'habits' | 'ai' | 'leaderboard';

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
        <div className="w-full max-w-[420px] bg-slate-950 rounded-[48px] p-3.5 shadow-2xl ring-12 ring-slate-800/80 my-2 relative">
          
          {/* Inner Phone Screen */}
          <div className="bg-slate-50 rounded-[38px] overflow-hidden flex flex-col min-h-[780px] max-h-[820px] relative border border-slate-200">
            
            {/* Android Status Bar */}
            <div className="bg-slate-900 text-white px-5 py-2 flex items-center justify-between text-[11px] font-bold z-20">
              <span>{currentTimeStr}</span>

              {/* Camera Notch Punch Hole */}
              <div className="w-3 h-3 bg-black rounded-full ring-1 ring-slate-800" />

              <div className="flex items-center space-x-2 text-slate-300">
                <Signal className="w-3 h-3" />
                <Wifi className="w-3 h-3" />
                <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>

            {/* App Body Content */}
            <div className="flex-1 overflow-y-auto p-3.5 pb-6 space-y-4 bg-slate-50">
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
                </>
              )}
            </div>

            {/* Flutter Bottom Navigation Bar (for standard user) */}
            {currentRole === 'user' && (
              <div className="relative bg-white border-t border-slate-200 px-1 py-2 flex items-center justify-around flex-shrink-0 z-20 shadow-md">
                <button
                  onClick={() => setActiveTab('alarm')}
                  className={`flex flex-col items-center py-1 px-1.5 rounded-xl transition-all ${
                    activeTab === 'alarm' ? 'text-emerald-700 font-black scale-105' : 'text-slate-600 hover:text-slate-900 font-semibold'
                  }`}
                >
                  <Clock className="w-5 h-5 mb-0.5" />
                  <span className="text-[10px] leading-tight">Alarm</span>
                </button>

                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex flex-col items-center py-1 px-1.5 rounded-xl transition-all ${
                    activeTab === 'overview' ? 'text-emerald-700 font-black scale-105' : 'text-slate-600 hover:text-slate-900 font-semibold'
                  }`}
                >
                  <Flame className="w-5 h-5 mb-0.5" />
                  <span className="text-[10px] leading-tight">Overview</span>
                </button>

                <button
                  onClick={() => setActiveTab('challenges')}
                  className={`flex flex-col items-center py-1 px-1.5 rounded-xl transition-all ${
                    activeTab === 'challenges' ? 'text-emerald-700 font-black scale-105' : 'text-slate-600 hover:text-slate-900 font-semibold'
                  }`}
                >
                  <Award className="w-5 h-5 mb-0.5" />
                  <span className="text-[10px] leading-tight">Challenges</span>
                </button>

                <button
                  onClick={() => setActiveTab('habits')}
                  className={`flex flex-col items-center py-1 px-1.5 rounded-xl transition-all ${
                    activeTab === 'habits' ? 'text-emerald-700 font-black scale-105' : 'text-slate-600 hover:text-slate-900 font-semibold'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5 mb-0.5" />
                  <span className="text-[10px] leading-tight">Habits</span>
                </button>

                <button
                  onClick={() => setActiveTab('ai')}
                  className={`flex flex-col items-center py-1 px-1.5 rounded-xl transition-all ${
                    activeTab === 'ai' ? 'text-emerald-700 font-black scale-105' : 'text-slate-600 hover:text-slate-900 font-semibold'
                  }`}
                >
                  <MessageSquare className="w-5 h-5 mb-0.5" />
                  <span className="text-[10px] leading-tight">AI Coach</span>
                </button>

                <button
                  onClick={() => setActiveTab('leaderboard')}
                  className={`flex flex-col items-center py-1 px-1.5 rounded-xl transition-all ${
                    activeTab === 'leaderboard' ? 'text-emerald-700 font-black scale-105' : 'text-slate-600 hover:text-slate-900 font-semibold'
                  }`}
                >
                  <Trophy className="w-5 h-5 mb-0.5" />
                  <span className="text-[10px] leading-tight">Rankings</span>
                </button>
              </div>
            )}

            {/* Android Hardware Navigation Bar */}
            <div className="bg-slate-950 text-slate-400 py-1 flex items-center justify-center space-x-12 z-30">
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
