import { useEffect, useState } from 'react'
import type { Quiz } from '@/types/quiz'
import apiClient from '@/lib/api-client'
import { useTheme } from '@/hooks/useTheme'
import QuizCard from '@/components/dummies/QuizCard'
import CreateQuizCard from '@/components/dummies/CreateQuizCard'
import { useNavigate } from '@tanstack/react-router'
import { cn } from '@/lib/utils'

interface QuizListProps {
  className?: string
}

function QuizList({ className }: QuizListProps) {
  const [quizes, setQuizes] = useState<Array<Quiz>>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const { current: currentTheme } = useTheme()

  const navigate = useNavigate();

  useEffect(() => {
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
          setError(err.message || 'Ошибка загрузки квизов')
          setLoading(false)
        })
    } else {
      setQuizes([])
    }
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
    // Заглушка для редактирования квиза
    console.log('Edit quiz:', quiz.id)
  }

  const handleDeleteQuiz = (quiz: Quiz) => {
    // Заглушка для удаления квиза
    console.log('Delete quiz:', quiz.id)
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
    <div className={cn('w-full flex flex-col', className)}>
      <div className="p-4 overflow-y-auto min-h-0 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentTheme && <CreateQuizCard onClick={handleCreateQuiz} />}
          {quizes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              onOpen={() => handleOpenQuiz(quiz)}
              onEdit={() => handleEditQuiz(quiz)}
              onDelete={() => handleDeleteQuiz(quiz)}
            />
          ))}
        </div>
        {quizes.length === 0 && (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Квизы не найдены
          </div>
        )}
      </div>
    </div>
  )
}

export default QuizList

