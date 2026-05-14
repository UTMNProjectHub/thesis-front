export const questionChatKeys = {
  all: ['question-chat'] as const,
  messages: (questionId: string, sessionId: string) =>
    ['question-chat', questionId, sessionId] as const,
}
