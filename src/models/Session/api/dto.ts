import type { Quiz } from '@/models/Quiz/api/dto'

export interface Session {
  id: string
  quizId: string
  userId: string
  timeStart: string | Date | null
  timeEnd: string | Date | null
  quiz?: Quiz
  sessionSubmits?: Array<any>
}

// Тип для submit из эндпоинта /sessions/:sessionId/submits
export type { SubmittedAnswer as SessionSubmitWithDetails } from '@/models/Quiz/api/dto'

export interface QuizUserSessionItem {
  id: string;
  timeStart: Date;
  timeEnd: Date | null;
  percentSolved: number;
  percentRight: number;
}

export interface QuizUserSession {
  userId: string;
  fullName: string;
  email: string;
  sessions: Array<QuizUserSessionItem>;
}
