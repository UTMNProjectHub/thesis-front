import type { Session } from '@/entities/session'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'

interface SessionSelectorProps {
  sessions: Array<Session>
  onSelectSession: (sessionId: string) => void
  isLoading?: boolean
  canCreateNew?: boolean
  onCreateNew?: () => void
}

export function SessionSelector({
  sessions,
  onSelectSession,
  isLoading = false,
  canCreateNew = false,
  onCreateNew,
}: SessionSelectorProps) {
  const formatDate = (date: string | Date | null) => {
    if (!date) return 'Неизвестно'
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj)
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-full justify-center items-center">
        <div className="text-muted-foreground">Загрузка сессий...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full justify-center items-center">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Выберите активную сессию</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 border rounded-md hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">Сессия</p>
                  <p className="text-xs text-muted-foreground">
                    Начата: {formatDate(session.timeStart)}
                  </p>
                </div>
                <Button
                  onClick={() => onSelectSession(session.id)}
                  variant="default"
                >
                  Продолжить
                </Button>
              </div>
            ))}
            {canCreateNew && onCreateNew && (
              <Button
                onClick={onCreateNew}
                variant="outline"
                className="w-full mt-2"
              >
                Начать новую попытку
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
