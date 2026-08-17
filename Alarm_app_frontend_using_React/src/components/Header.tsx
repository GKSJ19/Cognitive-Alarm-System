import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Shield,
  UserCheck,
  User,
  Flame,
  Award,
  Bell,
  Sparkles,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';
import { UserRole } from '../types';

export const Header: React.FC = () => {
  const { currentRole, switchUserRole, currentUser, proofs } = useApp();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const pendingCount = proofs.filter((p) => p.status === 'pending').length;

  const handleRoleSelect = (role: UserRole) => {
    switchUserRole(role);
    setShowRoleMenu(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 bg-clip-text text-transparent">
              Verve Wellness
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Challenge & Coaching Platform
            </span>
          </div>
        </div>

        {/* User Stats & Role Switcher */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          
          {/* User Streaks & Points */}
          <div className="hidden sm:flex items-center space-x-3 bg-emerald-50/70 border border-emerald-100 rounded-full px-3 py-1.5 text-xs font-semibold">
            <div className="flex items-center space-x-1 text-amber-600">
              <Flame className="w-4 h-4 fill-amber-500 animate-bounce" />
              <span>{currentUser.streak} Day Streak</span>
            </div>
            <span className="text-emerald-300">|</span>
            <div className="flex items-center space-x-1 text-emerald-800">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>{currentUser.points} Pts</span>
            </div>
          </div>

          {/* Notifications Button */}
          <div className="relative">
            <button
              id="notifications-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {pendingCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white"></span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 px-4 z-50">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <h4 className="text-sm font-semibold text-slate-800">Recent Updates</h4>
                  <span className="text-xs text-emerald-600 font-medium">{pendingCount} Pending</span>
                </div>
                <div className="py-2 space-y-2 max-h-60 overflow-y-auto">
                  {proofs.slice(0, 3).map((p) => (
                    <div key={p.id} className="p-2 text-xs rounded-lg bg-slate-50 border border-slate-100 flex items-start space-x-2">
                      <CheckCircle2 className={`w-4 h-4 mt-0.5 ${p.status === 'approved' ? 'text-emerald-500' : 'text-amber-500'}`} />
                      <div>
                        <p className="font-medium text-slate-800">{p.taskTitle}</p>
                        <p className="text-slate-500">{p.userName} • {p.submittedAt}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Role Switching Selector */}
          <div className="relative">
            <button
              id="role-switch-dropdown"
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center space-x-2.5 bg-slate-900 text-white hover:bg-slate-800 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all shadow-sm"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-6 h-6 rounded-full object-cover ring-2 ring-emerald-400"
              />
              <div className="text-left hidden md:block">
                <div className="font-semibold leading-none">{currentUser.name}</div>
                <div className="text-[10px] text-emerald-300 font-normal capitalize flex items-center mt-0.5">
                  {currentRole === 'admin' && <Shield className="w-3 h-3 mr-1 text-purple-400" />}
                  {currentRole === 'coach' && <UserCheck className="w-3 h-3 mr-1 text-cyan-400" />}
                  {currentRole === 'user' && <User className="w-3 h-3 mr-1 text-emerald-400" />}
                  Role: {currentRole === 'user' ? 'Member' : currentRole}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-300 ml-1" />
            </button>

            {/* Role Switching Menu */}
            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Switch Active Role Workspace
                </div>

                <button
                  id="switch-to-user-btn"
                  onClick={() => handleRoleSelect('user')}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-colors ${
                    currentRole === 'user'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">User (Member)</p>
                      <p className="text-[10px] text-slate-500">Challenges, Habits, Leaderboards</p>
                    </div>
                  </div>
                  {currentRole === 'user' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </button>

                <button
                  id="switch-to-coach-btn"
                  onClick={() => handleRoleSelect('coach')}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-colors mt-1 ${
                    currentRole === 'coach'
                      ? 'bg-cyan-50 text-cyan-800 border border-cyan-200'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="p-1.5 rounded-lg bg-cyan-100 text-cyan-700">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">Wellness Coach</p>
                      <p className="text-[10px] text-slate-500">Proof Verification, Plans, Chat</p>
                    </div>
                  </div>
                  {currentRole === 'coach' && <CheckCircle2 className="w-4 h-4 text-cyan-600" />}
                </button>

                <button
                  id="switch-to-admin-btn"
                  onClick={() => handleRoleSelect('admin')}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-colors mt-1 ${
                    currentRole === 'admin'
                      ? 'bg-purple-50 text-purple-800 border border-purple-200'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">Administrator</p>
                      <p className="text-[10px] text-slate-500">Platform Analytics, Roles, System</p>
                    </div>
                  </div>
                  {currentRole === 'admin' && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
