export const quizKeys = {
  all: ['quiz'] as const,
  quiz: (id: string) => [...quizKeys.all, id] as const,
  usersSessions: (id: string) =>
    [...quizKeys.all, id, 'usersSessions'] as const,
  questions: (id: string) => [...quizKeys.all, id, 'questions'] as const,
  activeSessions: (id: string) =>
    [...quizKeys.all, id, 'activeSessions'] as const,
  sessions: (id: string) => [...quizKeys.all, id, 'sessions'],
  sessionSubmits: (quizId: string, sessionId: string) =>
    [...quizKeys.all, quizId, 'sessions', sessionId, 'submits'] as const,
}
