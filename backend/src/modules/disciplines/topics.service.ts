import { pool } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';

export async function getTopicsByDiscipline(disciplineId: string) {
  const result = await pool.query(
    `SELECT t.*, COUNT(l.id) as lesson_count
     FROM topics t
     LEFT JOIN lessons l ON l.topic_id = t.id
     WHERE t.discipline_id = $1
     GROUP BY t.id
     ORDER BY t.display_order`,
    [disciplineId]
  );
  return result.rows;
}

export async function getTopicById(id: string) {
  const result = await pool.query('SELECT * FROM topics WHERE id = $1', [id]);
  if (result.rows.length === 0) throw new AppError(404, 'Tema não encontrado');
  return result.rows[0];
}
