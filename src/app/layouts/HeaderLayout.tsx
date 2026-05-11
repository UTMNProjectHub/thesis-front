import { Outlet } from '@tanstack/react-router'
import Header from '@/widgets/header/Header'
import { UserSocketProvider } from '@/app/providers/UserSocketProvider'

export function HeaderLayout() {
  return (
    <UserSocketProvider>
      <div className="flex flex-col h-screen">
        <Header />
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </UserSocketProvider>
  )
}
