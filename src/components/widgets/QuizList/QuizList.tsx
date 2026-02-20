import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import GenerationQuizDialog from '../GenerationQuizDialog/GenerationQuizDialog'
import type { Quiz } from '@/types/quiz'
import apiClient from '@/lib/api-client'
import { useTheme } from '@/hooks/useTheme'
import QuizSmallCard from '@/components/dummies/QuizSmallCard'
import CreateQuizCard from '@/components/dummies/CreateQuizCard'
import { cn } from '@/lib/utils'
import quizApi from '@/models/Quiz/api'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface QuizListProps {
  className?: string
}

function QuizList({ className }: QuizListProps) {
  const [quizes, setQuizes] = useState<Array<Quiz>>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)
  const [quizToDelete, setQuizToDelete] = useState<Quiz | null>(null)
  const { current: currentTheme } = useTheme()

  const navigate = useNavigate();

  const loadQuizes = useCallback(() => {
    if (currentTheme) {
      setLoading(true)
      setError(null)
      apiClient
        .getQuizesByThemeId(currentTheme.id)
        .then((data) => {
          setQuizes(data)
          setLoading(false)
        })
        .catch((err) => {
          setError(err.message || 'Ошибка загрузки тестов')
          setLoading(false)
        })
    } else {
      setQuizes([])
    }
  }, [currentTheme])

  useEffect(() => {
    loadQuizes()
  }, [currentTheme])

  const handleCreateQuiz = () => {
    // Заглушка для будущей функциональности
  }

  const handleOpenQuiz = (quiz: Quiz) => {
    navigate({
        to: `/quiz/${quiz.id}`
    })
  }

  const handleEditQuiz = (quiz: Quiz) => {
    navigate({
      to: `/quiz/${quiz.id}/edit`
    })
  }

  const handleDeleteQuiz = (quiz: Quiz) => {
    setQuizToDelete(quiz)
    setDeleteDialogOpen(true)
  }

  const handleResultView = (quiz: Quiz) => {
    navigate({
      to: `/quiz/${quiz.id}/results`,
      search: {
        isTeacher: true
      }
    })
  }

  const confirmDeleteQuiz = () => {
    if (!quizToDelete) return

    quizApi.deleteQuiz(quizToDelete.id).then(() => {
      setQuizes(quizes.filter((q) => q.id !== quizToDelete.id))
      setDeleteDialogOpen(false)
      setQuizToDelete(null)
    }).catch((err: any) => {
      setError(err.message || 'Ошибка удаления теста')
      setDeleteDialogOpen(false)
      setQuizToDelete(null)
    })
  }

  if (!currentTheme) {
    return (
      <div className={cn('flex items-center justify-center text-muted-foreground', className)}>
        Выберите тему для отображения квизов
      </div>
    )
  }

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <div className="text-muted-foreground">Загрузка квизов...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn('flex items-center justify-center text-destructive', className)}>
        {error}
      </div>
    )
  }

  return (
    <>
      <div className={cn('w-full flex flex-col', className)}>
        <div className="p-4 overflow-y-auto min-h-0 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentTheme && (
              <GenerationQuizDialog onSuccess={loadQuizes}>
                <CreateQuizCard onClick={handleCreateQuiz} />
              </GenerationQuizDialog>
            )}
            {quizes.map((quiz) => (
              <QuizSmallCard
                key={quiz.id}
                quiz={quiz}
                onResultView={() => handleResultView(quiz)}
                onOpen={() => handleOpenQuiz(quiz)}
                onEdit={() => handleEditQuiz(quiz)}
                onDelete={() => handleDeleteQuiz(quiz)}
              />
            ))}
          </div>
          {quizes.length === 0 && (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              Тесты не найдены
            </div>
          )}
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтверждение удаления</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить тест "{quizToDelete?.name}"? Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setQuizToDelete(null)
              }}
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteQuiz}
            >
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default QuizList

