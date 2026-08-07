export type UserRole = 'user' | 'coach' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  points: number;
  streak: number;
  joinedDate: string;
  bio?: string;
  assignedCoachId?: string;
  assignedCoachName?: string;
  level: number;
  badges: Badge[];
  healthGoals?: string[];
  metrics: {
    alarmWakeupsCount: number;
    avgSolveTimeSeconds: number;
    snoozeRatePercent: number;
    cognitiveScore: number;
  };
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  category: 'alarm' | 'sleep' | 'streak' | 'mindfulness' | 'community';
  isUnlocked?: boolean;
  progress?: string; // e.g. "18/50" or "5/7"
  requirement?: string; // e.g. "Solved a challenge in under 30 seconds"
}

export interface ChallengeTask {
  id: string;
  title: string;
  description: string;
  points: number;
  requiresProof: boolean;
  targetUnit?: string;
}

export type CognitiveNodeType = 'math' | 'logic' | 'memory' | 'word' | 'pattern' | 'riddle' | 'quiz';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: 'Logic' | 'Memory' | 'Math' | 'Word' | 'Pattern' | 'Riddle' | 'Quiz' | 'Custom';
  durationDays: number;
  startDate: string;
  endDate: string;
  icon: string;
  bannerImage: string;
  participantsCount: number;
  pointsReward: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  badgeReward: Badge;
  tasks: ChallengeTask[];
  createdByRole: 'admin' | 'coach';
  creatorName: string;
  isJoined?: boolean;
}

export interface UserChallengeProgress {
  challengeId: string;
  userId: string;
  joinedAt: string;
  currentDay: number;
  completedTaskIds: string[];
  completedDays: number[];
  status: 'active' | 'completed' | 'abandoned';
}

export interface ChallengeProof {
  id: string;
  challengeId: string;
  challengeTitle: string;
  taskId: string;
  taskTitle: string;
  userId: string;
  userName: string;
  userAvatar: string;
  submittedAt: string;
  imageUrl?: string;
  note: string;
  status: 'pending' | 'approved' | 'rejected';
  feedback?: string;
  reviewedByCoachId?: string;
  pointsEarned: number;
}

export interface Habit {
  id: string;
  userId: string;
  title: string;
  category: 'meditation' | 'cognition' | 'reading' | 'sleep' | 'alarm' | 'custom';
  targetValue: number;
  unit: string;
  currentValue: number;
  completedToday: boolean;
  streakDays: number;
  icon: string;
}

export interface WellnessLog {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  cognitiveAccuracy: number; // percentage
  solveTimeSeconds: number;
  sleepHours: number;
  mood: 'great' | 'good' | 'okay' | 'tired' | 'stressed';
  notes?: string;
}

export interface CognitiveAttempt {
  id: string;
  nodeType: CognitiveNodeType;
  nodeLabel: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  isCorrect: boolean;
  solveTimeSeconds: number;
  timestamp: string;
}

export interface WellnessPlan {
  id: string;
  title: string;
  description: string;
  coachId: string;
  coachName: string;
  userId: string;
  createdAt: string;
  dailyTasks: {
    day: number;
    title: string;
    description: string;
    completed: boolean;
  }[];
}

export interface DirectMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  senderAvatar: string;
  receiverId: string;
  timestamp: string;
  content: string;
  isAi?: boolean;
}

export interface AdminAnalytics {
  totalUsers: number;
  totalCoaches: number;
  activeChallenges: number;
  completedChallengesCount: number;
  pendingProofsCount: number;
  dailyActiveUsers: number;
  weeklyEngagementRate: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  createdBy: string;
  priority: 'normal' | 'high' | 'urgent';
}

export type CognitiveType = 'math' | 'logic' | 'memory' | 'scramble' | 'pattern' | 'riddle' | 'trivia';
export type AlarmSound = 'gentle_chime' | 'energetic_synth' | 'nature_birds' | 'digital_beep' | 'loud_siren';

export interface AlarmItem {
  id: string;
  userId: string;
  time: string; // e.g. "07:30"
  label: string;
  enabled: boolean;
  repeatDays: string[]; // e.g. ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  sound: AlarmSound;
  cognitiveType: CognitiveType;
  cognitiveDifficulty: 'easy' | 'medium' | 'hard';
  snoozeCount: number;
}
