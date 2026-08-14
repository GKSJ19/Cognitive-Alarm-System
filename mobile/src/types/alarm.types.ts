export interface Alarm {
  alarm_id: string;
  user_id: string;
  title: string;
  alarm_time: string;
  repeat_days: string | null; // e.g. "1,2,3,4,5"
  vibration: boolean;
  ringtone: string;
  snooze_enabled: boolean;
  snooze_duration: number;
  challenge_required: boolean;
  challenge_type: string;
  difficulty: string;
  is_active: boolean;
}

export interface AlarmHistory {
  history_id: string;
  alarm_id: string;
  wake_time: string;
  solved: boolean;
  solve_time: number;
  dismissed_at: string;
}

export interface AlarmState {
  alarms: Alarm[];
  history: AlarmHistory[];
  isLoading: boolean;
  error: string | null;
}

export interface CognitiveChallenge {
  challenge_id: string;
  alarm_id: string;
  challenge_type: string;
  difficulty: string;
  prompt: string;
  instructions: string;
  options?: string[] | null;
  timer_seconds: number;
  verification_token: string;
}

export interface AvailableChallengeOption {
  challenge_id: string;
  alarm_id: string;
  challenge_type: string;
  difficulty: string;
  estimated_time: string;
  description: string;
  prompt: string;
  instructions: string;
  options?: string[] | null;
  timer_seconds: number;
  verification_token: string;
}


export interface ChallengeVerifyRequest {
  challenge_id: string;
  user_answer: string;
  time_taken_seconds: number;
  attempts: number;
  verification_token: string;
}

export interface ChallengeVerifyResponse {
  is_correct: boolean;
  message: string;
  attempts: number;
  time_taken_seconds: number;
  earned_score: number;
  total_honor_score: number;
  next_difficulty: string;
  challenge_id: string;
  completed_at: string;
}

