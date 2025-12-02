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


import * as TanStackQueryProvider from './integrations/tanstack-query/root-provider.tsx'

import './styles.css'
import reportWebVitals from './reportWebVitals.ts'

import App from './App.tsx'
import Login from './components/pages/Auth/Login.tsx'
import Register from './components/pages/Auth/Register.tsx'
import Profile from './components/pages/Profile/Profile.tsx'
import Generation from './components/pages/Generation/Generation.tsx'
import Quiz from './components/pages/Quiz/Quiz.tsx'
import Error from './components/pages/Error/Error.tsx'
import QuizResults from './components/pages/QuizResults/QuizResults.tsx'
import QuizResultsTeacher from './components/pages/QuizResults/QuizResultsTeacher.tsx'
import QuizEdit from './components/pages/QuizEdit/QuizEdit.tsx'
import QuestionEdit from './components/pages/QuestionEdit/QuestionEdit.tsx'
import Questions from '@/components/pages/Questions/Questions.tsx'
import Header from '@/components/widgets/Header/Header.tsx'

/**
 * Root route no longer renders the global header directly.
 * This route is responsible for providing the outlet and global tools
 * (like DevTools). Header is moved into a separate layout route so that
 * we can choose which routes show the header.
 */
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
  component: () => (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  ),
})

const indexRoute = createRoute({
  getParentRoute: () => headerLayoutRoute,
  path: '/',
  component: App,
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
