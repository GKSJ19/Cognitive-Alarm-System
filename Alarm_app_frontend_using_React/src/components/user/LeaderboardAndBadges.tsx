import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Trophy, Award, Flame, Medal, CheckCircle2, Lock, Star, Sparkles, Filter } from 'lucide-react';
import { ALL_ACHIEVEMENTS } from '../../data/mockData';

export const LeaderboardAndBadgesView: React.FC = () => {
  const { users, currentUser } = useApp();
  const [badgeFilter, setBadgeFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  // Sort users by points descending
  const sortedUsers = [...users].sort((a, b) => b.points - a.points);

  const userUnlockedIds = new Set(currentUser.badges.map((b) => b.id));

  // Merge master achievements with user status
  const masterBadges = ALL_ACHIEVEMENTS.map((a) => ({
    ...a,
    isUnlocked: userUnlockedIds.has(a.id) || a.isUnlocked,
  }));

  const filteredBadges = masterBadges.filter((b) => {
    if (badgeFilter === 'unlocked') return b.isUnlocked;
    if (badgeFilter === 'locked') return !b.isUnlocked;
    return true;
  });

  const unlockedCount = masterBadges.filter((b) => b.isUnlocked).length;

  return (
    <div className="flex flex-col space-y-6">
      
      {/* Community Leaderboard */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span>Community Rankings & Leaderboard</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Rankings updated dynamically based on points & verified challenge tasks</p>
          </div>
          <span className="text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex-shrink-0 whitespace-nowrap">
            Season 1 Active
          </span>
        </div>

        <div className="space-y-2.5">
          {sortedUsers.map((user, index) => {
            const isMe = user.id === currentUser.id;
            const rank = index + 1;

            return (
              <div
                key={user.id}
                className={`p-3 sm:p-3.5 rounded-2xl border transition-all ${
                  isMe
                    ? 'bg-emerald-50/90 border-emerald-300 ring-2 ring-emerald-500/10'
                    : 'bg-slate-50/70 border-slate-200/80 hover:border-slate-300'
                }`}
              >
                {/* Main Row: Left (Info) & Right (Points on top, Streak below) */}
                <div className="flex items-center justify-between gap-2.5 sm:gap-3 min-w-0">
                  
                  {/* Rank + Avatar + Name & Level */}
                  <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 flex-1">
                    {/* Rank Icon / Number */}
                    <div className="w-5 sm:w-6 text-center flex-shrink-0">
                      {rank === 1 && <Medal className="w-5 h-5 text-amber-500 mx-auto" />}
                      {rank === 2 && <Medal className="w-5 h-5 text-slate-400 mx-auto" />}
                      {rank === 3 && <Medal className="w-5 h-5 text-amber-700 mx-auto" />}
                      {rank > 3 && <span className="text-xs font-extrabold text-slate-500">#{rank}</span>}
                    </div>

                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-white flex-shrink-0 shadow-2xs"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-1.5 min-w-0">
                        <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate leading-snug">
                          {user.name}
                        </h4>
                        {isMe && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 bg-emerald-600 text-white rounded flex-shrink-0">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] sm:text-xs text-slate-500 font-medium capitalize truncate mt-0.5">
                        {user.role} • Level {user.level}
                      </p>
                    </div>
                  </div>

                  {/* Points (Top) & Streak (Below Points) */}
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <div className="text-[10px] sm:text-[11px] font-extrabold text-emerald-800 bg-emerald-100 px-2 sm:px-2.5 py-0.5 rounded-lg border border-emerald-200/80 whitespace-nowrap">
                      {user.points} Pts
                    </div>
                    <div className="text-[10px] sm:text-[11px] font-bold text-amber-800 flex items-center space-x-1 bg-amber-50 px-2 sm:px-2.5 py-0.5 rounded-lg border border-amber-200/80 whitespace-nowrap">
                      <Flame className="w-3 h-3 fill-amber-500 text-amber-500 flex-shrink-0" />
                      <span>{user.streak}d Streak</span>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges & Unlockable Achievements Showcase */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        
        {/* Header & Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Award className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>🌅 Wake-up Achievements ({unlockedCount}/{masterBadges.length} Unlocked)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Complete challenges, maintain streaks, and log habits to unlock badges</p>
          </div>

          <div className="flex items-center space-x-1.5 self-start sm:self-auto bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            {[
              { id: 'all', label: `All (${masterBadges.length})` },
              { id: 'unlocked', label: `Unlocked (${unlockedCount})` },
              { id: 'locked', label: `Locked (${masterBadges.length - unlockedCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setBadgeFilter(tab.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  badgeFilter === tab.id
                    ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Badges Cards Grid (Single column on mobile, 2 columns on tablet/desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {filteredBadges.map((badge) => {
            const isUnlocked = badge.isUnlocked;

            return (
              <div
                key={badge.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 min-w-0 shadow-2xs h-full ${
                  isUnlocked
                    ? 'bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/20 border-emerald-300 hover:border-emerald-400'
                    : 'bg-slate-50/60 border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="space-y-2.5 min-w-0">
                  {/* Top Row: Icon + Badge Status Pill */}
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-2xs flex-shrink-0 border ${
                      isUnlocked
                        ? 'bg-amber-500/10 text-amber-900 border-amber-300/40'
                        : 'bg-slate-200/80 text-slate-400 border-slate-300/60 grayscale'
                    }`}>
                      {badge.icon}
                    </div>

                    {isUnlocked ? (
                      <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider flex-shrink-0">
                        UNLOCKED
                      </span>
                    ) : (
                      <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 border border-slate-300 uppercase tracking-wider flex-shrink-0 flex items-center space-x-1">
                        <Lock className="w-2.5 h-2.5 text-slate-500" />
                        <span>LOCKED</span>
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1 min-w-0">
                    <h4 className={`text-xs sm:text-sm font-extrabold leading-snug ${isUnlocked ? 'text-slate-900' : 'text-slate-700'}`}>
                      {badge.name}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed font-medium">
                      {badge.description}
                    </p>
                  </div>
                </div>

                {/* Bottom Row: Requirement / Unlocked Info */}
                <div className={`pt-2.5 text-[10px] sm:text-[11px] font-bold flex items-center justify-between border-t mt-auto ${
                  isUnlocked
                    ? 'border-emerald-200/80 text-emerald-700'
                    : 'border-slate-200/80 text-slate-500'
                }`}>
                  <div className="flex items-center space-x-1.5 min-w-0">
                    {isUnlocked ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    )}
                    <span className="truncate">
                      {isUnlocked
                        ? `Unlocked on ${badge.unlockedAt || 'Aug 2026'}`
                        : badge.requirement || badge.description}
                    </span>
                  </div>

                  {badge.progress && (
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                      isUnlocked ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {badge.progress}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

