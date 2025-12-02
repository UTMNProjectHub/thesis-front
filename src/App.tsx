import { Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  BarChart3,
  Brain,
  CheckCircle2,
  Rocket,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'

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
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#00acec] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Hero Section */}
      <section className="relative py-32 px-4 text-center">
        <div
          className={`max-w-5xl mx-auto transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-blue-200 mb-8 shadow-lg">
            <Sparkles className="w-4 h-4 text-[#00acec]" />
            <span className="text-sm font-medium text-gray-700">
              Новая платформа для образования
            </span>
          </div>
          <h1 className="text-7xl md:text-8xl font-bold text-gray-900 mb-8 leading-tight">
            Добро пожаловать в{' '}
            <span className="text-logo text-transparent bg-clip-text bg-gradient-to-r from-[#00acec] via-blue-600 to-purple-600 animate-gradient">
              АССИСТЕНТУС
            </span>
          </h1>
          <p className="text-2xl md:text-3xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
            Создавайте увлекательные тесты, проверяйте знания и развивайте
            навыки. Простой инструмент для преподавателей и студентов ТюмГУ.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {!user.data ? (
              <>
                <Link to="/auth/register">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-[#00acec] to-blue-600 hover:from-blue-600 hover:to-[#00acec] text-white px-8 py-6 text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 rounded-full"
                  >
                    <Rocket className="mr-2 w-5 h-5" />
                    Начать создавать
                  </Button>
                </Link>
                <Link to="/auth/login">
                  <Button
                    variant="outline"
                    size="lg"
                    className="px-8 py-6 text-lg border-2 hover:bg-white/80 backdrop-blur-sm rounded-full transform hover:scale-105 transition-all duration-300"
                  >
                    Войти
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/generation">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-[#00acec] to-blue-600 hover:from-blue-600 hover:to-[#00acec] text-white px-8 py-6 text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 rounded-full"
                  >
                    <Rocket className="mr-2 w-5 h-5" />
                    Перейти к проектированию
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Stats */}
          {/* <div className="mt-20 grid grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-[#00acec] mb-2">1000+</div>
              <div className="text-gray-600">Активных пользователей</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#00acec] mb-2">5000+</div>
              <div className="text-gray-600">Созданных квизов</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#00acec] mb-2">98%</div>
              <div className="text-gray-600">Довольных студентов</div>
            </div>
          </div> */}
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              Почему выбирают АССИСТЕНТУС?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Мощные инструменты для современного образования
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="group relative overflow-hidden border-2 hover:border-[#00acec] transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#00acec]/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#00acec] to-blue-600 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-2xl mb-2 flex items-center gap-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    Легко
                  </Badge>
                  Создание тестов
                </CardTitle>
                <CardDescription className="text-base">
                  Интуитивный интерфейс для быстрого создания вопросов и ответов.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  Генерируйте разнообразные типы вопросов и настраивайте их под
                  свои нужды. От простых до сложных — всё в одном месте.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-xs px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
                    Множественный выбор
                  </span>
                  <span className="text-xs px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
                    Эссе
                  </span>
                  <span className="text-xs px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
                    Соответствие
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-2 hover:border-[#00acec] transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#00acec]/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-2xl mb-2 flex items-center gap-2">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                    Интерактивно
                  </Badge>
                  Прохождение тестов
                </CardTitle>
                <CardDescription className="text-base">
                  Увлекательный опыт с мгновенной обратной связью.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  Получайте результаты сразу после ответа и отслеживайте прогресс.
                  Интерактивные элементы делают обучение интересным.
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Мгновенная обратная связь</span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Визуализация прогресса</span>
                </div>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-2 hover:border-[#00acec] transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#00acec]/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-2xl mb-2 flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Аналитика
                  </Badge>
                  Статистика и отчеты
                </CardTitle>
                <CardDescription className="text-base">
                  Подробные отчеты о результатах участников.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  Анализируйте успеваемость обучающихся и улучшайте обучение на
                  основе данных. Экспортируйте результаты в различных форматах.
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Детальная аналитика
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative py-24 px-4 bg-gradient-to-r from-[#00acec] via-blue-600 to-purple-600 text-white text-center overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern [mask-image:linear-gradient(0deg,white,transparent)]"></div>
        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-6">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">Присоединяйтесь к сообществу</span>
          </div>
          <h2 className="text-5xl font-bold mb-6">Готовы начать?</h2>
          <p className="text-2xl mb-10 max-w-2xl mx-auto opacity-90">
            Присоединяйтесь к тысячам пользователей, которые уже используют АССИСТЕНТУС
            для образования и развлечений.
          </p>
          <Link to="/auth/register">
            <Button
              size="lg"
              variant="secondary"
              className="px-10 py-7 text-lg bg-white text-[#00acec] hover:bg-gray-100 shadow-2xl hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] transform hover:scale-105 transition-all duration-300 rounded-full font-semibold"
            >
              <Rocket className="mr-2 w-5 h-5" />
              Создать аккаунт бесплатно
            </Button>
          </Link>
          <div className="mt-12 flex justify-center items-center gap-8 text-sm opacity-80">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Бесплатно навсегда</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>В контуре ТюмГУ</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Начните за минуту</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default App
