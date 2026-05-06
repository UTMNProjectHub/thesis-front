import { Outlet, Link, useLocation } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function AdminLayout() {
  const location = useLocation()
  const isDashboard = location.pathname === '/admin'

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        {!isDashboard && (
          <Link to="/admin">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              На дашборд
            </Button>
          </Link>
        )}
        <h1 className="text-2xl font-bold">Админ-панель</h1>
      </div>
      <Outlet />
    </div>
  )
}