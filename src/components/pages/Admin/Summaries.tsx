import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getAllSummaries, type Summary } from '@/models/Admin'
import { Search, FileText, Download, ExternalLink } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'

export default function AdminSummaries() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  
  const { data: summaries, isLoading } = useQuery<Summary[]>({
    queryKey: ['admin', 'summaries'],
    queryFn: () => getAllSummaries(),
  })

  const filteredSummaries = summaries?.filter(summary =>
    summary.file?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    summary.theme?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    summary.subject?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    summary.subject?.shortName?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Загрузка конспектов...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Все конспекты</h1>
        <p className="text-muted-foreground">Просмотр всех сгенерированных конспектов в системе</p>
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
          Всего: {filteredSummaries?.length || 0} конспектов
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Список конспектов</CardTitle>
          <CardDescription>Все конспекты, созданные в системе</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название файла</TableHead>
                <TableHead>Тема</TableHead>
                <TableHead>Предмет</TableHead>
                <TableHead>ID</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSummaries?.map((summary) => (
                <TableRow key={summary.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate max-w-[200px]">{summary.file?.name || '—'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {summary.theme?.name || '—'}
                  </TableCell>
                  <TableCell>
                    {summary.subject?.name || summary.subject?.shortName || '—'}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {summary.id}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate({ to: `/summary/${summary.id}` })}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Открыть
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Скачать файл
                          const link = document.createElement('a')
                          link.href = `/api/file/download/${summary.fileId}`
                          link.click()
                        }}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Скачать
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredSummaries?.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Конспекты не найдены</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Дополнительная статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Всего конспектов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaries?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">По предметам</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {summaries && (
                Object.entries(
                  summaries.reduce((acc, s) => {
                    const name = s.subject?.shortName || s.subject?.name || 'Без предмета'
                    acc[name] = (acc[name] || 0) + 1
                    return acc
                  }, {} as Record<string, number>)
                ).slice(0, 5).map(([name, count]) => (
                  <div key={name} className="flex justify-between text-sm">
                    <span>{name}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">По темам</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {summaries && (
                Object.entries(
                  summaries.reduce((acc, s) => {
                    const name = s.theme?.name || 'Без темы'
                    acc[name] = (acc[name] || 0) + 1
                    return acc
                  }, {} as Record<string, number>)
                ).slice(0, 5).map(([name, count]) => (
                  <div key={name} className="flex justify-between text-sm">
                    <span className="truncate max-w-[150px]">{name}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}