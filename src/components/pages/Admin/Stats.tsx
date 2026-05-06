// статистика

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getStats } from '@/models/Admin'
import { Users, BookOpen, FolderTree, FileQuestion, FileText, TrendingUp, Calendar, Activity } from 'lucide-react'

interface Stats {
  users: number
  subjects: number
  themes: number
  quizes: number
  summaries: number
  recentActivity?: Array<{
    id: string
    type: string
    createdAt: string
    user: { email: string }
  }>
}

export default function AdminStats() {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ['admin', 'stats'],
    queryFn: () => getStats(),
  })

  const statCards = [
    {
      title: 'Пользователи',
      value: stats?.users || 0,
      icon: Users,
      color: 'bg-blue-500',
      trend: '+12%',
    },
    {
      title: 'Предметы',
      value: stats?.subjects || 0,
      icon: BookOpen,
      color: 'bg-green-500',
      trend: '+5%',
    },
    {
      title: 'Темы',
      value: stats?.themes || 0,
      icon: FolderTree,
      color: 'bg-purple-500',
      trend: '+8%',
    },
    {
      title: 'Тесты',
      value: stats?.quizes || 0,
      icon: FileQuestion,
      color: 'bg-orange-500',
      trend: '+15%',
    },
    {
      title: 'Конспекты',
      value: stats?.summaries || 0,
      icon: FileText,
      color: 'bg-teal-500',
      trend: '+10%',
    },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Загрузка статистики...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Статистика системы</h1>
        <p className="text-muted-foreground mt-1">Аналитика использования платформы</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${card.color} bg-opacity-10`}>
                  <Icon className={`h-4 w-4 ${card.color.replace('bg-', 'text-')}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <CardDescription className="text-xs flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  {card.trend} за месяц
                </CardDescription>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Активность по дням
            </CardTitle>
            <CardDescription>График активности пользователей</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              График в разработке
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Недавняя активность
            </CardTitle>
            <CardDescription>Последние действия в системе</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentActivity?.length ? (
                stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="text-sm font-medium">{activity.type}</p>
                      <p className="text-xs text-muted-foreground">{activity.user?.email}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.createdAt).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">Нет данных об активности</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}