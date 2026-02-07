import { ApiClient } from '@/lib/api-client'
import {
  type SessionSubmitWithDetails,
  type Session,
  type QuizUserSession,
} from '@/types/quiz'

class SessionApi extends ApiClient {
  constructor() {
    super()
  }

  async getQuizSessions(quizId: string) {
    const response = await this.client.get<Session[]>(
      `/quizes/${quizId}/sessions`,
    )

    return response.data
  }

  async getQuizActiveSessions(quizId: string) {
    const response = await this.client.get<Session[]>(
      `/quizes/${quizId}/sessions/active`,
    )

    return response.data
  }

  async getQuizUsersSessions(quizId: string) {
    const response = await this.client.get<QuizUserSession[]>(
      `/quizes/${quizId}/sessions/users`,
    )

    return response.data
  }

  async createNewQuizSession(quizId: string) {
    const response = await this.client.post<Session>(
      `/quizes/${quizId}/sessions`,
    )

    return response.data
  }

  async finishQuizSession(quizId: string, sessionId: string) {
    const response = await this.client.post(
      `/quizes/${quizId}/sessions/${sessionId}/finish`,
    )

    return response.data
  }

  async getQuizSessionSubmits(quizId: string, sessionId: string) {
    const response = await this.client.post<SessionSubmitWithDetails>(
      `/quizes/${quizId}/sessions/${sessionId}/submits}`,
    )

    return response.data
  }
}

const sessionApi = new SessionApi()

export default sessionApi
