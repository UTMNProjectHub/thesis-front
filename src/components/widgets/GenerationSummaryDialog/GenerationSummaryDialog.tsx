import { DialogTrigger } from '@radix-ui/react-dialog'
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useGenerationFiles } from '@/hooks/useGenerationFiles'
import apiClient from '@/lib/api-client'
import { useTheme } from '@/hooks/useTheme'
import { useSubject } from '@/hooks/useSubject'

interface IGenerationSummaryDialog {
  children: ReactNode
  onSuccess?: (summaryId: string) => void
}

const summaryGenerationSchema = z.object({
  additional_requirements: z.string().optional(),
})

type SummaryGenerationForm = z.infer<typeof summaryGenerationSchema>

function GenerationSummaryDialog(props: IGenerationSummaryDialog) {
  const [summaryId, setSummaryId] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const { selectedFiles } = useGenerationFiles()
  const { current: currentTheme } = useTheme()
  const { current: currentSubject } = useSubject()
  const [isOpen, setIsOpen] = useState(false)

  const {
    register,
    handleSubmit,
  } = useForm<SummaryGenerationForm>({
    resolver: zodResolver(summaryGenerationSchema),
    defaultValues: {
      additional_requirements: '',
    },
  })

  const generationMutation = useMutation({
    mutationFn: (data: SummaryGenerationForm & { files: Array<string> }) =>
      apiClient.generateSummary({ ...data, themeId: currentTheme!.id, subjectId: currentSubject!.id }),
    onSuccess: (
      response: { success: boolean; message: string; summaryId: string },
    ) => {
      if (response.success) {
        setSummaryId(response.summaryId)
        setIsGenerating(true)
      }
    },
    onError: (error) => {
      console.error('Summary generation error:', error)
    },
  })

  const handleWebSocketMessage = useCallback(
    (data: any) => {
      if (data.status === 'SUCCESS') {
        setIsGenerating(false)
        setIsOpen(false)
        props.onSuccess?.(data.summaryId)
      } else if (data.status === 'FAILED') {
        setIsGenerating(false)
        console.error('Summary generation failed:', data.error)
      }
    },
    [props.onSuccess],
  )

  const { isConnected } = useWebSocket({
    topic: summaryId ? `summary.${summaryId}.generation` : null,
    enabled: isGenerating && !!summaryId,
    onMessage: handleWebSocketMessage,
  })

  const onSubmit = async (data: SummaryGenerationForm) => {
    if (selectedFiles.length === 0) {
      return
    }

    generationMutation.mutate({
      ...data,
      files: selectedFiles,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>{props.children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Опции для создания конспекта</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel>Дополнительные требования</FieldLabel>
                <Textarea
                  placeholder="Введите дополнительные требования к конспекту"
                  rows={4}
                  {...register('additional_requirements')}
                />
              </Field>
            </FieldGroup>
          </FieldSet>
          <DialogFooter>
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                <span>
                  {isConnected
                    ? 'Генерация конспекта...'
                    : 'Подключение к серверу...'}
                </span>
              </div>
            ) : (
              <Button
                type="submit"
                disabled={generationMutation.isPending}
              >
                {generationMutation.isPending
                  ? 'Отправка...'
                  : 'Создать конспект'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default GenerationSummaryDialog
