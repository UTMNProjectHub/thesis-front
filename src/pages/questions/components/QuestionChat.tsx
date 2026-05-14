import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  questionChatKeys,
  useChatMessages,
  useSendChatMessage,
} from '@/entities/question-chat'
import { useUserSocket } from '@/app/providers/UserSocketProvider'
import { Button } from '@/shared/ui/button'
import { Textarea } from '@/shared/ui/textarea'
import { cn } from '@/shared/lib/utils'

interface QuestionChatProps {
  questionId: string
  sessionId: string
}

export function QuestionChat({ questionId, sessionId }: QuestionChatProps) {
  const [text, setText] = useState('')
  const { data, isLoading } = useChatMessages(questionId, sessionId)
  const sendMessage = useSendChatMessage(questionId, sessionId)
  const queryClient = useQueryClient()
  const { lastMessage } = useUserSocket()

  const dialogId = data?.dialogId ?? null
  const messages = data?.messages ?? []

  useEffect(() => {
    if (!lastMessage || !dialogId) return
    if (lastMessage.dialogId === dialogId) {
      queryClient.invalidateQueries({
        queryKey: questionChatKeys.messages(questionId, sessionId),
      })
    }
  }, [lastMessage, dialogId, questionId, sessionId, queryClient])

  const trimmed = text.trim()
  const canSend = trimmed.length > 0 && !sendMessage.isPending

  const handleSend = () => {
    if (!canSend) return
    sendMessage.mutate(trimmed, {
      onSuccess: () => setText(''),
    })
  }

  return (
    <div className="space-y-3">
      <h4 className="text-base font-semibold">Обсуждение ответа</h4>

      <div className="flex flex-col gap-2 max-h-96 overflow-y-auto rounded-md border bg-muted/30 p-3">
        {isLoading && (
          <div className="text-sm text-muted-foreground">Загрузка...</div>
        )}
        {!isLoading && messages.length === 0 && (
          <div className="text-sm text-muted-foreground">
            Задайте вопрос о вашем ответе
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              'max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap break-words',
              msg.role === 'user'
                ? 'self-end bg-primary text-primary-foreground'
                : 'self-start bg-background border',
            )}
          >
            {msg.content}
          </div>
        ))}
      </div>

      <div className="flex gap-2 items-end">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Спросите что-нибудь о своём ответе..."
          rows={2}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          disabled={sendMessage.isPending}
        />
        <Button onClick={handleSend} disabled={!canSend}>
          {sendMessage.isPending ? 'Отправка...' : 'Отправить'}
        </Button>
      </div>
    </div>
  )
}
