import { useEffect, useState } from 'react'
import type { Theme } from '@/entities/subject'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import { updateTheme } from '@/entities/subject'

interface EditThemeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  theme: Theme
  onSuccess?: () => void
}

function EditThemeDialog({
  open,
  onOpenChange,
  theme,
  onSuccess,
}: EditThemeDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setName(theme.name)
      setDescription(theme.description)
      setError(null)
    }
  }, [open, theme])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Пожалуйста, введите название темы')
      return
    }

    setIsLoading(true)

    try {
      await updateTheme(theme.id, {
        name: name.trim(),
        description: description.trim() || null,
      })

      onOpenChange(false)
      onSuccess?.()
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Не удалось обновить тему. Попробуйте еще раз.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Редактировать тему</DialogTitle>
          <DialogDescription>Измените данные темы</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-theme-name">
                Название <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-theme-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-theme-description">Описание</Label>
              <Textarea
                id="edit-theme-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Описание темы (необязательно)"
                disabled={isLoading}
                rows={3}
              />
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EditThemeDialog
