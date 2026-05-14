import { useMutation, useQueryClient } from '@tanstack/react-query'
import { sendChatMessage } from './api'
import { questionChatKeys } from './keys'

export function useSendChatMessage(questionId: string, sessionId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (text: string) =>
      sendChatMessage({ questionId, sessionId, text }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: questionChatKeys.messages(questionId, sessionId),
      })
    },
    onError: (error) => {
      console.error('Send chat message error:', error)
    },
  })
}
