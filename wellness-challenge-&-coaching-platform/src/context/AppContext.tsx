import React, { createContext, useContext, useState, useEffect } from 'react';

import confetti from 'canvas-confetti';
import {
  UserProfile,
  UserRole,
  Challenge,
  ChallengeProof,
  Habit,
  WellnessLog,
  WellnessPlan,
  DirectMessage,
  AdminAnalytics,
  Badge,
  AlarmItem,
  AlarmSound,
  CognitiveType,
  CognitiveAttempt,
  Announcement,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_CHALLENGES,
  INITIAL_PROOFS,
  INITIAL_HABITS,
  INITIAL_LOGS,
  INITIAL_PLANS,
  INITIAL_MESSAGES,
  INITIAL_ANALYTICS,
  INITIAL_ANNOUNCEMENTS,
} from '../data/mockData';
import { startAlarmSound, stopAlarmSound } from '../utils/alarmAudio';

const INITIAL_ALARMS: AlarmItem[] = [
  {
    id: 'alm-1',
    userId: 'usr-1',
    time: '07:00',
    label: 'Morning Hydration & Yoga',
    enabled: true,
    repeatDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    sound: 'gentle_chime',
    cognitiveType: 'math',
    cognitiveDifficulty: 'easy',
    snoozeCount: 0,
  },
  {
    id: 'alm-2',
    userId: 'usr-1',
    time: '08:30',
    label: 'Zone-2 Morning Cardio',
    enabled: true,
    repeatDays: ['Mon', 'Wed', 'Fri'],
    sound: 'energetic_synth',
    cognitiveType: 'trivia',
    cognitiveDifficulty: 'medium',
    snoozeCount: 0,
  },
  {
    id: 'alm-3',
    userId: 'usr-1',
    time: '22:00',
    label: 'Digital Sunset & Sleep Goal',
    enabled: false,
    repeatDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    sound: 'nature_birds',
    cognitiveType: 'pattern',
    cognitiveDifficulty: 'easy',
    snoozeCount: 0,
  },
];

