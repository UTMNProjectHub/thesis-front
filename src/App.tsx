import { Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  CheckCircle2,
  GraduationCap,
  FileText,
  HelpCircle,
  Plus,
  Rocket,
  Sparkles,
  Zap,
} from 'lucide-react'

import { useUser } from './hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import DummyGenerationQuizDialog from '@/components/dummies/DummyGenerationQuizDialog'
import DummyGenerationFileSelector from '@/components/dummies/DummyGenerationFileSelector'

function App() {
  const user = useUser()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="min-h-screen bg-white relative">

      <section className="relative px-4 pt-24 pb-32 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, #00acec 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="absolute top-20 right-[15%] w-64 h-64 rounded-full bg-[#00acec]/5 blur-3xl" />
        <div className="absolute bottom-10 left-[10%] w-48 h-48 rounded-full bg-purple-500/5 blur-3xl" />

        <div className="max-w-6xl mx-auto relative">
          <div
            className={`transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="flex justify-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#00acec]/20 bg-[#00acec]/5 text-[#00acec] text-sm font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                Платформа нового поколения
              </div>
            </div>

            <h1 className="text-center mb-8">
              <span className="block text-5xl md:text-7xl font-bold text-gray-900 leading-tight tracking-tight">
                Обучение, которое
              </span>
              <span className="block text-5xl md:text-7xl font-bold leading-tight tracking-tight mt-2">
                <span className="text-logo text-transparent bg-clip-text bg-gradient-to-r from-[#00acec] to-blue-600">
                  работает
                </span>
              </span>
            </h1>

            <p className="text-center text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-14 leading-relaxed">
              Генерируйте тесты, FAQ и конспекты по любой теме
              с помощью ИИ — всё в одном месте.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {!user.data ? (
                <>
                  <Link to="/auth/register">
                    <Button
                      size="lg"
                      className="bg-[#00acec] hover:bg-[#0095d0] text-white px-8 py-6 text-base shadow-lg shadow-[#00acec]/25 hover:shadow-xl hover:shadow-[#00acec]/30 transition-all duration-300 rounded-xl gap-2"
                    >
                      Начать бесплатно
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link to="/auth/login">
                    <Button
                      variant="outline"
                      size="lg"
                      className="px-8 py-6 text-base border-gray-200 hover:border-[#00acec]/40 hover:bg-[#00acec]/5 rounded-xl transition-all duration-300"
                    >
                      Войти в аккаунт
                    </Button>
                  </Link>
                </>
              ) : (
                <Link to="/generation">
                  <Button
                    size="lg"
                    className="bg-[#00acec] hover:bg-[#0095d0] text-white px-8 py-6 text-base shadow-lg shadow-[#00acec]/25 hover:shadow-xl hover:shadow-[#00acec]/30 transition-all duration-300 rounded-xl gap-2"
                  >
                    Перейти к проектированию
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
          
          <div
            className={`mt-20 transition-all duration-1000 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            <div className="max-w-4xl mx-auto">
              <div className="relative bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-3xl border border-gray-100 p-8 md:p-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4">
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-[#00acec]/10 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-[#00acec]" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#00acec] uppercase tracking-wider mb-1">Шаг 1</div>
                      <div className="font-semibold text-gray-900">Загрузите материал</div>
                      <div className="text-sm text-gray-500 mt-1">Текст, документ или тема</div>
                    </div>
                  </div>

                  <div className="hidden md:flex items-center justify-center relative">
                    <div className="absolute inset-x-0 top-7 border-t-2 border-dashed border-[#00acec]/20" />
                    <div className="relative flex flex-col items-center text-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                        <Brain className="w-6 h-6 text-purple-500" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-purple-500 uppercase tracking-wider mb-1">Шаг 2</div>
                        <div className="font-semibold text-gray-900">ИИ генерирует контент</div>
                        <div className="text-sm text-gray-500 mt-1">Тесты, FAQ и конспекты</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex md:hidden flex-col items-center text-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                      <Brain className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-purple-500 uppercase tracking-wider mb-1">Шаг 2</div>
                      <div className="font-semibold text-gray-900">ИИ генерирует контент</div>
                      <div className="text-sm text-gray-500 mt-1">Тесты, FAQ и конспекты</div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-emerald-500 uppercase tracking-wider mb-1">Шаг 3</div>
                      <div className="font-semibold text-gray-900">Используйте результат</div>
                      <div className="text-sm text-gray-500 mt-1">Тестируйте студентов и анализируйте результаты</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-slate-50/70">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-[#00acec]/10 text-[#00acec] hover:bg-[#00acec]/10 border-0 text-sm px-3 py-1">
              Возможности
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
              Всё для эффективного обучения
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:row-span-2 group relative rounded-3xl border border-gray-100 bg-white p-8 md:p-10 hover:border-[#00acec]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#00acec]/5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00acec] to-blue-600 flex items-center justify-center mb-6 shadow-md">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Генерация с помощью ИИ
              </h3>
              <p className="text-gray-500 leading-relaxed mb-6">
                Загрузите учебный материал — и получите готовый тест за секунды.
                Поддержка разных типов вопросов: от множественного выбора
                до развёрнутых ответов и заданий на соответствие.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs font-medium px-3 py-1.5 bg-[#00acec]/5 text-[#00acec] rounded-lg">
                  Множественный выбор
                </span>
                <span className="text-xs font-medium px-3 py-1.5 bg-[#00acec]/5 text-[#00acec] rounded-lg">
                  Открытые вопросы
                </span>
                <span className="text-xs font-medium px-3 py-1.5 bg-[#00acec]/5 text-[#00acec] rounded-lg">
                  Соответствие
                </span>
                <span className="text-xs font-medium px-3 py-1.5 bg-[#00acec]/5 text-[#00acec] rounded-lg">
                  Эссе
                </span>
              </div>
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-[#00acec]/5 to-transparent rounded-tl-[6rem] rounded-br-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            <div className="group rounded-3xl border border-gray-100 bg-white p-8 hover:border-purple-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/5">
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0 shadow-md">
                  <HelpCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Генерация FAQ
                  </h3>
                  <p className="text-gray-500 leading-relaxed">
                    ИИ анализирует тему и формирует список частых вопросов
                    с развёрнутыми ответами для подготовки студентов.
                  </p>
                  <div className="mt-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                      Вопросы по ключевым темам
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                      Готовые ответы для самопроверки
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3 — Summaries */}
            <div className="group rounded-3xl border border-gray-100 bg-white p-8 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5">
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shrink-0 shadow-md">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Конспекты по темам
                  </h3>
                  <p className="text-gray-500 leading-relaxed">
                    Получайте структурированные конспекты по указанным темам.
                    Удобный формат для быстрого повторения материала.
                  </p>
                  <div className="mt-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      Краткие выжимки из материала
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      Структурированные конспекты
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-500/10 text-purple-500 hover:bg-purple-500/10 border-0 text-sm px-3 py-1">
              Демонстрация
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
              Попробуйте прямо сейчас
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto mt-4">
              Посмотрите, как выглядит процесс выбора файлов и настройки генерации теста
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="rounded-3xl border border-gray-100 bg-white p-6 md:p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Выбор файлов</h3>
              <DummyGenerationFileSelector />
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-6 md:p-8 flex flex-col items-center justify-center gap-6">
              <h3 className="text-lg font-semibold text-gray-900">Создание теста</h3>
              <DummyGenerationQuizDialog>
                <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed flex items-center justify-center min-h-[200px] w-full">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Plus className="h-12 w-12" />
                    <span className="text-sm font-medium">Создать новый тест</span>
                  </div>
                </Card>
              </DummyGenerationQuizDialog>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-[#00acec]/10 flex items-center justify-center mx-auto mb-3">
                <GraduationCap className="w-6 h-6 text-[#00acec]" />
              </div>
              <div className="text-sm font-medium text-gray-900">ТюмГУ</div>
              <div className="text-xs text-gray-400 mt-0.5">В контуре университета</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mx-auto mb-3">
                <Brain className="w-6 h-6 text-purple-500" />
              </div>
              <div className="text-sm font-medium text-gray-900">ИИ-движок</div>
              <div className="text-xs text-gray-400 mt-0.5">Тесты, FAQ и конспекты</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-emerald-500" />
              </div>
              <div className="text-sm font-medium text-gray-900">Мгновенно</div>
              <div className="text-xs text-gray-400 mt-0.5">Тест за несколько минут</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
                <Rocket className="w-6 h-6 text-amber-500" />
              </div>
              <div className="text-sm font-medium text-gray-900">Бесплатно</div>
              <div className="text-xs text-gray-400 mt-0.5">Без ограничений</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl bg-gray-900 text-white p-12 md:p-16 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#00acec]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

            <div className="relative text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                Готовы попробовать?
              </h2>
              <p className="text-lg text-gray-400 max-w-xl mx-auto mb-10">
                Сгенерируйте тест, FAQ или конспекты по любой теме прямо сейчас.
                Регистрация занимает меньше минуты.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/auth/register">
                  <Button
                    size="lg"
                    className="bg-[#00acec] hover:bg-[#0095d0] text-white px-8 py-6 text-base rounded-xl shadow-lg shadow-[#00acec]/25 transition-all duration-300 gap-2"
                  >
                    Создать аккаунт
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-8 px-4 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <span className="text-logo text-transparent bg-clip-text bg-gradient-to-r from-[#00acec] to-blue-600 text-lg">
            АССИСТЕНТУС
          </span>
          <span>ТюмГУ &middot; 2025&ndash;2026</span>
        </div>
      </footer>
    </div>
  )
}

export default App
