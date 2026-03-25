export interface GamificationHistory {
  id: string;
  userId: string;
  eventType: GamificationEvent;
  xpDelta: number;
  reason?: string;
  createdAt: string;
}

export type GamificationEvent =
  | 'lesson_complete'
  | 'question_correct'
  | 'quiz_complete'
  | 'daily_streak'
  | 'simulado_complete'
  | 'pdf_upload'
  | 'goal_complete'
  | 'level_up';

export interface LevelInfo {
  level: import('./user').UserLevel;
  label: string;
  minXp: number;
  maxXp: number;
  color: string;
}
