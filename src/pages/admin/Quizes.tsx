import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Badge } from '@/shared/ui/badge'
import { getAllQuizes, type Quiz } from '@/models/Admin'
import { Search, Eye, FileText, Calendar, Users } from 'lucide-react'

export default function Quizes() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  
  const { data: quizes, isLoading } = useQuery<Quiz[]>({
    queryKey: ['admin', 'quizes'],
    queryFn: () => getAllQuizes(),
  })

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      test: 'bg-blue-100 text-blue-800',
      exam: 'bg-purple-100 text-purple-800',
      practice: 'bg-green-100 text-green-800',
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const filteredQuizes = quizes?.filter(quiz =>
    quiz.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    quiz.theme?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    quiz.theme?.subject?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Загрузка тестов...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Все тесты</h1>
        <p className="text-muted-foreground">Просмотр всех сгенерированных тестов в системе</p>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по названию, теме или предмету..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Всего: {filteredQuizes?.length || 0} тестов
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Список тестов</CardTitle>
          <CardDescription>Все тесты, созданные в системе</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>Тема</TableHead>
                <TableHead>Предмет</TableHead>
                <TableHead>Вопросов</TableHead>
                <TableHead>Попытки</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuizes?.map((quiz) => (
                <TableRow key={quiz.id}>
                  <TableCell className="font-medium">
                    {quiz.name}
                  </TableCell>
                  <TableCell>
                    <Badge className={getTypeBadge(quiz.type)}>
                      {quiz.type === 'test' && 'Тест'}
                      {quiz.type === 'exam' && 'Экзамен'}
                      {quiz.type === 'practice' && 'Практика'}
                      {!['test', 'exam', 'practice'].includes(quiz.type) && quiz.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {quiz.theme?.name || '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {quiz.theme?.subject?.name || quiz.theme?.subject?.shortName || '—'}
                  </TableCell>
                  <TableCell>
                    {quiz.quizesQuestions?.length || 0}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span className="text-sm">{quiz.usersQuizes?.length || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate({ to: `/quiz/${quiz.id}` })}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Просмотр
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredQuizes?.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Тесты не найдены</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Дополнительная статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Всего тестов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quizes?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Среднее кол-во вопросов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {quizes && quizes.length > 0 
                ? Math.round(quizes.reduce((acc, q) => acc + (q.quizesQuestions?.length || 0), 0) / quizes.length)
                : 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Всего прохождений</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {quizes?.reduce((acc, q) => acc + (q.usersQuizes?.length || 0), 0) || 0}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}