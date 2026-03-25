import { pool } from '../../config/database';
import { XP_REWARDS, getLevelFromXp } from '@lexstudy/shared';

export type XpEventType = keyof typeof XP_REWARDS;

const XP_EVENT_MAP: Record<string, number> = {
  lesson_complete: XP_REWARDS.LESSON_COMPLETE,
  question_correct: XP_REWARDS.QUESTION_CORRECT,
  quiz_complete_perfect: XP_REWARDS.QUIZ_COMPLETE_PERFECT,
  quiz_complete: XP_REWARDS.QUIZ_COMPLETE,
  daily_streak: XP_REWARDS.DAILY_STREAK,
  simulado_complete: XP_REWARDS.SIMULADO_COMPLETE,
  pdf_upload: XP_REWARDS.PDF_UPLOAD,
  goal_complete: XP_REWARDS.GOAL_COMPLETE,
};

export async function awardXp(userId: string, eventType: string, reason?: string) {
  const xpDelta = XP_EVENT_MAP[eventType] ?? 0;
  if (xpDelta === 0) return null;

  await pool.query(
    'INSERT INTO gamification_history (user_id, event_type, xp_delta, reason) VALUES ($1, $2, $3, $4)',
    [userId, eventType, xpDelta, reason ?? null]
  );

  const result = await pool.query(
    'UPDATE users SET xp = xp + $1, updated_at = NOW() WHERE id = $2 RETURNING xp',
    [xpDelta, userId]
  );

  const newXp = result.rows[0].xp;
  const newLevel = getLevelFromXp(newXp);

  await pool.query('UPDATE users SET level = $1 WHERE id = $2', [newLevel.level, userId]);

  return { xpAwarded: xpDelta, newXp, level: newLevel };
}

export async function getMyGamification(userId: string) {
  const result = await pool.query(
    'SELECT xp, level, streak_days, last_study_date FROM users WHERE id = $1',
    [userId]
  );

  const user = result.rows[0];
  const levelInfo = getLevelFromXp(user.xp);

  const history = await pool.query(
    'SELECT event_type, xp_delta, reason, created_at FROM gamification_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20',
    [userId]
  );

  return {
    xp: user.xp,
    level: user.level,
    levelInfo,
    streakDays: user.streak_days,
    lastStudyDate: user.last_study_date,
    recentHistory: history.rows,
  };
}

export async function updateStreak(userId: string) {
  const result = await pool.query('SELECT last_study_date, streak_days FROM users WHERE id = $1', [userId]);
  const { last_study_date, streak_days } = result.rows[0];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastDate = last_study_date ? new Date(last_study_date) : null;

  if (lastDate) {
    const diff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return;
    const newStreak = diff === 1 ? streak_days + 1 : 1;
    await pool.query(
      'UPDATE users SET streak_days = $1, last_study_date = $2 WHERE id = $3',
      [newStreak, today, userId]
    );
    if (diff === 1) await awardXp(userId, 'daily_streak', 'Streak diário');
  } else {
    await pool.query('UPDATE users SET streak_days = 1, last_study_date = $1 WHERE id = $2', [today, userId]);
  }
}
