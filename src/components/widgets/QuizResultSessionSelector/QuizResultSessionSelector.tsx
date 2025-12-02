import { useMemo } from 'react'
import type { Session } from '@/types/quiz'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface IQuizResultSessionSelectorProps {
  sessions: Array<Session>
  selected: Session | null
  setSelected: (session: Session | null) => void
}

function QuizResultSessionSelector({sessions, selected, setSelected}: IQuizResultSessionSelectorProps) {
  const selectedSession = useMemo(() => {
    if (!sessions || sessions.length === 0) return null
    if (selected) {
      const found = sessions.find((s) => s.id === selected.id)
      if (found) {
        setSelected(found)
        return found
      }
    }
    setSelected(sessions[0])
    return sessions[0]
  }, [sessions, selected])

  return (
    <Select
      value={selectedSession?.id || ''}
      onValueChange={(value) => setSelected(sessions.find((s) => s.id === value) || null)}
    >
      <SelectTrigger className="w-[300px]">
        <SelectValue placeholder="Выберите сессию" />
      </SelectTrigger>
      <SelectContent>
        {sessions.map((session) => (
          <SelectItem key={session.id} value={session.id}>
            {session.timeStart
              ? new Date(session.timeStart).toLocaleString('ru-RU')
              : 'Сессия ' + session.id.slice(0, 8)}
            {session.timeEnd && (
              <span className="text-muted-foreground ml-2">(завершена)</span>
            )}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default QuizResultSessionSelector
