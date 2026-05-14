import { useQuery } from '@tanstack/react-query'
import { fetchChatMessages } from './api'
import { questionChatKeys } from './keys'
import apiClient from '@/shared/api/api-client'

export function useChatMessages(
  questionId: string,
  sessionId: string | undefined,
  options?: { enabled?: boolean },
) {
  const baseEnabled =
    !!questionId && !!sessionId && apiClient.isAuthenticated()
  return useQuery({
    queryKey: questionChatKeys.messages(questionId, sessionId ?? ''),
    queryFn: () => fetchChatMessages(questionId, sessionId as string),
    enabled:
      options?.enabled !== undefined ? options.enabled && baseEnabled : baseEnabled,
    staleTime: 0,
  })
}
