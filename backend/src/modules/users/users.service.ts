import { pool } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';

export async function getMe(userId: string) {
  const result = await pool.query(
    `SELECT u.id, u.name, u.email, u.current_period, u.xp, u.level, 
            u.streak_days, u.last_study_date, u.avatar_url, u.is_premium,
            u.institution_custom, u.created_at,
            i.name as institution_name, i.id as institution_id
     FROM users u
     LEFT JOIN institutions i ON u.institution_id = i.id
     WHERE u.id = $1 AND u.deleted_at IS NULL`,
    [userId]
  );

  if (result.rows.length === 0) {
    throw new AppError(404, 'Usuário não encontrado');
  }

  return result.rows[0];
}

export async function updateMe(userId: string, data: {
  name?: string;
  currentPeriod?: number;
  institutionCustom?: string;
  institutionId?: string;
}) {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (data.name !== undefined) { fields.push(`name = $${idx++}`); values.push(data.name); }
  if (data.currentPeriod !== undefined) { fields.push(`current_period = $${idx++}`); values.push(data.currentPeriod); }
  if (data.institutionCustom !== undefined) { fields.push(`institution_custom = $${idx++}`); values.push(data.institutionCustom); }
  if (data.institutionId !== undefined) { fields.push(`institution_id = $${idx++}`); values.push(data.institutionId); }

  if (fields.length === 0) throw new AppError(400, 'Nenhum campo para atualizar');

  fields.push(`updated_at = NOW()`);
  values.push(userId);

  const result = await pool.query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} AND deleted_at IS NULL RETURNING id, name, email, current_period, xp, level, institution_custom`,
    values
  );

  return result.rows[0];
}

export async function deleteMe(userId: string) {
  await pool.query(
    `UPDATE users SET 
      deleted_at = NOW(),
      name = 'Usuário Removido',
      email = concat('deleted_', id, '@removed.lexstudy'),
      password_hash = 'DELETED',
      institution_custom = NULL,
      avatar_url = NULL
     WHERE id = $1`,
    [userId]
  );
  await pool.query('UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = $1', [userId]);
}

export async function exportMyData(userId: string) {
  const [user, progress, quizzes, goals, consents] = await Promise.all([
    pool.query('SELECT id, name, email, current_period, xp, level, created_at FROM users WHERE id = $1', [userId]),
    pool.query('SELECT * FROM user_progress WHERE user_id = $1', [userId]),
    pool.query('SELECT id, mode, score, total_questions, correct_answers, created_at FROM quiz_attempts WHERE user_id = $1', [userId]),
    pool.query('SELECT * FROM goals WHERE user_id = $1', [userId]),
    pool.query('SELECT consent_type, accepted, accepted_at FROM user_consents WHERE user_id = $1', [userId]),
  ]);

  return {
    user: user.rows[0],
    progress: progress.rows,
    quizAttempts: quizzes.rows,
    goals: goals.rows,
    consents: consents.rows,
    exportedAt: new Date().toISOString(),
  };
}
