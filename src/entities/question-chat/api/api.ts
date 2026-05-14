import apiClient from '@/shared/api/api-client'

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  sequenceNo: number
  createdAt: string
}

export type ChatHistory = {
  dialogId: string | null
  messages: Array<ChatMessage>
}

export const fetchChatMessages = async (
  questionId: string,
  sessionId: string,
): Promise<ChatHistory> => {
  const response = await apiClient.client.get<ChatHistory>('/questions/chat', {
    params: { questionId, sessionId },
  })
  return response.data
}

export const sendChatMessage = async (body: {
  questionId: string
  sessionId: string
  text: string
}): Promise<void> => {
  await apiClient.client.post('/questions/chat', body)
}
