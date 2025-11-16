import { useState, useMemo } from 'react'
import {
  useQuizUsersSessions,
  useSessionSubmits,
  useQuizQuestions,
} from '@/hooks/useQuiz'
import { useParams } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import QuizResultView from '@/components/widgets/QuizResultView/QuizResultView'
import { Eye } from 'lucide-react'
import { SessionStats } from '../../widgets/QuizSessionStats/SessionStats'

function QuizResultsTeacher() {
  const { id: quizId } = useParams({ strict: false })
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  )
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  const { data: usersSessions, isLoading } = useQuizUsersSessions(quizId || '')

  const { data: sessionSubmits, isLoading: sessionSubmitsLoading } =
    useSessionSubmits(quizId || '', selectedSessionId || '')
  const { data: quizQuestions, isLoading: questionsLoading } = useQuizQuestions(
    quizId || '',
    selectedSessionId || '',
  )

  const handleViewSession = (userId: string, sessionId: string) => {
    setSelectedUserId(userId)
    setSelectedSessionId(sessionId)
  }

  const handleCloseDialog = () => {
    setSelectedSessionId(null)
    setSelectedUserId(null)
  }

  const selectedUser = useMemo(() => {
    if (!usersSessions || !selectedUserId) return null
    return usersSessions.find((user) => user.userId === selectedUserId)
  }, [usersSessions, selectedUserId])

  const selectedSession = useMemo(() => {
    if (!selectedUser || !selectedSessionId) return null
    return selectedUser.sessions.find(
      (session) => session.id === selectedSessionId,
    )
  }, [selectedUser, selectedSessionId])

  if (isLoading) {
    return (
      <div className="flex h-screen w-full justify-center items-center">
        <div className="text-muted-foreground">Загрузка результатов...</div>
      </div>
    )
  }

  if (!usersSessions || usersSessions.length === 0) {
    return (
      <div className="flex h-screen w-full justify-center items-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Нет результатов</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Для этого квиза пока нет завершенных сессий пользователей</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Результаты пользователей</h1>

      <div className="space-y-6">
        {usersSessions.map((userSession) => (
          <Card key={userSession.userId}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">
                    {userSession.fullName}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {userSession.email}
                  </p>
                </div>
                <Badge variant="secondary">
                  {userSession.sessions.length} сессий
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {userSession.sessions.length === 0 ? (
                <p className="text-muted-foreground">Нет сессий</p>
              ) : (
                <div className="space-y-3">
                  {userSession.sessions.map((session) => {
                    const timeStart = new Date(session.timeStart)
                    const timeEnd = session.timeEnd
                      ? new Date(session.timeEnd)
                      : null
                    const isCompleted = !!timeEnd
                    let timeElapsed = null
                    if (timeEnd) {
                      const end = new Date(timeEnd).getTime()
                      const start = new Date(timeStart).getTime()
                      const diffMs = Math.max(0, end - start)
                      const hours = Math.floor(diffMs / (1000 * 60 * 60))
                      const minutes = Math.floor(
                        (diffMs % (1000 * 60 * 60)) / (1000 * 60),
                      )
                      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000)
                      const parts = []
                      if (hours > 0) parts.push(`${hours} ч`)
                      if (minutes > 0 || hours > 0) parts.push(`${minutes} мин`)
                      parts.push(`${seconds} сек`)
                      timeElapsed = parts.join(' ')
                    }

                    return (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="font-medium">
                                {timeStart.toLocaleString('ru-RU', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                              {timeEnd && (
                                <>
                                  <p className="text-sm text-muted-foreground">
                                    Завершена:{' '}
                                    {timeEnd.toLocaleString('ru-RU', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </p>
                                  {timeElapsed && (
                                    <p className="text-sm text-muted-foreground">
                                      Общее время: {timeElapsed}
                                    </p>
                                  )}
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <SessionStats
                                solvedPercent={session.percentSolved}
                                rightPercent={session.percentRight}
                                compact={true}
                              />
                              <Badge
                                variant={isCompleted ? 'default' : 'secondary'}
                              >
                                {isCompleted ? 'Завершена' : 'Активна'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleViewSession(userSession.userId, session.id)
                          }
                        >
                          <Eye className="size-4 mr-2" />
                          Просмотр
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedSessionId} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Результаты: {selectedUser?.fullName} -{' '}
              {selectedSession?.timeStart
                ? new Date(selectedSession.timeStart).toLocaleString('ru-RU')
                : 'Сессия'}
            </DialogTitle>
          </DialogHeader>
          {sessionSubmitsLoading || questionsLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-muted-foreground">
                Загрузка результатов...
              </div>
            </div>
          ) : selectedSessionId && quizQuestions && sessionSubmits ? (
            <div>
              <QuizResultView
                session={{
                  id: selectedSessionId,
                  quizId: quizId || '',
                  userId: selectedUserId || '',
                  timeStart: selectedSession?.timeStart || null,
                  timeEnd: selectedSession?.timeEnd || null,
                }}
                quizQuestions={quizQuestions}
                sessionSubmits={sessionSubmits}
              />
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Нет данных для отображения
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default QuizResultsTeacher
