import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { toast } from 'sonner'
import { useUser } from '@/entities/user'
import { useWebSocket } from '@/shared/hooks/useWebSocket'

interface UserSocketContextValue {
  isConnected: boolean
  lastMessage: any
}

const UserSocketContext = createContext<UserSocketContextValue | null>(null)

export function UserSocketProvider({ children }: { children: ReactNode }) {
  const { data: user } = useUser()
  const [lastMessage, setLastMessage] = useState<any>(null)

  const { isConnected } = useWebSocket({
    topic: user?.id ? `user.${user.id}` : null,
    onMessage: (data) => {
      setLastMessage(data)
      if (data.status === 'SUCCESS') {
        if (data.quizId) toast.success('Тест готов!')
        if (data.summaryId) toast.success('Конспект готов!')
      } else if (data.status === 'FAILED') {
        toast.error(`Ошибка генерации: ${data.error ?? 'неизвестная ошибка'}`)
      }
    },
  })

  return (
    <UserSocketContext.Provider value={{ isConnected, lastMessage }}>
      {children}
    </UserSocketContext.Provider>
  )
}

export function useUserSocket() {
  const ctx = useContext(UserSocketContext)
  if (!ctx) throw new Error('useUserSocket must be used inside UserSocketProvider')
  return ctx
}
