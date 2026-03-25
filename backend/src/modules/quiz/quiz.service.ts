import { pool } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';

export async function startQuiz(userId: string, params: {
  mode: string;
  disciplineId?: string;
  topicId?: string;
  limit?: number;
  difficulty?: string;
}) {
  let questionsQuery = 'SELECT id, content, question_type, options, difficulty, discipline_id FROM questions WHERE 1=1';
  const values: unknown[] = [];
  let idx = 1;

  if (params.disciplineId) {
    questionsQuery += ` AND discipline_id = $${idx++}`;
    values.push(params.disciplineId);
  }
  if (params.topicId) {
    questionsQuery += ` AND source_id = $${idx++} AND source_type = 'topic'`;
    values.push(params.topicId);
  }
  if (params.difficulty) {
    questionsQuery += ` AND difficulty = $${idx++}`;
    values.push(params.difficulty);
  }

  const limit = params.limit ?? 10;
  questionsQuery += ` ORDER BY RANDOM() LIMIT $${idx++}`;
  values.push(limit);

  const questionsResult = await pool.query(questionsQuery, values);

  if (questionsResult.rows.length === 0) {
    throw new AppError(404, 'Nenhuma questão disponível para os critérios selecionados');
  }

  const questions = questionsResult.rows.map((q) => ({
    questionId: q.id,
    content: q.content,
    options: q.options,
    difficulty: q.difficulty,
  }));

  const result = await pool.query(
    `INSERT INTO quiz_attempts (user_id, mode, discipline_id, questions, total_questions)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, created_at`,
    [userId, params.mode, params.disciplineId ?? null, JSON.stringify(questions), questions.length]
  );

  return {
    attemptId: result.rows[0].id,
    questions,
    totalQuestions: questions.length,
    createdAt: result.rows[0].created_at,
  };
}

export async function submitQuiz(userId: string, attemptId: string, answers: Record<string, string>) {
  const attemptResult = await pool.query(
    'SELECT * FROM quiz_attempts WHERE id = $1 AND user_id = $2 AND completed = FALSE',
    [attemptId, userId]
  );

  if (attemptResult.rows.length === 0) {
    throw new AppError(404, 'Quiz não encontrado ou já finalizado');
  }

  const attempt = attemptResult.rows[0];
  const questions: Array<{ questionId: string }> = attempt.questions;

  const questionIds = questions.map((q) => q.questionId);
  const correctResult = await pool.query(
    'SELECT id, correct_answer, explanation FROM questions WHERE id = ANY($1)',
    [questionIds]
  );

  const correctMap: Record<string, { answer: string; explanation: string }> = {};
  for (const q of correctResult.rows) {
    correctMap[q.id] = { answer: q.correct_answer, explanation: q.explanation };
  }

  let correctCount = 0;
  const feedback: Array<{ questionId: string; correct: boolean; correctAnswer: string; explanation: string }> = [];

  for (const questionId of questionIds) {
    const userAnswer = answers[questionId] ?? '';
    const isCorrect = correctMap[questionId]?.answer === userAnswer;
    if (isCorrect) correctCount++;
    feedback.push({
      questionId,
      correct: isCorrect,
      correctAnswer: correctMap[questionId]?.answer ?? '',
      explanation: correctMap[questionId]?.explanation ?? '',
    });
  }

  const score = (correctCount / questionIds.length) * 100;

  await pool.query(
    `UPDATE quiz_attempts SET
       answers = $1, score = $2, correct_answers = $3,
       completed = TRUE, completed_at = NOW()
     WHERE id = $4`,
    [JSON.stringify(answers), score, correctCount, attemptId]
  );

  return {
    score,
    correctAnswers: correctCount,
    totalQuestions: questionIds.length,
    feedback,
  };
}
