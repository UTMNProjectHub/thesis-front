import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import apiClient from '@/lib/api-client'

interface CreateSubjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

function CreateSubjectDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateSubjectDialogProps) {
  const [name, setName] = useState('')
  const [shortName, setShortName] = useState('')
  const [yearStart, setYearStart] = useState('')
  const [yearEnd, setYearEnd] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentYear = new Date().getFullYear()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim() || !shortName.trim() || !yearStart || !yearEnd) {
      setError('Пожалуйста, заполните все обязательные поля')
      return
    }

    const startYear = parseInt(yearStart, 10)
    const endYear = parseInt(yearEnd, 10)

    if (isNaN(startYear) || isNaN(endYear)) {
      setError('Годы должны быть числами')
      return
    }

    if (startYear > endYear) {
      setError('Год начала не может быть больше года окончания')
      return
    }

    setIsLoading(true)

    try {
      await apiClient.createSubject({
        name: name.trim(),
        shortName: shortName.trim(),
        yearStart: startYear,
        yearEnd: endYear,
        description: description.trim() || null,
      })

      // Сброс формы
      setName('')
      setShortName('')
      setYearStart('')
      setYearEnd('')
      setDescription('')
      setError(null)

      onOpenChange(false)
      onSuccess?.()
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Не удалось создать предмет. Попробуйте еще раз.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setName('')
      setShortName('')
      setYearStart('')
      setYearEnd('')
      setDescription('')
      setError(null)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Создать новый предмет</DialogTitle>
          <DialogDescription>
            Заполните форму для создания нового предмета
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Название <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Например: Программирование"
                disabled={isLoading}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="shortName">
                Короткое название <span className="text-destructive">*</span>
              </Label>
              <Input
                id="shortName"
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                placeholder="Например: ПРОГ"
                disabled={isLoading}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="yearStart">
                  Год начала <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="yearStart"
                  type="number"
                  value={yearStart}
                  onChange={(e) => setYearStart(e.target.value)}
                  placeholder={currentYear.toString()}
                  min="2000"
                  max="2100"
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="yearEnd">
                  Год окончания <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="yearEnd"
                  type="number"
                  value={yearEnd}
                  onChange={(e) => setYearEnd(e.target.value)}
                  placeholder={(currentYear + 1).toString()}
                  min="2000"
                  max="2100"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Описание предмета (необязательно)"
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
              {isLoading ? 'Создание...' : 'Создать'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateSubjectDialog
