import { DialogTrigger } from '@radix-ui/react-dialog'
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
  FieldError,
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
import { QuizType } from '@/models/Quiz/const'
import { useTheme } from '@/hooks/useTheme'

interface IGenerationQuizDialog {
  children: ReactNode
}

function GenerationQuizDialog(props: IGenerationQuizDialog) {

  const { current: currentTheme } = useTheme()
  
  return (
    <Dialog>
      <DialogTrigger>{props.children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Опции для создания квизов</DialogTitle>
        </DialogHeader>
        <FieldSet>
          <FieldGroup>
            <Field>
              <FieldLabel>Название теста</FieldLabel>
              <Input defaultValue={currentTheme?.name} type="text" placeholder="Введите название теста" />
              <FieldError></FieldError>
            </Field>
            <Field>
              <FieldLabel>Описание теста</FieldLabel>
              <Textarea placeholder="Введите описание теста" rows={4} />
              <FieldError></FieldError>
            </Field>
            <div className="flex flex-row gap-2 justify-between">
              <div>
                <Field>
                  <FieldLabel>Сложность теста</FieldLabel>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите сложность" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Легкий</SelectItem>
                      <SelectItem value="medium">Средний</SelectItem>
                      <SelectItem value="hard">Сложный</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError></FieldError>
                </Field>
                <Field>
                  <FieldLabel>Количество вопросов</FieldLabel>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    placeholder="Введите количество вопросов"
                  />
                  <FieldError></FieldError>
                </Field>
                <Field>
                  <FieldLabel>Время на тест</FieldLabel>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    placeholder="Введите время на тест"
                  />
                  <FieldError></FieldError>
                </Field>
                <Field>
                  <FieldLabel>Количество попыток</FieldLabel>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    placeholder="Введите количество попыток"
                  />
                  <FieldError></FieldError>
                </Field>
              </div>

              <div>
                <Field>
                  <FieldLabel>Типы вопросов</FieldLabel>
                  <div className="flex flex-col gap-2">
                    {Object.values(QuizType).map((type) => (
                      <div key={type} className="flex items-center gap-2">
                        <Checkbox id={type} value={type} />
                        <label
                          htmlFor={type}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>
                  <FieldError></FieldError>
                </Field>
              </div>
            </div>
            <FieldSeparator />
            <Field>
              <FieldLabel>Пожелания к тесту</FieldLabel>
              <Textarea placeholder="Введите пожелания к тесту" rows={4} />
            </Field>
          </FieldGroup>
        </FieldSet>
        <DialogFooter>
          <Button type="submit">Создать тест</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default GenerationQuizDialog
