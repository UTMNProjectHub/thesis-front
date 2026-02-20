import { useState } from 'react'
import type { ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'

const QUESTION_TYPES = [
  { value: 'multichoice', label: 'Множественный выбор' },
  { value: 'essay', label: 'Эссе (многострочный ответ)' },
  { value: 'matching', label: 'Соответствие' },
  { value: 'truefalse', label: 'Верно/неверно' },
  { value: 'shortanswer', label: 'Краткий ответ' },
  { value: 'numerical', label: 'Числовой ответ' },
] as const

interface DummyGenerationQuizDialogProps {
  children: ReactNode
}

function DummyGenerationQuizDialog({ children }: DummyGenerationQuizDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTypes, setSelectedTypes] = useState<Array<string>>(['multichoice', 'truefalse'])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Опции для создания квизов</DialogTitle>
        </DialogHeader>
        <FieldSet>
          <FieldGroup>
            <Field>
              <FieldLabel>Сложность теста</FieldLabel>
              <Select defaultValue="medium">
                <SelectTrigger>
                  <SelectValue placeholder="Выберите сложность" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Легкий</SelectItem>
                  <SelectItem value="medium">Средний</SelectItem>
                  <SelectItem value="hard">Сложный</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Количество вопросов</FieldLabel>
              <Input
                type="number"
                min={1}
                max={100}
                defaultValue={10}
                placeholder="Введите количество вопросов"
              />
            </Field>
            <Field>
              <FieldLabel>Типы вопросов</FieldLabel>
              <div className="flex flex-col gap-2">
                {QUESTION_TYPES.map((type) => (
                  <div key={type.value} className="flex items-center gap-2">
                    <Checkbox
                      id={`dummy-${type.value}`}
                      checked={selectedTypes.includes(type.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedTypes([...selectedTypes, type.value])
                        } else {
                          setSelectedTypes(selectedTypes.filter((t) => t !== type.value))
                        }
                      }}
                    />
                    <label
                      htmlFor={`dummy-${type.value}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {type.label}
                    </label>
                  </div>
                ))}
              </div>
            </Field>
            <FieldSeparator />
            <Field>
              <FieldLabel>Пожелания к тесту</FieldLabel>
              <Textarea
                placeholder="Введите пожелания к тесту"
                rows={4}
              />
            </Field>
          </FieldGroup>
        </FieldSet>
        <DialogFooter>
          <Button onClick={() => setIsOpen(false)}>
            Создать тест
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DummyGenerationQuizDialog
