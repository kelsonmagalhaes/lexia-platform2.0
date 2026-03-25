import { pool } from '../../config/database';

export async function getUserProgress(userId: string, disciplineId?: string) {
  let query = `
    SELECT up.*, l.title as lesson_title, t.title as topic_title, d.name as discipline_name
    FROM user_progress up
    JOIN lessons l ON l.id = up.lesson_id
    JOIN topics t ON t.id = l.topic_id
    JOIN disciplines d ON d.id = t.discipline_id
    WHERE up.user_id = $1
  `;
  const values: unknown[] = [userId];

  if (disciplineId) {
    query += ' AND d.id = $2';
    values.push(disciplineId);
  }

  const result = await pool.query(query + ' ORDER BY up.updated_at DESC', values);
  return result.rows;
}

export async function upsertProgress(userId: string, lessonId: string, status: string, score?: number) {
  const result = await pool.query(
    `INSERT INTO user_progress (user_id, lesson_id, status, score, completed_at)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (user_id, lesson_id) DO UPDATE
     SET status = EXCLUDED.status, score = EXCLUDED.score,
         completed_at = EXCLUDED.completed_at, updated_at = NOW()
     RETURNING *`,
    [userId, lessonId, status, score ?? null, status === 'completed' ? new Date() : null]
  );
  return result.rows[0];
}

export async function getProgressSummary(userId: string) {
  const result = await pool.query(
    `SELECT 
       d.id as discipline_id, d.name as discipline_name, d.period_default,
       COUNT(l.id) as total_lessons,
       COUNT(CASE WHEN up.status = 'completed' THEN 1 END) as completed_lessons,
       ROUND(AVG(up.score) FILTER (WHERE up.score IS NOT NULL), 2) as avg_score
     FROM disciplines d
     JOIN topics t ON t.discipline_id = d.id
     JOIN lessons l ON l.topic_id = t.id
     LEFT JOIN user_progress up ON up.lesson_id = l.id AND up.user_id = $1
     GROUP BY d.id, d.name, d.period_default
     ORDER BY d.period_default, d.name`,
    [userId]
  );
  return result.rows;
}
