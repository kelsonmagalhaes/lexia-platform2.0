import { Request, Response, NextFunction } from 'express';
import * as disciplinesService from './disciplines.service';
import * as topicsService from './topics.service';

export async function getDisciplines(req: Request, res: Response, next: NextFunction) {
  try {
    const { period, search, page, limit } = req.query as Record<string, string>;
    const data = await disciplinesService.getDisciplines({
      period: period ? Number(period) : undefined,
      search,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.json({ data });
  } catch (error) {
    next(error);
  }
}

export async function getDisciplineById(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await disciplinesService.getDisciplineById(req.params.id);
    res.json({ data });
  } catch (error) {
    next(error);
  }
}

export async function getTopicsByDiscipline(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await topicsService.getTopicsByDiscipline(req.params.disciplineId);
    res.json({ data });
  } catch (error) {
    next(error);
  }
}
