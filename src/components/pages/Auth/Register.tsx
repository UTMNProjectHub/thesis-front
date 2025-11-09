import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRegister } from '@/hooks/useAuth'

const registerSchema = z
  .object({
    email: z.string().email({ message: 'Введите корректную почту' }),
    lastName: z.string().min(1, { message: 'Фамилия обязательна' }),
    firstName: z.string().min(1, { message: 'Имя обязательно' }),
    middleName: z.string().optional(),
    password: z
      .string()
      .min(8, { message: 'Минимум 8 символов' })
      .regex(/[0-9]/, { message: 'Требуется хотя бы одна цифра' })
      .regex(/[A-ZА-ЯЁ]/, { message: 'Требуется хотя бы одна заглавная буква' })
      .regex(/[^A-Za-zА-Яа-яЁё0-9]/, {
        message: 'Требуется хотя бы один специальный символ',
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Пароли не совпадают',
  })

type RegisterForm = z.infer<typeof registerSchema>

function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
  })

  const registerMutation = useRegister()

  function onSubmit(values: RegisterForm) {
    registerMutation.mutate({
      ...values,
      full_name:
        `${values.lastName} ${values.firstName} ${values.middleName || ''}`.trim(),
    })
  }

  return (
    <div className="flex mx-auto justify-center items-center h-screen">
      <form className="w-xl" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FieldSet>
          <FieldLegend>Регистрация</FieldLegend>
          <FieldDescription>
            Уже есть аккаунт? <Link to="/auth/login">Войдите здесь</Link>
          </FieldDescription>
          {registerMutation.error && (
            <FieldDescription className="text-red-500">
              Ошибка регистрации
            </FieldDescription>
          )}
          <FieldGroup className="!gap-0.5">
            <Field>
              <FieldLabel>Электропочта</FieldLabel>
              <Input
                type="email"
                placeholder="example@utmn.ru"
                {...register('email')}
              />
              <FieldDescription className="text-red-500">
                {errors.email?.message}
              </FieldDescription>
            </Field>
            <div className="grid grid-cols-3 gap-1">
              <Field>
                <FieldLabel>Фамилия</FieldLabel>
                <Input
                  {...register('lastName')}
                  autoComplete="family-name"
                  placeholder="Иванов"
                />
                <FieldDescription className="text-red-500">
                  {errors.lastName?.message}
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel>Имя</FieldLabel>
                <Input
                  {...register('firstName')}
                  autoComplete="given-name"
                  placeholder="Иван"
                />
                <FieldDescription className="text-red-500">
                  {errors.firstName?.message}
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel>Отчество</FieldLabel>
                <Input
                  {...register('middleName')}
                  autoComplete="middlename"
                  placeholder="Иванович"
                />
                <FieldDescription className="text-red-500">
                  {errors.middleName?.message}
                </FieldDescription>
              </Field>
            </div>
            <Field>
              <FieldLabel>Пароль</FieldLabel>
              <FieldDescription>
                Минимум 8 символов, одна цифра, один спецсимвол и заглавная
                буква
              </FieldDescription>
              <Input
                type="password"
                placeholder="********"
                {...register('password')}
              />
              <FieldDescription className="text-red-500">
                {errors.password?.message}
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel>Подтверждение пароля</FieldLabel>
              <FieldDescription>Повторите введённый пароль</FieldDescription>
              <Input
                type="password"
                placeholder="********"
                {...register('confirmPassword')}
              />
              <FieldDescription className="text-red-500">
                {errors.confirmPassword?.message}
              </FieldDescription>
            </Field>
          </FieldGroup>
          <Button type="submit" disabled={registerMutation.isPending}>
            {registerMutation.isPending ? 'Регистрация...' : 'Далее'}
          </Button>
        </FieldSet>
      </form>
    </div>
  )
}

export default Register
