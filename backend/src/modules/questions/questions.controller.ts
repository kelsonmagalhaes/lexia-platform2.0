import { Request, Response, NextFunction } from 'express';
import * as questionsService from './questions.service';

export async function getBySource(req: Request, res: Response, next: NextFunction) {
  try {
    const { sourceType } = req.query as Record<string, string>;
    const data = await questionsService.getQuestionsBySource(req.params.sourceId, sourceType);
    res.json({ data });
  } catch (error) {
    next(error);
  }
}

export async function getRandom(req: Request, res: Response, next: NextFunction) {
  try {
    const { disciplineId, difficulty, limit } = req.query as Record<string, string>;
    const data = await questionsService.getRandomQuestions({
      disciplineId,
      difficulty,
      limit: limit ? Number(limit) : undefined,
    });
    res.json({ data });
  } catch (error) {
    next(error);
  }
}
