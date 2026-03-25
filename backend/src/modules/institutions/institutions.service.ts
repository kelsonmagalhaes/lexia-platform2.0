import { pool } from '../../config/database';

export async function searchInstitutions(query: string) {
  const result = await pool.query(
    `SELECT id, name, slug, is_custom FROM institutions WHERE name ILIKE $1 LIMIT 20`,
    [`%${query}%`]
  );
  return result.rows;
}

export async function createCustomInstitution(name: string, userId: string) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');

  const existing = await pool.query('SELECT id FROM institutions WHERE slug = $1', [slug]);
  if (existing.rows.length > 0) return existing.rows[0];

  const result = await pool.query(
    'INSERT INTO institutions (name, slug, is_custom, created_by) VALUES ($1, $2, TRUE, $3) RETURNING *',
    [name, slug, userId]
  );
  return result.rows[0];
}
