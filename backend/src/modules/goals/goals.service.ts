import { pool } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';

export async function getGoals(userId: string) {
  const result = await pool.query(
    'SELECT * FROM goals WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
}

export async function createGoal(userId: string, data: {
  title: string;
  targetValue: number;
  unit: string;
  deadline?: string;
}) {
  const result = await pool.query(
    'INSERT INTO goals (user_id, title, target_value, unit, deadline) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [userId, data.title, data.targetValue, data.unit, data.deadline ?? null]
  );
  return result.rows[0];
}

export async function updateGoal(userId: string, goalId: string, data: {
  currentValue?: number;
  done?: boolean;
  title?: string;
}) {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (data.currentValue !== undefined) { fields.push(`current_value = $${idx++}`); values.push(data.currentValue); }
  if (data.done !== undefined) { fields.push(`done = $${idx++}`); values.push(data.done); }
  if (data.title !== undefined) { fields.push(`title = $${idx++}`); values.push(data.title); }

  if (fields.length === 0) throw new AppError(400, 'Nenhum campo para atualizar');

  fields.push('updated_at = NOW()');
  values.push(goalId, userId);

  const result = await pool.query(
    `UPDATE goals SET ${fields.join(', ')} WHERE id = $${idx++} AND user_id = $${idx} RETURNING *`,
    values
  );

  if (result.rows.length === 0) throw new AppError(404, 'Meta não encontrada');
  return result.rows[0];
}
