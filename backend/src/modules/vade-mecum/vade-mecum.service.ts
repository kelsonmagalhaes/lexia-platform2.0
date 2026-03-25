import { pool } from '../../config/database';
import { redis } from '../../config/redis';
import { AppError } from '../../middleware/errorHandler';
import { LAWS } from '@lexstudy/shared';

const CACHE_TTL = 24 * 60 * 60;

export async function searchArticles(query: string, lawCode?: string) {
  const conditions = ["search_vector @@ plainto_tsquery('portuguese', $1)"];
  const values: unknown[] = [query];
  let idx = 2;
  if (lawCode) { conditions.push(`law_code = $${idx++}`); values.push(lawCode); }
  const result = await pool.query(
    `SELECT law_code, article_number, article_text, simplified_text, ts_rank(search_vector, plainto_tsquery('portuguese', $1)) as rank FROM vade_mecum_articles WHERE ${conditions.join(' AND ')} ORDER BY rank DESC LIMIT 20`,
    values
  );
  return result.rows;
}

export async function getArticle(lawCode: string, articleNumber: string) {
  const cacheKey = `vade-mecum:${lawCode}:${articleNumber}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);
  const result = await pool.query('SELECT * FROM vade_mecum_articles WHERE law_code = $1 AND article_number = $2', [lawCode, articleNumber]);
  if (result.rows.length > 0) {
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result.rows[0]));
    return result.rows[0];
  }
  const law = LAWS.find((l) => l.code === lawCode);
  if (!law) throw new AppError(404, 'Código de lei não encontrado');
  return {
    law_code: lawCode,
    article_number: articleNumber,
    article_text: `Art. ${articleNumber} — Consulte: https://www.planalto.gov.br/ccivil_03/${law.planaltoPath}`,
    simplified_text: null,
  };
}

export async function getFavorites(userId: string) {
  const result = await pool.query('SELECT * FROM vade_mecum_favorites WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
  return result.rows;
}

export async function addFavorite(userId: string, lawCode: string, articleNumber: string, articleText?: string) {
  const result = await pool.query(
    'INSERT INTO vade_mecum_favorites (user_id, law_code, article_number, article_text) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id, law_code, article_number) DO UPDATE SET article_text = EXCLUDED.article_text RETURNING *',
    [userId, lawCode, articleNumber, articleText ?? null]
  );
  return result.rows[0];
}

export async function removeFavorite(userId: string, favoriteId: string) {
  await pool.query('DELETE FROM vade_mecum_favorites WHERE id = $1 AND user_id = $2', [favoriteId, userId]);
}