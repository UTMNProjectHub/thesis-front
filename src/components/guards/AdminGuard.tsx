import { Navigate, Outlet } from '@tanstack/react-router'
import { useAuth } from '@/hooks/useAuth'

export function AdminGuard() {
  const { user, isLoading } = useAuth()
  
  // Проверяем, есть ли у пользователя роль admin
  const isAdmin = user?.roles?.some(role => role.slug === 'admin')

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Загрузка...</div>
  }

  if (!isAdmin) {
    // Если не админ - редирект на главную
    return <Navigate to="/" replace />
  }

  // Если админ - показываем дочерние компоненты
  return <Outlet />
}