import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Users, BookOpen, FolderTree, FileQuestion, FileText, TrendingUp } from 'lucide-react'
import { getStats, getDetailedStats } from '@/models/Admin'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => getStats(),
  })

  const { data: detailedStats, isLoading: detailedLoading } = useQuery({
    queryKey: ['admin', 'detailedStats'],
    queryFn: () => getDetailedStats(),
  })

  const isLoading = statsLoading || detailedLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Загрузка статистики...</div>
      </div>
    )
  }

  const { activityByDay = [], contentDistribution = [], userGrowth = [] } = detailedStats || {}

  const statCards = [
    { title: 'Пользователи', value: stats?.users || 0, icon: Users, color: 'bg-blue-500', description: 'Зарегистрированных пользователей' },
    { title: 'Предметы', value: stats?.subjects || 0, icon: BookOpen, color: 'bg-green-500', description: 'Всего предметов' },
    { title: 'Темы', value: stats?.themes || 0, icon: FolderTree, color: 'bg-purple-500', description: 'Всего тем' },
    { title: 'Тесты', value: stats?.quizes || 0, icon: FileQuestion, color: 'bg-orange-500', description: 'Создано тестов' },
    { title: 'Конспекты', value: stats?.summaries || 0, icon: FileText, color: 'bg-teal-500', description: 'Создано конспектов' },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Панель администратора</h1>
        <p className="text-muted-foreground mt-1">Управление системой и просмотр статистики</p>
      </div>

      {/* Карточки */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                <div className={`p-2 rounded-full ${card.color} bg-opacity-10`}>
                  <Icon className={`h-4 w-4 ${card.color.replace('bg-', 'text-')}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <CardDescription className="text-xs">{card.description}</CardDescription>
              </CardContent>
            </Card>
          )
        })}
      </div>



      {/* Быстрые действия */}
      <Card>
        <CardHeader>
          <CardTitle>Быстрые действия</CardTitle>
          <CardDescription>Часто используемые операции</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <a href="/admin/users" className="block p-2 hover:bg-muted rounded-md transition-colors">→ Управление пользователями</a>
          <a href="/admin/subjects" className="block p-2 hover:bg-muted rounded-md transition-colors">→ Управление предметами</a>
          <a href="/admin/themes" className="block p-2 hover:bg-muted rounded-md transition-colors">→ Управление темами</a>
          <a href="/admin/quizes" className="block p-2 hover:bg-muted rounded-md transition-colors">→ Все тесты</a>
          <a href="/admin/summaries" className="block p-2 hover:bg-muted rounded-md transition-colors">→ Все конспекты</a>
        </CardContent>
      </Card>
    </div>
  )
}