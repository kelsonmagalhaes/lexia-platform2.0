import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import * as curriculumService from './curriculum.service';

export async function getCurriculum(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { institutionId } = req.query as Record<string, string>;
    const data = await curriculumService.getCurriculum(institutionId);
    res.json({ data });
  } catch (error) {
    next(error);
  }
}

export async function getPeriod(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const period = Number(req.params.period);
    const { institutionId } = req.query as Record<string, string>;
    const data = await curriculumService.getPeriodCurriculum(period, institutionId);
    res.json({ data });
  } catch (error) {
    next(error);
  }
}
