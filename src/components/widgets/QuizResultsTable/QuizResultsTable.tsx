import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  useQuizUsersSessions,
  useQuizQuestions,
  useSessionSubmits,
} from '@/hooks/useQuiz'
import type { QuizUserSession, QuizUserSessionItem } from '@/types/quiz'
import {
  useReactTable,
  createColumnHelper,
  getCoreRowModel,
  flexRender,
  getExpandedRowModel,
} from '@tanstack/react-table'
import { Eye, Ellipsis } from 'lucide-react'
import { useMemo, useState } from 'react'
import { SessionStats } from '@/components/widgets/QuizSessionStats/SessionStats'
import QuizResultView from '@/components/widgets/QuizResultView/QuizResultView'

type QuizResultsRow = QuizUserSession | QuizUserSessionItem

function isUserSession(row: QuizResultsRow): row is QuizUserSession {
  return 'sessions' in row
}

interface QuizResultsTableProps {
  quizId: string
}

function QuizResultsTable({ quizId }: QuizResultsTableProps) {
  const { data: usersSessions } = useQuizUsersSessions(quizId || '')
  const [selectedSession, setSelectedSession] =
    useState<QuizUserSessionItem | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  const { data: sessionSubmits, isLoading: sessionSubmitsLoading } =
    useSessionSubmits(quizId || '', selectedSession?.id || '')
  const { data: quizQuestions, isLoading: questionsLoading } = useQuizQuestions(
    quizId || '',
    selectedSession?.id || '',
    true,
  )

  const handleViewSession = (session: QuizUserSessionItem, userId: string) => {
    setSelectedSession(session)
    setSelectedUserId(userId)
  }

  const handleCloseDialog = () => {
    setSelectedSession(null)
    setSelectedUserId(null)
  }

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<QuizResultsRow>()
    return [
      columnHelper.accessor(
        (row) => (isUserSession(row) ? row.fullName : row.id),
        {
          id: 'fullName',
          header: 'Имя',
        },
      ),
      columnHelper.accessor((row) => (isUserSession(row) ? row.email : '—'), {
        id: 'email',
        header: 'Email',
      }),
      columnHelper.accessor(
        (row) => (isUserSession(row) ? row.sessions.length : '—'),
        {
          id: 'sessionsCount',
          header: 'Сессий',
        },
      ),
      columnHelper.display({
        id: 'sessionResult',
        header: 'Результаты',
        cell: (props) => {
          const canExpand = props.row.getCanExpand()
          const data = props.row.original
          if (isUserSession(data)) return <Button
          variant={'outline'}
          onClick={props.row.getToggleExpandedHandler()}
        >
          <Ellipsis />
        </Button>
          const parent = props.row.getParentRow()
          const parentData = parent?.original
          const userId =
            parentData && isUserSession(parentData) ? parentData.userId : null
          return (
            <div className="flex items-center gap-2">
              <SessionStats
                solvedPercent={data.percentSolved}
                rightPercent={data.percentRight}
                compact
              />
              {userId && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewSession(data, userId)}
                >
                  <Eye className="size-4 mr-2" />
                  Просмотр
                </Button>
              )}
            </div>
          )
        },
      }),
    ]
  }, [])

  const table = useReactTable<QuizResultsRow>({
    columns,
    data: usersSessions ?? [],
    getSubRows: (row) => (isUserSession(row) ? row.sessions : undefined),
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  })

  return (
    <div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Нет сессий.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog
        open={!!selectedSession}
        onOpenChange={(open) => !open && handleCloseDialog()}
      >
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Результаты сессии
              {selectedSession?.timeStart
                ? ` — ${new Date(selectedSession.timeStart).toLocaleString('ru-RU')}`
                : ''}
            </DialogTitle>
          </DialogHeader>
          {sessionSubmitsLoading || questionsLoading ? (
            <div className="flex justify-center items-center py-8 text-muted-foreground">
              Загрузка результатов...
            </div>
          ) : selectedSession && quizQuestions && sessionSubmits ? (
            <QuizResultView
              session={{
                id: selectedSession.id,
                quizId: quizId || '',
                userId: selectedUserId || '',
                timeStart: selectedSession.timeStart,
                timeEnd: selectedSession.timeEnd,
              }}
              quizQuestions={quizQuestions}
              sessionSubmits={sessionSubmits}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Нет данных для отображения
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default QuizResultsTable
