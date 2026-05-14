import type { Quiz, SubmittedAnswer } from '@/entities/quiz/model/types'

export interface Session {
  id: string
  quizId: string
  userId: string
  timeStart: string | Date | null
  timeEnd: string | Date | null
  quiz?: Quiz
  sessionSubmits?: Array<any>
}

export type { SubmittedAnswer as SessionSubmitWithDetails }

export interface QuizUserSessionItem {
  id: string
  timeStart: Date
  timeEnd: Date | null
  rightAnswers: number
  totalSubmits: number
}

export interface QuizUserSession {
  userId: string
  fullName: string
  email: string
  sessions: Array<QuizUserSessionItem>
}