interface AppContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  users: UserProfile[];
  currentUser: UserProfile;
  switchUserRole: (role: UserRole) => void;
  challenges: Challenge[];
  proofs: ChallengeProof[];
  habits: Habit[];
  logs: WellnessLog[];
  plans: WellnessPlan[];
  messages: DirectMessage[];
  analytics: AdminAnalytics;
  attempts: CognitiveAttempt[];
  addCognitiveAttempt: (attempt: CognitiveAttempt) => void;
  
  // Auth State
  isAuthenticated: boolean;
  login: (email: string, role?: UserRole) => void;
  register: (name: string, email: string, role?: UserRole) => void;
  logout: () => void;

  // Alarm Engine & Cognitive Challenge State
  alarms: AlarmItem[];
  ringingAlarm: AlarmItem | null;
  addAlarm: (alarm: Omit<AlarmItem, 'id' | 'userId' | 'snoozeCount'>) => void;
  toggleAlarm: (alarmId: string) => void;
  deleteAlarm: (alarmId: string) => void;
  snoozeAlarm: (alarmId: string) => void;
  dismissAlarm: (alarmId: string) => void;
  triggerTestAlarm: (alarmItem?: AlarmItem) => void;

  // Challenge Actions
  joinChallenge: (challengeId: string) => void;
  leaveChallenge: (challengeId: string) => void;
  submitProof: (proofData: Omit<ChallengeProof, 'id' | 'submittedAt' | 'status' | 'userId' | 'userName' | 'userAvatar'>) => void;
  reviewProof: (proofId: string, status: 'approved' | 'rejected', feedback: string) => void;
  createChallenge: (newChallenge: Omit<Challenge, 'id' | 'participantsCount' | 'createdByRole' | 'creatorName'>) => void;

  // Habit & Health Logging
  updateHabitProgress: (habitId: string, increment: number) => void;
  toggleHabitComplete: (habitId: string) => void;
  addNewHabit: (habit: Omit<Habit, 'id' | 'userId' | 'currentValue' | 'completedToday' | 'streakDays'>) => void;
  logDailyMetrics: (metrics: Partial<WellnessLog>) => void;

  // Coaching & Plan Actions
  createWellnessPlan: (plan: Omit<WellnessPlan, 'id' | 'coachId' | 'coachName' | 'createdAt'>) => void;
  togglePlanTask: (planId: string, taskIndex: number) => void;
  sendMessage: (receiverId: string, content: string, isAi?: boolean) => void;

  // Admin Actions
  updateUserRole: (userId: string, newRole: UserRole) => void;
  assignUserToCoach: (userId: string, coachId: string | null, coachName?: string) => void;
  deleteUser: (userId: string) => void;
  addUser: (user: { name: string; email: string; role: UserRole; assignedCoachId?: string }) => void;
  deleteChallenge: (challengeId: string) => void;
  announcements: Announcement[];
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'createdAt' | 'createdBy'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('wellness_auth') === 'true';
  });

  const [currentRole, setCurrentRole] = useState<UserRole>('user');
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('wellness_users_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.some((u: UserProfile) => u.badges?.some(b => b.name?.includes('Early Bird')))) {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_USERS;
  });

  useEffect(() => {
    localStorage.setItem('wellness_users_v2', JSON.stringify(users));
  }, [users]);
  
  const [challenges, setChallenges] = useState<Challenge[]>(() => {
    const saved = localStorage.getItem('wellness_challenges');
    return saved ? JSON.parse(saved) : INITIAL_CHALLENGES;
  });

  const [proofs, setProofs] = useState<ChallengeProof[]>(() => {
    const saved = localStorage.getItem('wellness_proofs');
    return saved ? JSON.parse(saved) : INITIAL_PROOFS;
  });

  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('wellness_habits_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.some((h: Habit) => h.title?.includes('10:30') || h.title?.includes('first alarm'))) {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_HABITS;
  });

  useEffect(() => {
    localStorage.setItem('wellness_habits_v3', JSON.stringify(habits));
  }, [habits]);

  const [logs, setLogs] = useState<WellnessLog[]>(() => {
    const saved = localStorage.getItem('wellness_logs_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 3) {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_LOGS;
  });

  const [plans, setPlans] = useState<WellnessPlan[]>(() => {
    const saved = localStorage.getItem('wellness_plans');
    return saved ? JSON.parse(saved) : INITIAL_PLANS;
  });

  const [messages, setMessages] = useState<DirectMessage[]>(() => {
    const saved = localStorage.getItem('wellness_messages');
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  const [alarms, setAlarms] = useState<AlarmItem[]>(() => {
    const saved = localStorage.getItem('wellness_alarms');
    return saved ? JSON.parse(saved) : INITIAL_ALARMS;
  });

  const [ringingAlarm, setRingingAlarm] = useState<AlarmItem | null>(null);

  const [analytics, setAnalytics] = useState<AdminAnalytics>(INITIAL_ANALYTICS);

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem('wellness_announcements');
    return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
  });

  useEffect(() => {
    localStorage.setItem('wellness_announcements', JSON.stringify(announcements));
  }, [announcements]);

  // Sync auth state
  useEffect(() => {
    localStorage.setItem('wellness_auth', isAuthenticated ? 'true' : 'false');
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('wellness_alarms', JSON.stringify(alarms));
  }, [alarms]);

  useEffect(() => {
    localStorage.setItem('wellness_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('wellness_challenges', JSON.stringify(challenges));
  }, [challenges]);

  useEffect(() => {
    localStorage.setItem('wellness_proofs', JSON.stringify(proofs));
  }, [proofs]);

  useEffect(() => {
    localStorage.setItem('wellness_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('wellness_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('wellness_plans', JSON.stringify(plans));
  }, [plans]);

  useEffect(() => {
    localStorage.setItem('wellness_messages', JSON.stringify(messages));
  }, [messages]);

  // Alarm Clock Background Loop
  useEffect(() => {
    const checkAlarmTime = () => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMins = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMins}`;

      if (!ringingAlarm) {
        const matched = alarms.find((a) => a.enabled && a.time === currentTimeStr);
        if (matched) {
          setRingingAlarm(matched);
          startAlarmSound(matched.sound);
        }
      }
    };

    const timer = setInterval(checkAlarmTime, 10000);
    return () => clearInterval(timer);
  }, [alarms, ringingAlarm]);

  // Derived current user based on active role
  const currentUser = users.find((u) => u.role === currentRole) || users[0];

  // Auth Functions
  const login = (email: string, role: UserRole = 'user') => {
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setCurrentRole(found.role);
    } else {
      setCurrentRole(role);
    }
    setIsAuthenticated(true);
  };

  const register = (name: string, email: string, role: UserRole = 'user') => {
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role,
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80`,
      points: 150,
      streak: 1,
      joinedDate: new Date().toISOString().split('T')[0],
      level: 1,
      badges: [],
      metrics: {
        alarmWakeupsCount: 1,
        avgSolveTimeSeconds: 15.0,
        snoozeRatePercent: 0,
        cognitiveScore: 85,
      },
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentRole(role);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
    stopAlarmSound();
    setRingingAlarm(null);
  };

  const switchUserRole = (role: UserRole) => {
    setCurrentRole(role);
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // ignore
    }
  };

  // Alarm Methods
  const addAlarm = (alarmData: Omit<AlarmItem, 'id' | 'userId' | 'snoozeCount'>) => {
    const newAlarm: AlarmItem = {
      ...alarmData,
      id: `alm-${Date.now()}`,
      userId: currentUser.id,
      snoozeCount: 0,
    };
    setAlarms((prev) => [...prev, newAlarm]);
  };

  const toggleAlarm = (alarmId: string) => {
    setAlarms((prev) =>
      prev.map((a) => (a.id === alarmId ? { ...a, enabled: !a.enabled } : a))
    );
  };

  const deleteAlarm = (alarmId: string) => {
    setAlarms((prev) => prev.filter((a) => a.id !== alarmId));
  };

  const snoozeAlarm = (alarmId: string) => {
    stopAlarmSound();
    setRingingAlarm(null);
    setAlarms((prev) =>
      prev.map((a) => (a.id === alarmId ? { ...a, snoozeCount: a.snoozeCount + 1 } : a))
    );
  };

  const dismissAlarm = (alarmId: string) => {
    stopAlarmSound();
    setRingingAlarm(null);
    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUser.id
          ? { ...u, points: u.points + 50, streak: u.streak + 1 }
          : u
      )
    );
    triggerConfetti();
  };

  const triggerTestAlarm = (alarmItem?: AlarmItem) => {
    const testAlarm = alarmItem || alarms[0] || INITIAL_ALARMS[0];
    setRingingAlarm(testAlarm);
    startAlarmSound(testAlarm.sound);
  };

  // Join challenge
  const joinChallenge = (challengeId: string) => {
    setChallenges((prev) =>
      prev.map((c) =>
        c.id === challengeId
          ? { ...c, isJoined: true, participantsCount: c.participantsCount + 1 }
          : c
      )
    );
    triggerConfetti();
  };

  // Leave challenge
  const leaveChallenge = (challengeId: string) => {
    setChallenges((prev) =>
      prev.map((c) =>
        c.id === challengeId
          ? { ...c, isJoined: false, participantsCount: Math.max(0, c.participantsCount - 1) }
          : c
      )
    );
  };

  // Submit proof for task
  const submitProof = (
    proofData: Omit<ChallengeProof, 'id' | 'submittedAt' | 'status' | 'userId' | 'userName' | 'userAvatar'>
  ) => {
    const newProof: ChallengeProof = {
      ...proofData,
      id: `prf-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      submittedAt: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      status: 'pending',
    };

    setProofs((prev) => [newProof, ...prev]);
    setAnalytics((prev) => ({ ...prev, pendingProofsCount: prev.pendingProofsCount + 1 }));
    triggerConfetti();
  };

  // Review proof (Coach / Admin)
  const reviewProof = (proofId: string, status: 'approved' | 'rejected', feedback: string) => {
    const targetProof = proofs.find((p) => p.id === proofId);
    if (!targetProof) return;

    setProofs((prev) =>
      prev.map((p) =>
        p.id === proofId
          ? {
              ...p,
              status,
              feedback,
              reviewedByCoachId: currentUser.id,
            }
          : p
      )
    );

    setAnalytics((prev) => ({
      ...prev,
      pendingProofsCount: Math.max(0, prev.pendingProofsCount - 1),
    }));

    if (status === 'approved') {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === targetProof.userId
            ? {
                ...u,
                points: u.points + targetProof.pointsEarned,
                streak: u.streak + 1,
              }
            : u
        )
      );
      triggerConfetti();
    }
  };

  // Create Challenge (Coach / Admin)
  const createChallenge = (
    newChallenge: Omit<Challenge, 'id' | 'participantsCount' | 'createdByRole' | 'creatorName'>
  ) => {
    const challenge: Challenge = {
      ...newChallenge,
      id: `chl-${Date.now()}`,
      participantsCount: 1,
      createdByRole: currentRole === 'admin' ? 'admin' : 'coach',
      creatorName: currentUser.name,
      isJoined: true,
    };

    setChallenges((prev) => [challenge, ...prev]);
    setAnalytics((prev) => ({ ...prev, activeChallenges: prev.activeChallenges + 1 }));
    triggerConfetti();
  };

  // Habit controls
  const updateHabitProgress = (habitId: string, increment: number) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === habitId) {
          const newVal = Math.min(h.targetValue, Math.max(0, h.currentValue + increment));
          const isDone = newVal >= h.targetValue;
          if (isDone && !h.completedToday) {
            triggerConfetti();
          }
          return {
            ...h,
            currentValue: newVal,
            completedToday: isDone,
            streakDays: isDone && !h.completedToday ? h.streakDays + 1 : h.streakDays,
          };
        }
        return h;
      })
    );
  };

  const toggleHabitComplete = (habitId: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === habitId) {
          const isNowComplete = !h.completedToday;
          if (isNowComplete) triggerConfetti();
          return {
            ...h,
            completedToday: isNowComplete,
            currentValue: isNowComplete ? h.targetValue : 0,
            streakDays: isNowComplete ? h.streakDays + 1 : Math.max(0, h.streakDays - 1),
          };
        }
        return h;
      })
    );
  };

  const addNewHabit = (
    habitData: Omit<Habit, 'id' | 'userId' | 'currentValue' | 'completedToday' | 'streakDays'>
  ) => {
    const habit: Habit = {
      ...habitData,
      id: `h-${Date.now()}`,
      userId: currentUser.id,
      currentValue: 0,
      completedToday: false,
      streakDays: 1,
    };
    setHabits((prev) => [...prev, habit]);
  };

  // Cognitive Attempt History State
  const [attempts, setAttempts] = useState<CognitiveAttempt[]>([
    { id: 'att-1', nodeType: 'word', nodeLabel: 'Word Games', difficulty: 'Medium', isCorrect: true, solveTimeSeconds: 12.0, timestamp: '2026-08-05' },
    { id: 'att-2', nodeType: 'math', nodeLabel: 'Mathematical Problems', difficulty: 'Easy', isCorrect: true, solveTimeSeconds: 6.1, timestamp: '2026-08-05' },
    { id: 'att-3', nodeType: 'logic', nodeLabel: 'Logic Puzzles', difficulty: 'Medium', isCorrect: true, solveTimeSeconds: 15.5, timestamp: '2026-08-04' },
    { id: 'att-4', nodeType: 'pattern', nodeLabel: 'Pattern Recognition', difficulty: 'Medium', isCorrect: true, solveTimeSeconds: 11.2, timestamp: '2026-08-04' },
  ]);

  const addCognitiveAttempt = (attempt: CognitiveAttempt) => {
    setAttempts((prev) => [attempt, ...prev]);
  };

  // Log daily health metrics
  const logDailyMetrics = (metrics: Partial<WellnessLog>) => {
    const todayStr = new Date().toISOString().split('T')[0];
    setLogs((prev) => {
      const existingIndex = prev.findIndex((l) => l.date === todayStr && l.userId === currentUser.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], ...metrics };
        return updated;
      } else {
        const newLog: WellnessLog = {
          id: `l-${Date.now()}`,
          userId: currentUser.id,
          date: todayStr,
          cognitiveAccuracy: metrics.cognitiveAccuracy || 100,
          solveTimeSeconds: metrics.solveTimeSeconds || 12,
          sleepHours: metrics.sleepHours || 8,
          mood: metrics.mood || 'good',
          notes: metrics.notes || '',
        };
        return [newLog, ...prev];
      }
    });
  };

  // Wellness Plan creation
  const createWellnessPlan = (planData: Omit<WellnessPlan, 'id' | 'coachId' | 'coachName' | 'createdAt'>) => {
    const plan: WellnessPlan = {
      ...planData,
      id: `pln-${Date.now()}`,
      coachId: currentUser.id,
      coachName: currentUser.name,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setPlans((prev) => [plan, ...prev]);
    triggerConfetti();
  };

  const togglePlanTask = (planId: string, taskIndex: number) => {
    setPlans((prev) =>
      prev.map((p) => {
        if (p.id === planId) {
          const updatedTasks = [...p.dailyTasks];
          updatedTasks[taskIndex] = {
            ...updatedTasks[taskIndex],
            completed: !updatedTasks[taskIndex].completed,
          };
          return { ...p, dailyTasks: updatedTasks };
        }
        return p;
      })
    );
  };

  // Direct messaging
  const sendMessage = (receiverId: string, content: string, isAi?: boolean) => {
    const newMsg: DirectMessage = {
      id: `m-${Date.now()}`,
      senderId: isAi ? 'ai-coach' : currentUser.id,
      senderName: isAi ? 'Gemini AI Coach' : currentUser.name,
      senderRole: isAi ? 'coach' : currentRole,
      senderAvatar: isAi
        ? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=250&q=80'
        : currentUser.avatar,
      receiverId,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content,
      isAi,
    };

    setMessages((prev) => [...prev, newMsg]);
  };

  // Admin user role & account management
  const updateUserRole = (userId: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
  };

  const assignUserToCoach = (userId: string, coachId: string | null, coachName?: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return {
            ...u,
            assignedCoachId: coachId || undefined,
            assignedCoachName: coachName || undefined,
          };
        }
        return u;
      })
    );
  };

  const deleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    setAnalytics((prev) => ({ ...prev, totalUsers: Math.max(0, prev.totalUsers - 1) }));
  };

  const addUser = (userData: { name: string; email: string; role: UserRole; assignedCoachId?: string }) => {
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80`,
      points: 100,
      streak: 1,
      joinedDate: new Date().toISOString().split('T')[0],
      bio: `${userData.role === 'coach' ? 'Wellness Coach' : 'Platform Member'} focus on cognitive wake-ups.`,
      assignedCoachId: userData.assignedCoachId || 'cch-1',
      assignedCoachName: 'Coach Marcus Vance',
      level: 1,
      healthGoals: ['Morning wake-up consistency', 'Zero snooze protocol'],
      metrics: {
        alarmWakeupsCount: 0,
        avgSolveTimeSeconds: 15.0,
        snoozeRatePercent: 0,
        cognitiveScore: 85,
      },
      badges: [],
    };
    setUsers((prev) => [...prev, newUser]);
    setAnalytics((prev) => ({ ...prev, totalUsers: prev.totalUsers + 1 }));
  };

  const deleteChallenge = (challengeId: string) => {
    setChallenges((prev) => prev.filter((c) => c.id !== challengeId));
    setAnalytics((prev) => ({ ...prev, activeChallenges: Math.max(0, prev.activeChallenges - 1) }));
  };

  const addAnnouncement = (annData: Omit<Announcement, 'id' | 'createdAt' | 'createdBy'>) => {
    const newAnn: Announcement = {
      ...annData,
      id: `ann-${Date.now()}`,
      createdAt: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      createdBy: currentUser.name,
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        users,
        currentUser,
        switchUserRole,
        challenges,
        proofs,
        habits,
        logs,
        plans,
        messages,
        analytics,
        attempts,
        addCognitiveAttempt,
        isAuthenticated,
        login,
        register,
        logout,
        alarms,
        ringingAlarm,
        addAlarm,
        toggleAlarm,
        deleteAlarm,
        snoozeAlarm,
        dismissAlarm,
        triggerTestAlarm,
        joinChallenge,
        leaveChallenge,
        submitProof,
        reviewProof,
        createChallenge,
        updateHabitProgress,
        toggleHabitComplete,
        addNewHabit,
        logDailyMetrics,
        createWellnessPlan,
        togglePlanTask,
        sendMessage,
        updateUserRole,
        assignUserToCoach,
        deleteUser,
        addUser,
        deleteChallenge,
        announcements,
        addAnnouncement,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
