import { LevelInfo } from '../types/gamification';

export const XP_REWARDS = {
  LESSON_COMPLETE: 10,
  QUESTION_CORRECT: 5,
  QUIZ_COMPLETE_PERFECT: 50,
  QUIZ_COMPLETE: 25,
  DAILY_STREAK: 20,
  SIMULADO_COMPLETE: 100,
  PDF_UPLOAD: 30,
  GOAL_COMPLETE: 200,
} as const;

export const LEVELS: LevelInfo[] = [
  { level: 'junior', label: 'Júnior', minXp: 0, maxXp: 500, color: '#6B7280' },
  { level: 'bacharel', label: 'Bacharel', minXp: 501, maxXp: 2000, color: '#3B82F6' },
  { level: 'advogado', label: 'Advogado', minXp: 2001, maxXp: 5000, color: '#10B981' },
  { level: 'doutor', label: 'Doutor', minXp: 5001, maxXp: 15000, color: '#8B5CF6' },
  { level: 'magistrado', label: 'Magistrado', minXp: 15001, maxXp: Infinity, color: '#C9A84C' },
];

export function getLevelFromXp(xp: number): LevelInfo {
  return LEVELS.find((l) => xp >= l.minXp && xp <= l.maxXp) ?? LEVELS[0];
}

export function getXpProgress(xp: number): number {
  const level = getLevelFromXp(xp);
  if (level.maxXp === Infinity) return 100;
  const range = level.maxXp - level.minXp;
  const progress = xp - level.minXp;
  return Math.min(100, Math.round((progress / range) * 100));
}
