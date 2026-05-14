import { DialogTrigger } from '@radix-ui/react-dialog'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import type { GenerateFaqResponse } from '@/features/generation'
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
import { useUserSocket } from '@/app/providers/UserSocketProvider'
import { generateFaq } from '@/features/generation'
import { useTheme } from '@/features/theme-selection'
import { useSummariesByTheme } from '@/entities/summary/api/query'

interface IGenerationFaqDialog {
  children: ReactNode
  onSuccess?: (faqId: string) => void
}

const faqGenerationSchema = z.object({
  summaryId: z.number({ error: 'Выберите конспект' }),
  title: z.string().min(1, 'Введите название'),
  numQuestions: z
    .number()
    .min(1, 'Минимум 1 вопрос')
    .max(100, 'Максимум 100 вопросов'),
  detailLevel: z.enum(['easy', 'medium', 'hard'], {
    message: 'Выберите уровень детализации',
  }),
  additionalRequirements: z.string().optional(),
})

type FaqGenerationForm = z.infer<typeof faqGenerationSchema>

function GenerationFaqDialog(props: IGenerationFaqDialog) {
  const [faqId, setFaqId] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const { current } = useTheme()
  const { data: summaries = [] } = useSummariesByTheme(current?.id)
  const [isOpen, setIsOpen] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FaqGenerationForm>({
    resolver: zodResolver(faqGenerationSchema),
    defaultValues: {
      title: '',
      numQuestions: 10,
      detailLevel: 'medium',
      additionalRequirements: '',
    },
  })

  const generationMutation = useMutation({
    mutationFn: (data: FaqGenerationForm) => generateFaq(data),
    onSuccess: (response: GenerateFaqResponse) => {
      if (response.success) {
        setFaqId(response.faqId)
        setIsGenerating(true)
      }
    },
    onError: (error) => {
      console.error('FAQ generation error:', error)
    },
  })

  const { isConnected, lastMessage } = useUserSocket()

  useEffect(() => {
    if (!isGenerating || !faqId || !lastMessage) return
    if (lastMessage.faqId !== faqId) return
    if (lastMessage.status === 'SUCCESS') {
      setIsGenerating(false)
      setIsOpen(false)
      props.onSuccess?.(lastMessage.faqId)
    } else if (lastMessage.status === 'FAILED') {
      setIsGenerating(false)
    }
  }, [lastMessage, faqId, isGenerating])

  const onSubmit = (data: FaqGenerationForm) => {
    generationMutation.mutate(data)
  }

  console.log(summaries)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>{props.children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Опции для создания FAQ</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel>Конспект</FieldLabel>
                <Controller
                  name="summaryId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ? field.value.toString() : ''}
                      onValueChange={(val) => field.onChange(Number(val))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите конспект" />
                      </SelectTrigger>
                      <SelectContent>
                        {summaries.map((s) => (
                          <SelectItem key={s.id} value={s.id.toString()}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.summaryId && (
                  <FieldError>{errors.summaryId.message}</FieldError>
                )}
              </Field>
              <Field>
                <FieldLabel>Название</FieldLabel>
                <Input
                  placeholder="Введите название FAQ"
                  {...register('title')}
                />
                {errors.title && (
                  <FieldError>{errors.title.message}</FieldError>
                )}
              </Field>
              <Field>
                <FieldLabel>Количество вопросов</FieldLabel>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  placeholder="Введите количество вопросов"
                  {...register('numQuestions', { valueAsNumber: true })}
                />
                {errors.numQuestions && (
                  <FieldError>{errors.numQuestions.message}</FieldError>
                )}
              </Field>
              <Field>
                <FieldLabel>Уровень детализации</FieldLabel>
                <Controller
                  name="detailLevel"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите уровень" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Легкий</SelectItem>
                        <SelectItem value="medium">Средний</SelectItem>
                        <SelectItem value="hard">Подробный</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.detailLevel && (
                  <FieldError>{errors.detailLevel.message}</FieldError>
                )}
              </Field>
              <FieldSeparator />
              <Field>
                <FieldLabel>Дополнительные требования</FieldLabel>
                <Textarea
                  placeholder="Введите дополнительные требования"
                  rows={4}
                  {...register('additionalRequirements')}
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
                    ? 'Генерация FAQ...'
                    : 'Подключение к серверу...'}
                </span>
              </div>
            ) : (
              <Button type="submit" disabled={generationMutation.isPending}>
                {generationMutation.isPending ? 'Отправка...' : 'Создать FAQ'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default GenerationFaqDialog
