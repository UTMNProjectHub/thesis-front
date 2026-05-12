import { DialogTrigger } from '@radix-ui/react-dialog'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import type { GenerateQuizResponse } from '@/features/generation'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
} from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Textarea } from '@/shared/ui/textarea'
import { Checkbox } from '@/shared/ui/checkbox'
import { useUserSocket } from '@/app/providers/UserSocketProvider'
import { generateQuiz } from '@/features/generation'
import { useTheme } from '@/features/theme-selection'
import { useSummariesByTheme } from '@/entities/summary/api/query'

const QUESTION_TYPES = [
  { value: 'multichoice', label: 'Множественный выбор' },
  { value: 'essay', label: 'Эссе (многострочный ответ)' },
  { value: 'matching', label: 'Соответствие' },
  { value: 'truefalse', label: 'Верно/неверно' },
  { value: 'shortanswer', label: 'Краткий ответ' },
  { value: 'numerical', label: 'Числовой ответ' },
] as const

interface IGenerationQuizDialog {
  children: ReactNode
  selectedFiles: Array<string>
  onSuccess?: (quizId: string) => void
}

const quizGenerationSchema = z.object({
  summaryId: z.string().uuid().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard'], {
    message: 'Выберите сложность',
  }),
  question_count: z
    .number()
    .min(1, 'Минимум 1 вопрос')
    .max(100, 'Максимум 100 вопросов'),
  question_types: z
    .array(
      z.enum([
        'multichoice',
        'essay',
        'matching',
        'truefalse',
        'shortanswer',
        'numerical',
      ]),
    )
    .min(1, 'Выберите хотя бы один тип вопроса'),
  additional_requirements: z.string().optional(),
})

type QuizGenerationForm = z.infer<typeof quizGenerationSchema>

function GenerationQuizDialog(props: IGenerationQuizDialog) {
  const [quizId, setQuizId] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const { current } = useTheme()
  const { data: summaries } = useSummariesByTheme(current?.id)
  const [isOpen, setIsOpen] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<QuizGenerationForm>({
    resolver: zodResolver(quizGenerationSchema),
    defaultValues: {
      summaryId: undefined,
      difficulty: 'medium',
      question_count: 10,
      question_types: [],
      additional_requirements: '',
    },
  })

  const generationMutation = useMutation({
    mutationFn: (data: QuizGenerationForm & { files: Array<string> }) =>
      generateQuiz({
        ...data,
        themeId: current!.id,
        summaryId: data.summaryId,
      }),
    onSuccess: (response: GenerateQuizResponse) => {
      if (response.success) {
        setQuizId(response.quizId)
        setIsGenerating(true)
      }
    },
    onError: (error) => {
      console.error('Quiz generation error:', error)
    },
  })

  const { isConnected, lastMessage } = useUserSocket()

  useEffect(() => {
    if (!isGenerating || !quizId || !lastMessage) return
    if (lastMessage.quizId !== quizId) return
    if (lastMessage.status === 'SUCCESS') {
      setIsGenerating(false)
      setIsOpen(false)
      props.onSuccess?.(lastMessage.quizId)
    } else if (lastMessage.status === 'FAILED') {
      setIsGenerating(false)
    }
  }, [lastMessage, quizId, isGenerating])

  const onSubmit = async (data: QuizGenerationForm) => {
    if (props.selectedFiles.length === 0) {
      return
    }

    generationMutation.mutate({
      ...data,
      files: props.selectedFiles,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>{props.children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Опции для создания квизов</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel>Сложность теста</FieldLabel>
                <Controller
                  name="difficulty"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите сложность" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Легкий</SelectItem>
                        <SelectItem value="medium">Средний</SelectItem>
                        <SelectItem value="hard">Сложный</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.difficulty && (
                  <FieldError>{errors.difficulty.message}</FieldError>
                )}
              </Field>
              <Field>
                <FieldLabel>Количество вопросов</FieldLabel>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  placeholder="Введите количество вопросов"
                  {...register('question_count', { valueAsNumber: true })}
                />
                {errors.question_count && (
                  <FieldError>{errors.question_count.message}</FieldError>
                )}
              </Field>
              <Field>
                <FieldLabel>Типы вопросов</FieldLabel>
                <div className="flex flex-col gap-2">
                  {QUESTION_TYPES.map((type) => (
                    <div key={type.value} className="flex items-center gap-2">
                      <Controller
                        name="question_types"
                        control={control}
                        render={({ field }) => (
                          <Checkbox
                            id={type.value}
                            checked={field.value.includes(type.value)}
                            onCheckedChange={(checked) => {
                              const current = field.value
                              if (checked) {
                                field.onChange([...current, type.value])
                              } else {
                                field.onChange(
                                  current.filter((t) => t !== type.value),
                                )
                              }
                            }}
                          />
                        )}
                      />
                      <label
                        htmlFor={type.value}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {type.label}
                      </label>
                    </div>
                  ))}
                </div>
                {errors.question_types && (
                  <FieldError>{errors.question_types.message}</FieldError>
                )}
              </Field>
              {summaries && summaries.length > 0 && (
                <Field>
                  <FieldLabel>Конспект</FieldLabel>
                  <Controller
                    name="summaryId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value ?? 'none'}
                        onValueChange={(val) =>
                          field.onChange(val === 'none' ? undefined : val)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Не выбрано" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Не выбрано</SelectItem>
                          {summaries.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>
              )}
              <FieldSeparator />
              <Field>
                <FieldLabel>Пожелания к тесту</FieldLabel>
                <Textarea
                  placeholder="Введите пожелания к тесту"
                  rows={4}
                  {...register('additional_requirements')}
                />
              </Field>
            </FieldGroup>
          </FieldSet>
          <DialogFooter>
            {isGenerating ? (
              <div className="flex items-center gap-2 mt-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                <span>
                  {isConnected
                    ? 'Генерация квиза...'
                    : 'Подключение к серверу...'}
                </span>
              </div>
            ) : (
              <Button type="submit" disabled={generationMutation.isPending}>
                {generationMutation.isPending ? 'Отправка...' : 'Создать тест'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default GenerationQuizDialog
