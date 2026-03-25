import { Request, Response, NextFunction } from 'express';
import * as lessonsService from './lessons.service';

export async function getLessonsByTopic(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await lessonsService.getLessonsByTopic(req.params.topicId);
    res.json({ data });
  } catch (error) {
    next(error);
  }
}

export async function getLessonById(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await lessonsService.getLessonById(req.params.id);
    res.json({ data });
  } catch (error) {
    next(error);
  }
}
