export interface User {
  id: string;
  name: string;
  email: string;
  institutionId?: string;
  institutionCustom?: string;
  currentPeriod: number;
  xp: number;
  level: UserLevel;
  streakDays: number;
  lastStudyDate?: string;
  avatarUrl?: string;
  isPremium: boolean;
  emailVerified: boolean;
  createdAt: string;
}

export type UserLevel = 'junior' | 'bacharel' | 'advogado' | 'doutor' | 'magistrado';

export interface UserConsent {
  id: string;
  userId: string;
  consentType: ConsentType;
  accepted: boolean;
  acceptedAt: string;
}

export type ConsentType = 'privacy' | 'terms' | 'cookies' | 'analytics';

export interface UserProgress {
  id: string;
  userId: string;
  lessonId: string;
  status: ProgressStatus;
  score?: number;
  completedAt?: string;
}

export type ProgressStatus = 'not_started' | 'in_progress' | 'completed';

export interface Goal {
  id: string;
  userId: string;
  title: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline?: string;
  done: boolean;
  createdAt: string;
}
