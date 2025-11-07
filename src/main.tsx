import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import Header from './components/Header'

import * as TanStackQueryProvider from './integrations/tanstack-query/root-provider.tsx'

import './styles.css'
import reportWebVitals from './reportWebVitals.ts'

import App from './App.tsx'
import Login from './routes/auth/Login.tsx'
import Register from './routes/auth/Register.tsx'
import Profile from './routes/Profile.tsx'
import Generation from './routes/generation/Generation.tsx'
import Quiz from './routes/quiz/Quiz.tsx'
import Questions from './routes/quiz/questions/Questions.tsx'

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

const routeTree = rootRoute.addChildren([
  headerLayoutRoute.addChildren([
    indexRoute,
    profileRoute,
    generationRoute,
    quizRoute.addChildren([quizByIdRoute, quizQuestionsRoute]),
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
