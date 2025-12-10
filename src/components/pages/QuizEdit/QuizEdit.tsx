import { useNavigate, useParams } from '@tanstack/react-router'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { Pencil } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useQuiz, useQuizQuestions, useUpdateQuiz } from '@/hooks/useQuiz'
import { useSubject } from '@/hooks/useSubject'
import apiClient from '@/lib/api-client'

const quizEditSchema = z.object({
  name: z.string().min(1, { message: 'Название обязательно' }),
  description: z.string().min(1, { message: 'Описание обязательно' }),
  maxSessions: z.number().min(0, { message: 'Минимум 0' }),
  themeId: z.number().nullable().optional(),
})

type QuizEditForm = z.infer<typeof quizEditSchema>

function QuizEdit() {
  const { id } = useParams({ strict: false })
  const navigate = useNavigate()
  const { data: quiz, isLoading, error } = useQuiz(id || '')
  const { data: questions, isLoading: questionsLoading } = useQuizQuestions(id || '', undefined, true);
  const updateQuizMutation = useUpdateQuiz()
  const { current: currentSubject } = useSubject()

  // Загружаем темы для выбора
  const { data: themes } = useQuery({
    queryKey: ['themes', currentSubject?.id],
    queryFn: () => {
      if (!currentSubject?.id) return []
      return apiClient.getThemesBySubjectId(currentSubject.id)
    },
    enabled: !!currentSubject?.id,
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<QuizEditForm>({
    resolver: zodResolver(quizEditSchema),
    defaultValues: {
      name: quiz?.name || '',
      description: quiz?.description || '',
      maxSessions: quiz?.maxSessions || 1,
      themeId: quiz?.themeId || null,
    },
    values: quiz
      ? {
          name: quiz.name,
          description: quiz.description,
          maxSessions: quiz.maxSessions,
          themeId: quiz.themeId,
        }
      : undefined,
  })

  const watchedThemeId = watch('themeId')

  const onSubmit = async (data: QuizEditForm) => {
    if (!id) return

    try {
      await updateQuizMutation.mutateAsync({
        quizId: id,
        data: {
          name: data.name,
          description: data.description,
          type: 'mixed',
          maxSessions: data.maxSessions,
          themeId: data.themeId,
        },
      })
      // Не перенаправляем, остаемся на странице редактирования
    } catch (error) {
      console.error('Failed to update quiz:', error)
    }
  }

  const handleEditQuestion = (questionId: string) => {
    navigate({
      to: `/quiz/${id}/question/${questionId}/edit`,
    })
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-full justify-center items-center">
        <div className="text-muted-foreground">Загрузка теста...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen w-full justify-center items-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-500">Ошибка</CardTitle>
            <CardDescription>
              Не удалось загрузить информацию о квизе
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="flex h-screen w-full justify-center items-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Тест не найден</CardTitle>
            <CardDescription>
              Тест с указанным идентификатором не существует
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full justify-center overflow-auto py-6">
      <div className="w-full max-w-4xl px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl mb-2">Редактирование теста</CardTitle>
            <CardDescription>
              Измените информацию о тесте
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <FieldSet>
                <FieldGroup>
                  <Field>
                    <FieldLabel>Название теста</FieldLabel>
                    <Input
                      {...register('name')}
                      placeholder="Введите название теста"
                    />
                    {errors.name && (
                      <FieldError>{errors.name.message}</FieldError>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel>Описание</FieldLabel>
                    <Textarea
                      {...register('description')}
                      placeholder="Введите описание теста"
                      rows={4}
                    />
                    {errors.description && (
                      <FieldError>{errors.description.message}</FieldError>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel>Максимальное количество попыток</FieldLabel>
                    <Input
                      type="number"
                      {...register('maxSessions', { valueAsNumber: true })}
                      placeholder="0 для неограниченного количества"
                      min={0}
                    />
                    {errors.maxSessions && (
                      <FieldError>{errors.maxSessions.message}</FieldError>
                    )}
                  </Field>

                  {themes && themes.length > 0 && (
                    <Field>
                      <FieldLabel>Тема</FieldLabel>
                      <Select
                        value={
                          watchedThemeId !== null && watchedThemeId !== undefined
                            ? watchedThemeId.toString()
                            : undefined
                        }
                        onValueChange={(value) => {
                          const themeId = value === 'none' ? null : parseInt(value)
                          setValue('themeId', themeId)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите тему" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Без темы</SelectItem>
                          {themes.map((theme) => (
                            <SelectItem
                              key={theme.id}
                              value={theme.id.toString()}
                            >
                              {theme.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                </FieldGroup>
              </FieldSet>
            </form>
          </CardContent>
          <CardFooter>
            <div className="w-full flex items-center gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => navigate({ to: `/quiz/${id}` })}
              >
                Отмена
              </Button>
              <Button
                onClick={handleSubmit(onSubmit)}
                disabled={updateQuizMutation.isPending}
              >
                {updateQuizMutation.isPending ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Список вопросов */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">Вопросы теста</CardTitle>
                <CardDescription>
                  {questionsLoading
                    ? 'Загрузка вопросов...'
                    : questions
                      ? `Всего вопросов: ${questions.length}`
                      : 'Вопросы не найдены'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {questionsLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Загрузка вопросов...
              </div>
            ) : questions && questions.length > 0 ? (
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <Card key={question.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-lg">
                              Вопрос {index + 1}
                            </CardTitle>
                            <Badge variant="secondary">{question.type}</Badge>
                          </div>
                          <CardDescription className="text-base mt-2">
                            {question.text}
                          </CardDescription>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditQuestion(question.id)}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Редактировать
                        </Button>
                      </div>
                    </CardHeader>
                    {question.variants && question.variants.length > 0 && (
                      <CardContent>
                        <div className="text-sm text-muted-foreground">
                          Вариантов ответа: {question.variants.length}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                В этом тесте пока нет вопросов
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default QuizEdit

