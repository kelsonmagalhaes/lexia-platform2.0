import { pool } from '../../config/database';

export async function getQuestionsBySource(sourceId: string, sourceType?: string) {
  let query = 'SELECT * FROM questions WHERE source_id = $1';
  const values: unknown[] = [sourceId];

  if (sourceType) {
    query += ' AND source_type = $2';
    values.push(sourceType);
  }

  query += ' ORDER BY created_at';
  const result = await pool.query(query, values);
  return result.rows;
}

export async function getQuestionsByDiscipline(disciplineId: string, limit = 20) {
  const result = await pool.query(
    'SELECT * FROM questions WHERE discipline_id = $1 ORDER BY RANDOM() LIMIT $2',
    [disciplineId, limit]
  );
  return result.rows;
}

export async function getRandomQuestions(params: {
  disciplineId?: string;
  difficulty?: string;
  limit?: number;
}) {
  const conditions: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (params.disciplineId) {
    conditions.push(`discipline_id = $${idx++}`);
    values.push(params.disciplineId);
  }
  if (params.difficulty) {
    conditions.push(`difficulty = $${idx++}`);
    values.push(params.difficulty);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = params.limit ?? 10;
  values.push(limit);

  const result = await pool.query(
    `SELECT * FROM questions ${where} ORDER BY RANDOM() LIMIT $${idx}`,
    values
  );
  return result.rows;
}
