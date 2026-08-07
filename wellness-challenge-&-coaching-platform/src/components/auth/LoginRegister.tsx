import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Clock,
  Sparkles,
  ShieldCheck,
  User,
  UserCheck,
  Shield,
  ArrowRight,
  Flame,
  Brain,
  Bell,
  CheckCircle2,
} from 'lucide-react';
import { UserRole } from '../../types';

export const LoginRegister: React.FC = () => {
  const { login, register } = useApp();
  const [isRegister, setIsRegister] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('user');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegister) {
      if (!name.trim() || !email.trim()) return;
      register(name, email, role);
    } else {
      if (!email.trim()) return;
      login(email, role);
    }
  };

  const handleDemoLogin = (demoRole: UserRole, demoEmail: string) => {
    login(demoEmail, demoRole);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-8 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
        
        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 text-white mx-auto flex items-center justify-center shadow-lg ring-4 ring-emerald-500/10 animate-pulse">
            <Clock className="w-8 h-8" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-3">
            Verve Mind & Wellness
          </h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Flutter Smart Alarm with Cognitive Snooze Puzzles, Habit Tracking & AI Wellness Coaching
          </p>
        </div>

        {/* Quick Demo Credentials Bar */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-2">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
            Quick Demo Auto-Login
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleDemoLogin('user', 'alex@example.com')}
              className="py-2 px-1 bg-emerald-600 text-white rounded-xl text-[11px] font-bold shadow-2xs hover:bg-emerald-700 flex flex-col items-center justify-center"
            >
              <User className="w-3.5 h-3.5 mb-0.5" />
              <span>User</span>
            </button>

            <button
              onClick={() => handleDemoLogin('coach', 'marcus@coach.com')}
              className="py-2 px-1 bg-cyan-600 text-white rounded-xl text-[11px] font-bold shadow-2xs hover:bg-cyan-700 flex flex-col items-center justify-center"
            >
              <UserCheck className="w-3.5 h-3.5 mb-0.5" />
              <span>Coach</span>
            </button>

            <button
              onClick={() => handleDemoLogin('admin', 'admin@verve.com')}
              className="py-2 px-1 bg-purple-700 text-white rounded-xl text-[11px] font-bold shadow-2xs hover:bg-purple-800 flex flex-col items-center justify-center"
            >
              <Shield className="w-3.5 h-3.5 mb-0.5" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Toggle Login vs Register */}
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => setIsRegister(false)}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              !isRegister ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsRegister(true)}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              isRegister ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                placeholder="e.g., Alex Johnson"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              placeholder="e.g., alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Account Type / Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium"
            >
              <option value="user">Member (User)</option>
              <option value="coach">Certified Wellness Coach</option>
              <option value="admin">System Administrator</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center space-x-2"
          >
            <span>{isRegister ? 'Create Account & Get Started' : 'Sign In to App'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Features Highlights */}
        <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[10px] text-slate-600">
          <div className="flex items-center space-x-1.5">
            <Brain className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span>Math & Trivia Snooze Puzzles</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Bell className="w-3.5 h-3.5 text-cyan-600 flex-shrink-0" />
            <span>5 Web Audio Alarm Tones</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
            <span>Coach Image Verification</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
            <span>Gemini AI Wellness Coach</span>
          </div>
        </div>

      </div>
    </div>
  );
};
