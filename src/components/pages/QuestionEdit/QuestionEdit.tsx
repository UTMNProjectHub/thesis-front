import { useEffect } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import { Checkbox } from '@/components/ui/checkbox'
import apiClient from '@/lib/api-client'
import {
  useUpdateQuestion,
  useUpdateQuestionVariants,
} from '@/hooks/useQuiz'
import { Separator } from '@/components/ui/separator'

const questionEditSchema = z.object({
  text: z.string().min(1, { message: 'Текст вопроса обязателен' }),
  type: z.string().min(1, { message: 'Тип обязателен' }),
  multiAnswer: z.boolean().nullable().optional(),
  variants: z.array(
    z.object({
      text: z.string().min(1, { message: 'Текст варианта обязателен' }),
      explainRight: z.string().min(1, { message: 'Объяснение для правильного ответа обязательно' }),
      explainWrong: z.string().min(1, { message: 'Объяснение для неправильного ответа обязательно' }),
      isRight: z.boolean(),
    })
  ).optional(),
})

type QuestionEditForm = z.infer<typeof questionEditSchema>

function QuestionEdit() {
  const { quizId, questionId } = useParams({ strict: false })
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const updateQuestionMutation = useUpdateQuestion()
  const updateVariantsMutation = useUpdateQuestionVariants()

  const { data: questionData, isLoading, error } = useQuery({
    queryKey: ['question', questionId, 'edit'],
    queryFn: () => apiClient.getQuestion(questionId || ''),
    enabled: !!questionId,
  })

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<QuestionEditForm>({
    resolver: zodResolver(questionEditSchema),
    defaultValues: {
      text: '',
      type: '',
      multiAnswer: null,
      variants: [],
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'variants',
  })

  const questionType = watch('type')
  const needsVariants =
    questionType === 'multichoice' ||
    questionType === 'truefalse' ||
    questionType === 'matching'

  // Заполняем форму данными вопроса когда они загружаются
  useEffect(() => {
    if (questionData) {
      const formData = {
        text: questionData.text || '',
        type: questionData.type || '',
        multiAnswer: questionData.multiAnswer || null,
        variants: questionData.variants?.map((v) => ({
          text: v.text,
          explainRight: v.explainRight,
          explainWrong: v.explainWrong,
          isRight: v.isRight,
        })) || [],
      }
      reset(formData)
    }
  }, [questionData, reset])

  const onSubmit = async (data: QuestionEditForm) => {
    if (!questionId || !data.type) return

    try {
      // Обновляем вопрос
      await updateQuestionMutation.mutateAsync({
        questionId,
        data: {
          text: data.text,
          type: data.type,
          multiAnswer: data.multiAnswer,
        },
      })

      // Обновляем варианты, если они есть
      if (needsVariants && data.variants && data.variants.length > 0) {
        await updateVariantsMutation.mutateAsync({
          questionId,
          variants: data.variants,
        })
      }

      // Инвалидируем кэш
      queryClient.invalidateQueries({ queryKey: ['question', questionId] })
      if (quizId) {
        queryClient.invalidateQueries({ queryKey: ['quiz', quizId, 'questions'] })
      }

      // Возвращаемся на страницу редактирования квиза
      navigate({
        to: `/quiz/${quizId}/edit`,
      })
    } catch (error) {
      console.error('Failed to update question:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-full justify-center items-center">
        <div className="text-muted-foreground">Загрузка вопроса...</div>
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
              Не удалось загрузить информацию о вопросе
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (!questionData) {
    return (
      <div className="flex h-screen w-full justify-center items-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Вопрос не найден</CardTitle>
            <CardDescription>
              Вопрос с указанным идентификатором не существует
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
            <CardTitle className="text-3xl mb-2">Редактирование вопроса</CardTitle>
            <CardDescription>
              Измените информацию о вопросе
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <FieldSet>
                <FieldGroup>
                  <Field>
                    <FieldLabel>Текст вопроса</FieldLabel>
                    <Textarea
                      {...register('text')}
                      placeholder="Введите текст вопроса"
                      rows={4}
                    />
                    {errors.text && (
                      <FieldError>{errors.text.message}</FieldError>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel>Тип вопроса</FieldLabel>
                    <Select
                      defaultValue={questionData?.type}
                      // value={watch('type') ?? ''}
                      onValueChange={(value) => setValue('type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите тип вопроса" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="multichoice">Множественный выбор</SelectItem>
                        <SelectItem value="truefalse">Верно/Неверно</SelectItem>
                        <SelectItem value="shortanswer">Краткий ответ</SelectItem>
                        <SelectItem value="essay">Эссе</SelectItem>
                        <SelectItem value="numerical">Числовой ответ</SelectItem>
                        <SelectItem value="matching">Соответствие</SelectItem>
                        <SelectItem value="description">Описание</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.type && (
                      <FieldError>{errors.type.message}</FieldError>
                    )}
                  </Field>

                  {(questionType === 'multichoice' || questionType === 'matching') && (
                    <Field>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="multiAnswer"
                          checked={watch('multiAnswer') === true}
                          onCheckedChange={(checked) =>
                            setValue('multiAnswer', checked === true ? true : null)
                          }
                        />
                        <label
                          htmlFor="multiAnswer"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Разрешить множественный выбор
                        </label>
                      </div>
                    </Field>
                  )}

                  {needsVariants && (
                    <>
                      <Separator className="my-4" />
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <FieldLabel>Варианты ответов</FieldLabel>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              append({
                                text: '',
                                explainRight: '',
                                explainWrong: '',
                                isRight: false,
                              })
                            }
                          >
                            Добавить вариант
                          </Button>
                        </div>

                        {fields.map((field, index) => (
                          <Card key={field.id} className="p-4">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <FieldLabel>Вариант {index + 1}</FieldLabel>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => remove(index)}
                                >
                                  Удалить
                                </Button>
                              </div>

                              <Field>
                                <FieldLabel>Текст варианта</FieldLabel>
                                <Input
                                  {...register(`variants.${index}.text`)}
                                  placeholder="Введите текст варианта"
                                />
                                {errors.variants?.[index]?.text && (
                                  <FieldError>
                                    {errors.variants[index]?.text?.message}
                                  </FieldError>
                                )}
                              </Field>

                              <Field>
                                <FieldLabel>Объяснение для правильного ответа</FieldLabel>
                                <Textarea
                                  {...register(`variants.${index}.explainRight`)}
                                  placeholder="Введите объяснение"
                                  rows={2}
                                />
                                {errors.variants?.[index]?.explainRight && (
                                  <FieldError>
                                    {errors.variants[index]?.explainRight?.message}
                                  </FieldError>
                                )}
                              </Field>

                              <Field>
                                <FieldLabel>Объяснение для неправильного ответа</FieldLabel>
                                <Textarea
                                  {...register(`variants.${index}.explainWrong`)}
                                  placeholder="Введите объяснение"
                                  rows={2}
                                />
                                {errors.variants?.[index]?.explainWrong && (
                                  <FieldError>
                                    {errors.variants[index]?.explainWrong?.message}
                                  </FieldError>
                                )}
                              </Field>

                              <Field>
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`variant-${index}-isRight`}
                                    checked={watch(`variants.${index}.isRight`)}
                                    onCheckedChange={(checked) =>
                                      setValue(
                                        `variants.${index}.isRight`,
                                        checked === true
                                      )
                                    }
                                  />
                                  <label
                                    htmlFor={`variant-${index}-isRight`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    Правильный ответ
                                  </label>
                                </div>
                              </Field>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </>
                  )}
                </FieldGroup>
              </FieldSet>
            </form>
          </CardContent>
          <CardFooter>
            <div className="w-full flex items-center gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() =>
                  navigate({
                    to: `/quiz/${quizId}/edit`,
                  })
                }
              >
                Отмена
              </Button>
              <Button
                onClick={handleSubmit(onSubmit)}
                disabled={
                  updateQuestionMutation.isPending ||
                  updateVariantsMutation.isPending
                }
              >
                {updateQuestionMutation.isPending ||
                updateVariantsMutation.isPending
                  ? 'Сохранение...'
                  : 'Сохранить'}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default QuestionEdit

