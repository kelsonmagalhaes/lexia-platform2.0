import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';
import { RegisterInput, LoginInput } from './auth.schema';
import { AuthRequest } from '../../middleware/auth';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { user, tokens } = await authService.registerUser(req.body as RegisterInput);
    res.status(201).json({ data: { user, tokens }, message: 'Conta criada com sucesso' });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { user, tokens } = await authService.loginUser(req.body as LoginInput);
    res.json({ data: { user, tokens }, message: 'Login realizado com sucesso' });
  } catch (error) {
    next(error);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshTokens(refreshToken);
    res.json({ data: tokens });
  } catch (error) {
    next(error);
  }
}

export async function logout(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;
    await authService.logoutUser(req.userId!, refreshToken);
    res.json({ data: null, message: 'Logout realizado com sucesso' });
  } catch (error) {
    next(error);
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    await authService.forgotPassword(req.body.email);
    res.json({ data: null, message: 'Se o e-mail existir, você receberá as instruções de recuperação' });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    await authService.resetPassword(req.body.token, req.body.password);
    res.json({ data: null, message: 'Senha alterada com sucesso' });
  } catch (error) {
    next(error);
  }
}
