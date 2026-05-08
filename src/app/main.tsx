import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useSearch,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import * as TanStackQueryProvider from './providers/QueryProvider'

import './styles.css'
import { HeaderLayout } from './layouts/HeaderLayout'
import reportWebVitals from '@/shared/lib/reportWebVitals'

import { LandingPage } from '@/pages/landing'
import { Login, Register } from '@/pages/auth'
import { Profile } from '@/pages/profile'
import { Generation } from '@/pages/generation'
import { Quiz } from '@/pages/quiz'
import { ErrorPage as Error } from '@/pages/error'
import { QuizResults, QuizResultsTeacher } from '@/pages/quiz-results'
import { QuizEdit } from '@/pages/quiz-edit'
import { QuestionEdit } from '@/pages/question-edit'
import { Questions } from '@/pages/questions'

import AdminDashboard from '../pages/admin/AdminDashboard.tsx'
import AdminUsers from '../pages/admin/Users.tsx'
import AdminSubjects from '../pages/admin/Subjects.tsx'
import AdminThemes from '../pages/admin/Themes.tsx'
import AdminStats from '../pages/admin/Stats.tsx'
import { AdminGuard } from '../guards/AdminGuard.tsx'
import Quizes from '../pages/admin/Quizes.tsx'
import Summaries from '../pages/admin/Summaries.tsx'
import AdminLayout from '../pages/admin/AdminLayout.tsx'

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
})

const headerLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'headerLayout',
  component: HeaderLayout,
})

const indexRoute = createRoute({
  getParentRoute: () => headerLayoutRoute,
  path: '/',
  component: LandingPage,
})

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'auth',
})

const loginRoute = createRoute({
  getParentRoute: () => authRoute,
  path: 'login',
  component: Login,
})

const registerRoute = createRoute({
  getParentRoute: () => authRoute,
  path: 'register',
  component: Register,
})

const profileRoute = createRoute({
  getParentRoute: () => headerLayoutRoute,
  path: 'profile',
  component: Profile,
})

const generationRoute = createRoute({
  getParentRoute: () => headerLayoutRoute,
  path: 'generation',
  component: Generation,
})

const quizRoute = createRoute({
  getParentRoute: () => headerLayoutRoute,
  path: 'quiz',
})

const quizByIdRoute = createRoute({
  getParentRoute: () => quizRoute,
  path: '$id',
  component: Quiz,
})

const quizQuestionsRoute = createRoute({
  getParentRoute: () => quizRoute,
  path: '$id/questions',
  component: Questions,
})

const quizResultsRoute = createRoute({
  getParentRoute: () => quizRoute,
  path: '$id/results',
  validateSearch: (search) => {
    return {
      isTeacher: search.isTeacher
    }
  },
  component: () => {
    const search = useSearch({ strict: false })
    return search.isTeacher ? <QuizResultsTeacher /> : <QuizResults />
  },
})

const quizEditRoute = createRoute({
  getParentRoute: () => quizRoute,
  path: '$id/edit',
  component: QuizEdit,
})

const questionEditRoute = createRoute({
  getParentRoute: () => quizRoute,
  path: '$quizId/question/$questionId/edit',
  component: QuestionEdit,
})

// Роут для защиты админ-панели (проверка прав)
const adminGuardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'admin',
  component: AdminGuard,
})

// Лейаут админ-панели 
const adminLayoutRoute = createRoute({
  getParentRoute: () => adminGuardRoute,
  id: 'adminLayout',
  component: AdminLayout,
})



// Внутренние роуты админки
const adminDashboardRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/',
  component: AdminDashboard,
})

const adminUsersRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'users',
  component: AdminUsers,
})

const adminSubjectsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'subjects',
  component: AdminSubjects,
})

const adminThemesRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'themes',
  component: AdminThemes,
})

const adminStatsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'stats',
  component: AdminStats,
})

const adminQuizesRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'quizes',
  component: Quizes,
})

const adminSummariesRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'summaries',
  component: Summaries,
})


// const quizResultsTeacherRoute = createRoute({
//   getParentRoute: () => quizRoute,
//   path: '$id/results?isTeacher=true',
//   validateSearch: (search) => {
//     return {
//       isTeacher: search.isTeacher === 'true',
//     }
//   },
//   component: QuizResultsTeacher,
// })

const routeTree = rootRoute.addChildren([
  headerLayoutRoute.addChildren([
    indexRoute,
    profileRoute,
    generationRoute,
    quizRoute.addChildren([quizByIdRoute, quizQuestionsRoute, quizResultsRoute, quizEditRoute, questionEditRoute]),
  ]),
  authRoute.addChildren([loginRoute, registerRoute]),
  adminGuardRoute.addChildren([
    adminLayoutRoute.addChildren([
      adminDashboardRoute,
      adminUsersRoute,
      adminSubjectsRoute,
      adminThemesRoute,
      adminStatsRoute,
      adminQuizesRoute,
      adminSummariesRoute,
    ]),
  ]),
])

const TanStackQueryProviderContext = TanStackQueryProvider.getContext()
const router = createRouter({
  routeTree,
  context: {
    ...TanStackQueryProviderContext,
  },
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
  defaultNotFoundComponent: () => <Error code={404} error="Страница не найдена" />,
  defaultErrorComponent: () => <Error code={500} error="Внутренняя ошибка сервера" />
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <TanStackQueryProvider.Provider {...TanStackQueryProviderContext}>
        <RouterProvider router={router} />
      </TanStackQueryProvider.Provider>
    </StrictMode>,
  )
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
