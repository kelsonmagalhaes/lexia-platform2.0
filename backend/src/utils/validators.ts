import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const createQuizSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().optional(),
});

export const createGoalSchema = z.object({
  title: z.string().min(3).max(50),
  targetDate: z.date().optional(),
});