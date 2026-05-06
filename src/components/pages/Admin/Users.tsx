// управление пользователями
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getUsers, updateUserRole, deleteUser, getRoles } from '@/models/Admin'
import { Search, Trash2 } from 'lucide-react'

interface User {
  id: string
  email: string
  full_name: string | null
  usersToRoles: Array<{
    role: {
      id: number
      slug: string
      title: string
    }
  }>
}

interface Role {
  id: number
  title: string
  slug: string
}

export default function AdminUsers() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['admin', 'users'],
    queryFn: () => getUsers(),
  })

  const { data: roles } = useQuery<Role[]>({
    queryKey: ['roles'],
    queryFn: () => getRoles(),
  })

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: number }) =>
      updateUserRole({ userId, roleId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      setDeleteDialogOpen(false)
      setUserToDelete(null)
    },
    onError: (error) => {
      console.error('Ошибка удаления:', error)
      alert('Не удалось удалить пользователя')
    },
  })

  const getRoleColor = (slug: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-red-100 text-red-800',
      teacher: 'bg-blue-100 text-blue-800',
      student: 'bg-green-100 text-green-800',
    }
    return colors[slug] || 'bg-gray-100 text-gray-800'
  }

  const getRoleName = (slug: string) => {
    const names: Record<string, string> = {
      admin: 'Администратор',
      teacher: 'Преподаватель',
      student: 'Студент',
    }
    return names[slug] || slug
  }

  const filteredUsers = users?.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    const userRoleSlug = user.usersToRoles[0]?.role?.slug || 'student'
    const matchesRole = selectedRole === 'all' || userRoleSlug === selectedRole
    return matchesSearch && matchesRole
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Загрузка пользователей...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Управление пользователями</h1>
        <p className="text-muted-foreground">Просмотр, редактирование и удаление пользователей</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по email или имени..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedRole} onValueChange={setSelectedRole}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Все роли" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все роли</SelectItem>
            <SelectItem value="admin">Администраторы</SelectItem>
            <SelectItem value="teacher">Преподаватели</SelectItem>
            <SelectItem value="student">Студенты</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Имя</TableHead>
              <TableHead>Роль</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers?.map((user) => {
              const userRole = user.usersToRoles[0]?.role
              return (
                <TableRow key={user.id}>
                  <TableCell className="font-mono text-xs">{user.id.slice(0, 8)}...</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.full_name || '-'}</TableCell>
                  <TableCell>
                    {userRole && (
                      <Badge className={getRoleColor(userRole.slug)}>
                        {getRoleName(userRole.slug)}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {roles && (
                      <Select
                        defaultValue={String(userRole?.id)}
                        onValueChange={(value) =>
                          updateRoleMutation.mutate({ userId: user.id, roleId: Number(value) })
                        }
                      >
                        <SelectTrigger className="w-[140px] inline-flex">
                          <SelectValue placeholder="Изменить роль" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={String(role.id)}>
                              {role.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setUserToDelete(user)
                        setDeleteDialogOpen(true)
                      }}
                      disabled={userRole?.slug === 'admin'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {filteredUsers?.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Пользователи не найдены
        </div>
      )}

      {/* Диалог подтверждения удаления */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтверждение удаления</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить пользователя{' '}
              <span className="font-medium">{userToDelete?.email}</span>? Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (userToDelete) {
                  deleteUserMutation.mutate(userToDelete.id)
                }
              }}
            >
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}