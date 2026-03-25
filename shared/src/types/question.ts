export interface Question {
  id: string;
  sourceId: string;
  sourceType: QuestionSourceType;
  questionType: QuestionType;
  content: string;
  options?: QuestionOption[];
  correctAnswer: string;
  explanation?: string;
  difficulty: QuestionDifficulty;
  disciplineId?: string;
  createdAt: string;
}

export type QuestionSourceType = 'lesson' | 'topic' | 'pdf' | 'ai_generated' | 'simulado';
export type QuestionType = 'mcq' | 'essay' | 'true_false';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export interface QuestionOption {
  key: string;
  text: string;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  mode: QuizMode;
  disciplineId?: string;
  questions: QuizQuestion[];
  answers?: Record<string, string>;
  score?: number;
  totalQuestions: number;
  correctAnswers?: number;
  durationSeconds?: number;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

export type QuizMode = 'lesson' | 'topic' | 'simulado' | 'oab' | 'concurso' | 'pdf' | 'ai';

export interface QuizQuestion {
  questionId: string;
  content: string;
  options?: QuestionOption[];
  difficulty: QuestionDifficulty;
}
