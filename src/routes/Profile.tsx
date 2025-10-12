import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Cog, IdCard } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import {
  useChangePassword,
  useProfile,
  useUpdateProfile,
} from '@/hooks/useProfile'

// Схемы валидации
const updateProfileSchema = z.object({
  email: z.string().email({ message: 'Введите корректную почту' }),
  full_name: z.string().min(3, { message: 'Минимум 3 символа' }),
})

const changePasswordSchema = z.object({
  password: z.string().min(1, { message: 'Текущий пароль обязателен' }),
  new_password: z
    .string()
    .min(8, { message: 'Минимум 8 символов' })
    .regex(/[0-9]/, { message: 'Требуется хотя бы одна цифра' })
    .regex(/[A-ZА-ЯЁ]/, { message: 'Требуется хотя бы одна заглавная буква' })
    .regex(/[a-zа-яё]/, { message: 'Требуется хотя бы одна строчная буква' })
    .regex(/[#?!@$%^&*\- ]/, {
      message: 'Требуется хотя бы один специальный символ',
    }),
})

type UpdateProfileForm = z.infer<typeof updateProfileSchema>
type ChangePasswordForm = z.infer<typeof changePasswordSchema>

const tabs = [
  {
    name: 'Информация',
    value: 'info',
    content: InfoTab,
    icon: IdCard,
  },
  {
    name: 'Изменить настройки аккаунта',
    value: 'settings',
    content: SettingsTab,
    icon: Cog,
  },
]

function InfoTab() {
  const { data: profile, isLoading } = useProfile()

  if (isLoading) {
    return <div>Загрузка профиля...</div>
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl">
        Добро пожаловать, {profile?.full_name.split(' ')[1]}
      </h2>
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Информация о профиле</h2>
        <div className="space-y-3">
          <div>
            <strong>ID:</strong> {profile?.id}
          </div>
          <div>
            <strong>Email:</strong> {profile?.email}
          </div>
          <div>
            <strong>Полное имя:</strong> {profile?.full_name}
          </div>
          <div>
            <strong>Дата создания:</strong>{' '}
            {profile?.date_created || 'Не указана'}
          </div>
          {profile?.avatar_url && (
            <div>
              <strong>Аватар:</strong>
              <img
                src={profile.avatar_url}
                alt="Аватар"
                className="w-16 h-16 rounded-full mt-2"
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

function SettingsTab() {
  const { data: profile } = useProfile()
  const updateProfileMutation = useUpdateProfile()
  const changePasswordMutation = useChangePassword()

  // Форма обновления профиля
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<UpdateProfileForm>({
    resolver: zodResolver(updateProfileSchema),
    mode: 'onBlur',
    defaultValues: {
      email: profile?.email || '',
      full_name: profile?.full_name || '',
    },
  })

  // Форма смены пароля
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onBlur',
  })

  function onProfileSubmit(values: UpdateProfileForm) {
    updateProfileMutation.mutate(values)
  }

  function onPasswordSubmit(values: ChangePasswordForm) {
    changePasswordMutation.mutate(values, {
      onSuccess: () => {
        resetPassword()
      },
    })
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl">Настройки аккаунта</h2>
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Обновить профиль</h2>
        <form onSubmit={handleProfileSubmit(onProfileSubmit)} noValidate>
          <FieldSet>
            {updateProfileMutation.error && (
              <FieldDescription className="text-red-500">
                {(updateProfileMutation.error as any)?.response?.data
                  ?.message || 'Ошибка обновления профиля'}
              </FieldDescription>
            )}
            {updateProfileMutation.isSuccess && (
              <FieldDescription className="text-green-500">
                Профиль успешно обновлен!
              </FieldDescription>
            )}
            <FieldGroup className="!gap-1">
              <Field>
                <FieldLabel>Электропочта</FieldLabel>
                <Input
                  type="email"
                  placeholder="example@utmn.ru"
                  {...registerProfile('email')}
                />
                <FieldDescription className="text-red-500">
                  {profileErrors.email?.message}
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel>Полное имя</FieldLabel>
                <Input
                  placeholder="Иванов Иван Иванович"
                  {...registerProfile('full_name')}
                />
                <FieldDescription className="text-red-500">
                  {profileErrors.full_name?.message}
                </FieldDescription>
              </Field>
            </FieldGroup>
            <Button type="submit" disabled={updateProfileMutation.isPending}>
              {updateProfileMutation.isPending
                ? 'Обновление...'
                : 'Обновить профиль'}
            </Button>
          </FieldSet>
        </form>
      </Card>

      {/* Форма смены пароля */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Сменить пароль</h2>
        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} noValidate>
          <FieldSet>
            {changePasswordMutation.error && (
              <FieldDescription className="text-red-500">
                {(changePasswordMutation.error as any)?.response?.data
                  ?.message || 'Ошибка смены пароля'}
              </FieldDescription>
            )}
            {changePasswordMutation.isSuccess && (
              <FieldDescription className="text-green-500">
                Пароль успешно изменен!
              </FieldDescription>
            )}
            <FieldGroup className="!gap-1">
              <Field>
                <FieldLabel>Текущий пароль</FieldLabel>
                <Input
                  type="password"
                  placeholder="********"
                  {...registerPassword('password')}
                />
                <FieldDescription className="text-red-500">
                  {passwordErrors.password?.message}
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel>Новый пароль</FieldLabel>
                <FieldDescription>
                  Минимум 8 символов, одна цифра, одна заглавная буква, одна
                  строчная буква и один специальный символ
                </FieldDescription>
                <Input
                  type="password"
                  placeholder="********"
                  {...registerPassword('new_password')}
                />
                <FieldDescription className="text-red-500">
                  {passwordErrors.new_password?.message}
                </FieldDescription>
              </Field>
            </FieldGroup>
            <Button type="submit" disabled={changePasswordMutation.isPending}>
              {changePasswordMutation.isPending
                ? 'Смена пароля...'
                : 'Сменить пароль'}
            </Button>
          </FieldSet>
        </form>
      </Card>
    </div>
  )
}

function Profile() {
  const { isLoading, isAuthenticated } = useAuth()

  if (isLoading) {
    return <div>Загрузка...</div>
  }

  if (!isAuthenticated) {
    return <div>Пожалуйста, войдите в систему</div>
  }

  return (
    <div className="flex h-screen w-full justify-center overflow-auto py-6">
      <TooltipProvider>
        <Tabs defaultValue="info" className="flex flex-row w-3xl">
          <TabsList className="flex-col py-8">
            {tabs.map(({ icon: Icon, name, value }) => (
              <Tooltip key={value}>
                <TooltipTrigger asChild>
                  <span>
                    <TabsTrigger
                      value={value}
                      className="flex w-full flex-col items-center gap-1"
                      aria-label="tab-trigger"
                    >
                      <Icon />
                    </TabsTrigger>
                  </span>
                </TooltipTrigger>
                <TooltipContent className="px-2 py-1 text-xs" side="left">
                  {name}
                </TooltipContent>
              </Tooltip>
            ))}
          </TabsList>
          {tabs.map((tab) => {
            const TabContent = tab.content
            return (
              <TabsContent key={tab.value} value={tab.value} className="ml-6">
                <div className="min-h-[100px] flex items-start">
                  <div className="w-full text-muted-foreground text-sm">
                    <TabContent />
                  </div>
                </div>
              </TabsContent>
            )
          })}
        </Tabs>
      </TooltipProvider>
    </div>
  )
}

export default Profile
