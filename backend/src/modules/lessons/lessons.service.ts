import { pool } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';

export async function getLessonsByTopic(topicId: string) {
  const result = await pool.query(
    'SELECT * FROM lessons WHERE topic_id = $1 ORDER BY display_order',
    [topicId]
  );
  return result.rows;
}

export async function getLessonById(id: string) {
  const result = await pool.query(
    `SELECT l.*, t.title as topic_title, t.discipline_id
     FROM lessons l
     JOIN topics t ON t.id = l.topic_id
     WHERE l.id = $1`,
    [id]
  );
  if (result.rows.length === 0) throw new AppError(404, 'Aula não encontrada');
  return result.rows[0];
}
