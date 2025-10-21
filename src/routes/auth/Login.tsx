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
import { useLogin } from '@/hooks/useAuth'

/**
 * Zod schema for the login form.
 * - `email` must be a valid email
 * - `password` must satisfy the same complexity constraints as registration
 */
const loginSchema = z.object({
  email: z.string().email({ message: 'Введите корректную почту' }),
  password: z
    .string()
    .min(8, { message: 'Минимум 8 символов' })
    .regex(/[0-9]/, { message: 'Требуется хотя бы одна цифра' })
    .regex(/[A-ZА-ЯЁ]/, { message: 'Требуется хотя бы одна заглавная буква' })
    .regex(/[^A-Za-zА-Яа-яЁё0-9]/, {
      message: 'Требуется хотя бы один специальный символ',
    }),
})

type LoginForm = z.infer<typeof loginSchema>

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  })

  const loginMutation = useLogin()

  function onSubmit(values: LoginForm) {
    loginMutation.mutate(values)
  }

  let errorMessage: string | null = null
  if (loginMutation.error) {
    const err = loginMutation.error as unknown
    let status: number | undefined
    if (err && typeof err === 'object' && 'response' in err) {
      status = (err as any).response?.status
    }
    if (status === 404) errorMessage = 'Пользователь не найден'
    else if (status === 401) errorMessage = 'Неверный email или пароль'
    else errorMessage = 'Ошибка входа'
  }

  return (
    <div className="flex mx-auto justify-center items-center h-screen">
      <form className="w-xl" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FieldSet>
          <FieldLegend>Авторизация</FieldLegend>
          <FieldDescription>
            Еще не зарегистрированы?{' '}
            <Link to="/auth/register">Зарегистрируйтесь здесь</Link>
          </FieldDescription>
          {errorMessage && (
            <FieldDescription className="text-red-500">
              {errorMessage}
            </FieldDescription>
          )}
          <FieldGroup className="!gap-1">
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
          </FieldGroup>
          <Button type="submit" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? 'Вход...' : 'Далее'}
          </Button>
        </FieldSet>
      </form>
    </div>
  )
}

export default Login
