import { useParams, Link } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useQuiz } from '@/hooks/useQuiz'
import { Button } from '@/components/ui/button'
import { QrCodeIcon } from 'lucide-react'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import QRCodeDialog from '@/components/dummies/QRCodeDialog'

function Quiz() {
  const { id } = useParams({ strict: false })
  const { data: quiz, isLoading, error } = useQuiz(id || '')

  if (isLoading) {
    return (
      <div className="flex h-screen w-full justify-center items-center">
        <div className="text-muted-foreground">Загрузка квиза...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen w-full justify-center items-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-500">Ошибка</CardTitle>
            <CardDescription>
              Не удалось загрузить информацию о квизе
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="flex h-screen w-full justify-center items-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Квиз не найден</CardTitle>
            <CardDescription>
              Квиз с указанным идентификатором не существует
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full justify-center overflow-auto py-6">
      <div className="w-full max-w-4xl px-4">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">{quiz.name}</CardTitle>
                <CardDescription className="text-base">
                  {quiz.description}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="ml-4">
                {quiz.type}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <strong className="text-muted-foreground">Количество вопросов: </strong>
                <p className="font-mono text-sm mt-1">{quiz.questionCount}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className='w-full flex items-center gap-2 justify-end'>
              <Dialog>
                <DialogTrigger>
                  <Button variant="outline">
                    <QrCodeIcon />
                  </Button>
                </DialogTrigger>
                <QRCodeDialog qrValue={window.location.href} />
              </Dialog>
              <Link to="/quiz/$id/questions" params={{ id: id || '' }}>
                <Button>Перейти к тестированию ➡️</Button>
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default Quiz

