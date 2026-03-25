import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import * as usersService from './users.service';
import { z } from 'zod';

const updateMeSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  currentPeriod: z.coerce.number().int().min(1).max(10).optional(),
  institutionCustom: z.string().max(255).optional(),
  institutionId: z.string().uuid().optional(),
});

export async function getMe(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await usersService.getMe(req.userId!);
    res.json({ data: user });
  } catch (error) {
    next(error);
  }
}

export async function updateMe(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const parsed = updateMeSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation Error', details: parsed.error.flatten() });
      return;
    }
    const user = await usersService.updateMe(req.userId!, parsed.data);
    res.json({ data: user, message: 'Perfil atualizado' });
  } catch (error) {
    next(error);
  }
}

export async function deleteMe(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await usersService.deleteMe(req.userId!);
    res.json({ data: null, message: 'Conta excluída com sucesso' });
  } catch (error) {
    next(error);
  }
}

export async function exportMyData(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = await usersService.exportMyData(req.userId!);
    res.setHeader('Content-Disposition', 'attachment; filename="meus_dados_lexstudy.json"');
    res.json({ data });
  } catch (error) {
    next(error);
  }
}
