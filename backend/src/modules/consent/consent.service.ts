import { pool } from '../../config/database';

export async function getConsents(userId: string) {
  const result = await pool.query(
    'SELECT consent_type, accepted, accepted_at FROM user_consents WHERE user_id = $1',
    [userId]
  );
  return result.rows;
}

export async function upsertConsent(
  userId: string,
  consentType: string,
  accepted: boolean,
  ip?: string,
  userAgent?: string
) {
  const result = await pool.query(
    `INSERT INTO user_consents (user_id, consent_type, accepted, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (user_id, consent_type) DO UPDATE
     SET accepted = EXCLUDED.accepted, ip_address = EXCLUDED.ip_address,
         user_agent = EXCLUDED.user_agent, accepted_at = NOW()
     RETURNING *`,
    [userId, consentType, accepted, ip ?? null, userAgent ?? null]
  );
  return result.rows[0];
}

export async function hasRequiredConsents(userId: string): Promise<boolean> {
  const result = await pool.query(
    `SELECT COUNT(*) FROM user_consents 
     WHERE user_id = $1 AND consent_type IN ('privacy', 'terms') AND accepted = TRUE`,
    [userId]
  );
  return Number(result.rows[0].count) >= 2;
}
