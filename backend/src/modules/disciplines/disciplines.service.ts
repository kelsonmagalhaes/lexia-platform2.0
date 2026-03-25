import { pool } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { parsePagination, buildPaginatedResponse } from '../../utils/pagination';

export async function getDisciplines(params: { period?: number; search?: string; page?: number; limit?: number }) {
  const { offset, limit, page } = parsePagination(params);

  const conditions: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (params.period) {
    conditions.push(`d.period_default = $${idx++}`);
    values.push(params.period);
  }

  if (params.search) {
    conditions.push(`d.name ILIKE $${idx++}`);
    values.push(`%${params.search}%`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const [dataResult, countResult] = await Promise.all([
    pool.query(
      `SELECT id, name, period_default, description, prerequisites, is_ead
       FROM disciplines d ${where}
       ORDER BY period_default, name
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...values, limit, offset]
    ),
    pool.query(`SELECT COUNT(*) FROM disciplines d ${where}`, values),
  ]);

  return buildPaginatedResponse(dataResult.rows, Number(countResult.rows[0].count), page, limit);
}

export async function getDisciplineById(id: string) {
  const result = await pool.query(
    `SELECT d.*, 
            COUNT(DISTINCT t.id) as topic_count,
            COUNT(DISTINCT l.id) as lesson_count
     FROM disciplines d
     LEFT JOIN topics t ON t.discipline_id = d.id
     LEFT JOIN lessons l ON l.topic_id = t.id
     WHERE d.id = $1
     GROUP BY d.id`,
    [id]
  );

  if (result.rows.length === 0) {
    throw new AppError(404, 'Disciplina não encontrada');
  }

  return result.rows[0];
}
