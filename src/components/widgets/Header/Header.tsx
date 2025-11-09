import { Link } from '@tanstack/react-router'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLogout, useUser } from '@/hooks/useAuth'
import { fullNameToInitials, fullNameToLetters } from '@/lib/utils'

export default function Header() {
  const userData = useUser()
  const logout = useLogout()

  return (
    <>
      <header className="p-4 h-[8vh] flex justify-between items-center bg-[#00acec] text-white shadow-lg">
        <h1 className="text-logo">
          <Link to="/">КВИЗИ</Link>
        </h1>
        {userData.data ? (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className="flex flex-row items-center gap-2">
                <h2>{fullNameToInitials(userData.data.full_name)}</h2>
                <Avatar>
                  <AvatarFallback>
                    {fullNameToLetters(userData.data.full_name)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <Link to="/profile">
                <DropdownMenuItem>Профиль</DropdownMenuItem>
              </Link>
              <DropdownMenuItem
                onClick={() => {
                  logout.mutate()
                }}
              >
                Выйти
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link to="/auth/login">Войти</Link>
        )}
      </header>
    </>
  )
}
