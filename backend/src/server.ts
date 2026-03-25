import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { env } from './config/env';
import { checkDatabaseConnection } from './config/database';
import { checkRedisConnection } from './config/redis';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';

import authRouter from './modules/auth/auth.router';
import usersRouter from './modules/users/users.router';
import curriculumRouter from './modules/curriculum/curriculum.router';
import disciplinesRouter from './modules/disciplines/disciplines.router';
import topicsRouter from './modules/disciplines/topics.router';
import lessonsRouter from './modules/lessons/lessons.router';
import questionsRouter from './modules/questions/questions.router';
import quizRouter from './modules/quiz/quiz.router';
import progressRouter from './modules/progress/progress.router';
import gamificationRouter from './modules/gamification/gamification.router';
import lexIaRouter from './modules/lex-ia/lex-ia.router';
import pdfRouter from './modules/pdf/pdf.router';
import vadeMecumRouter from './modules/vade-mecum/vade-mecum.router';
import statsRouter from './modules/stats/stats.router';
import goalsRouter from './modules/goals/goals.router';
import consentRouter from './modules/consent/consent.router';
import institutionsRouter from './modules/institutions/institutions.router';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN.split(','), credentials: true }));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api', apiLimiter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'LexStudy API', version: '1.0.0' });
});

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/curriculum', curriculumRouter);
app.use('/api/disciplines', disciplinesRouter);
app.use('/api/topics', topicsRouter);
app.use('/api/lessons', lessonsRouter);
app.use('/api/questions', questionsRouter);
app.use('/api/quiz', quizRouter);
app.use('/api/progress', progressRouter);
app.use('/api/gamification', gamificationRouter);
app.use('/api/lex-ia', lexIaRouter);
app.use('/api/pdf', pdfRouter);
app.use('/api/vade-mecum', vadeMecumRouter);
app.use('/api/stats', statsRouter);
app.use('/api/goals', goalsRouter);
app.use('/api/consent', consentRouter);
app.use('/api/institutions', institutionsRouter);

app.use(errorHandler);

async function bootstrap() {
  try {
    await checkDatabaseConnection();
    console.log('PostgreSQL connected');
    await checkRedisConnection();
    console.log('Redis connected');

    app.listen(env.BACKEND_PORT, () => {
      console.log(`LexStudy API running on port ${env.BACKEND_PORT} [${env.NODE_ENV}]`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
