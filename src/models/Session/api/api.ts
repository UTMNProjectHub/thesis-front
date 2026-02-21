import type { QuizUserSession, Session } from './dto'
import type { SubmittedAnswer } from '@/models/Quiz/api/dto'
import apiClient from '@/lib/api-client'

export const getActiveSessions = async (quizId: string): Promise<Array<Session>> => {
  const response = await apiClient.client.get<Array<Session>>(
    `/quizes/${quizId}/sessions/active`,
  )
  return response.data
}

export const getAllSessions = async (quizId: string): Promise<Array<Session>> => {
  const response = await apiClient.client.get<Array<Session>>(
    `/quizes/${quizId}/sessions/all`,
  )
  return response.data
}

export const getSessionSubmits = async (
  quizId: string,
  sessionId: string,
): Promise<Array<SubmittedAnswer>> => {
  const response = await apiClient.client.get<Array<SubmittedAnswer>>(
    `/quizes/${quizId}/sessions/${sessionId}/submits`,
  )
  return response.data
}

export const finishSession = async (quizId: string, sessionId: string): Promise<void> => {
  await apiClient.client.post(`/quizes/${quizId}/sessions/${sessionId}/finish`)
}

export const getQuizSessions = async (quizId: string): Promise<Array<Session>> => {
  const response = await apiClient.client.get<Array<Session>>(
    `/quizes/${quizId}/sessions`,
  )
  return response.data
}

export const getQuizUsersSessions = async (quizId: string): Promise<Array<QuizUserSession>> => {
  const response = await apiClient.client.get<Array<QuizUserSession>>(
    `/quizes/${quizId}/sessions/users`,
  )
  return response.data
}

export const createNewQuizSession = async (quizId: string): Promise<Session> => {
  const response = await apiClient.client.post<Session>(
    `/quizes/${quizId}/sessions`,
  )
  return response.data
}
