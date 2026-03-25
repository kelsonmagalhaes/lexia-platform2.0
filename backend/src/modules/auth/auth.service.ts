import { pool } from '../../config/database';
import { redis } from '../../config/redis';
import { hashPassword, comparePassword, generateSecureToken, hashToken } from '../../utils/hash';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { AppError } from '../../middleware/errorHandler';
import { RegisterInput, LoginInput } from './auth.schema';

export async function registerUser(input: RegisterInput) {
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [input.email]);
  if (existing.rows.length > 0) {
    throw new AppError(409, 'E-mail já cadastrado');
  }

  const passwordHash = await hashPassword(input.password);

  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash, current_period, institution_custom)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, current_period, xp, level, created_at`,
    [input.name, input.email, passwordHash, input.currentPeriod, input.institutionCustom ?? null]
  );

  const user = result.rows[0];
  const tokens = await generateTokenPair(user.id, user.email);
  return { user, tokens };
}

export async function loginUser(input: LoginInput) {
  const result = await pool.query(
    'SELECT id, name, email, password_hash, current_period, xp, level, is_premium FROM users WHERE email = $1 AND deleted_at IS NULL',
    [input.email]
  );

  if (result.rows.length === 0) {
    throw new AppError(401, 'Credenciais inválidas');
  }

  const user = result.rows[0];
  const passwordMatch = await comparePassword(input.password, user.password_hash);

  if (!passwordMatch) {
    throw new AppError(401, 'Credenciais inválidas');
  }

  const { password_hash: _ph, ...safeUser } = user;
  const tokens = await generateTokenPair(user.id, user.email);
  return { user: safeUser, tokens };
}

export async function refreshTokens(refreshToken: string) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError(401, 'Refresh token inválido');
  }

  const tokenHash = hashToken(refreshToken);
  const stored = await pool.query(
    'SELECT id FROM refresh_tokens WHERE token_hash = $1 AND revoked = FALSE AND expires_at > NOW()',
    [tokenHash]
  );

  if (stored.rows.length === 0) {
    throw new AppError(401, 'Refresh token inválido ou expirado');
  }

  await pool.query('UPDATE refresh_tokens SET revoked = TRUE WHERE token_hash = $1', [tokenHash]);

  const tokens = await generateTokenPair(payload.userId, payload.email);
  return tokens;
}

export async function logoutUser(userId: string, refreshToken?: string) {
  if (refreshToken) {
    const tokenHash = hashToken(refreshToken);
    await pool.query('UPDATE refresh_tokens SET revoked = TRUE WHERE token_hash = $1', [tokenHash]);
  }
  await redis.del(`user:${userId}:session`);
}

export async function forgotPassword(email: string) {
  const result = await pool.query('SELECT id FROM users WHERE email = $1 AND deleted_at IS NULL', [email]);
  if (result.rows.length === 0) return;

  const userId = result.rows[0].id;
  const token = generateSecureToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await pool.query(
    'INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
    [userId, tokenHash, expiresAt]
  );

  return { token, email };
}

export async function resetPassword(token: string, newPassword: string) {
  const tokenHash = hashToken(token);
  const result = await pool.query(
    'SELECT id, user_id FROM password_resets WHERE token_hash = $1 AND used = FALSE AND expires_at > NOW()',
    [tokenHash]
  );

  if (result.rows.length === 0) {
    throw new AppError(400, 'Token de recuperação inválido ou expirado');
  }

  const { id: resetId, user_id: userId } = result.rows[0];
  const passwordHash = await hashPassword(newPassword);

  await pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [passwordHash, userId]);
  await pool.query('UPDATE password_resets SET used = TRUE WHERE id = $1', [resetId]);
  await pool.query('UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = $1', [userId]);
}

async function generateTokenPair(userId: string, email: string) {
  const accessToken = signAccessToken({ userId, email });
  const refreshToken = signRefreshToken({ userId, email });
  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await pool.query(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
    [userId, tokenHash, expiresAt]
  );

  return {
    accessToken,
    refreshToken,
    expiresIn: 15 * 60,
  };
}
