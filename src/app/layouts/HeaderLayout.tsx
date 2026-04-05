import { Outlet } from '@tanstack/react-router'
import Header from '@/widgets/header/Header'

export function HeaderLayout() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  )
}
