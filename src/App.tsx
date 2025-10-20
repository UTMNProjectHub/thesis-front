import { Link } from '@tanstack/react-router'

import { useUser } from './hooks/useAuth'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

function App() {
  const user = useUser()

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="py-20 px-4 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Добро пожаловать в{' '}
          <span className="text-logo text-[#00acec]">КВИЗИ</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Создавайте увлекательные квизы, тестируйте знания и развивайте навыки.
          Простой инструмент для преподавателей и студентов ТюмГУ.
        </p>
        <div className="flex gap-4 justify-center">
          {!user.data ? (
            <>
              <Link to="/auth/register">
                <Button size="lg" className="bg-[#00acec] hover:bg-[#0099cc]">
                  Начать создавать
                </Button>
              </Link>
              <Link to="/auth/login">
                <Button variant="outline" size="lg">
                  Войти
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/generation">
                <Button size="lg" className="bg-[#00acec] hover:bg-[#0099cc]">
                  Перейти к проектированию
                </Button>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Почему выбирают КВИЗИ?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="secondary">Легко</Badge>
                  Создание квизов
                </CardTitle>
                <CardDescription>
                  Интуитивный интерфейс для быстрого создания вопросов и
                  ответов.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Генерируйте разнообразные типы вопросов и настраивайте их под
                  свои нужды.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="secondary">Интерактивно</Badge>
                  Прохождение тестов
                </CardTitle>
                <CardDescription>
                  Увлекательный опыт с мгновенной обратной связью.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Получайте результаты сразу после ответа и отслеживайте
                  прогресс.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="secondary">Аналитика</Badge>
                  Статистика и отчеты
                </CardTitle>
                <CardDescription>
                  Подробные отчеты о результатах участников.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Анализируйте успеваемость и улучшайте свои квизы на основе
                  данных.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-[#00acec] text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Готовы начать?</h2>
        <p className="text-xl mb-8 max-w-xl mx-auto">
          Присоединяйтесь к тысячам пользователей, которые уже используют КВИЗИ
          для образования и развлечений.
        </p>
        <Link to="/auth/register">
          <Button size="lg" variant="secondary">
            Создать аккаунт бесплатно
          </Button>
        </Link>
      </section>
    </div>
  )
}

export default App
