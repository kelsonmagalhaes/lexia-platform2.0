import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'TooManyRequests', message: 'Muitas tentativas. Aguarde 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: 'TooManyRequests', message: 'Limite de requisições atingido.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const lexIaLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'TooManyRequests', message: 'Limite de uso da LEX IA atingido.' },
  standardHeaders: true,
  legacyHeaders: false,
});
