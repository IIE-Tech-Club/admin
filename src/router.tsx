import {
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { AdminLayout } from './components/AdminLayout'
import { DashboardPage } from './pages/DashboardPage'
import { RegistrationsPage } from './pages/RegistrationsPage'
import { SubmissionPage } from './pages/SubmissionPage'
import { TeamsPage } from './pages/TeamsPage'

const rootRoute = createRootRoute({
  component: AdminLayout,
})

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
})

const registrationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/registrations',
  component: RegistrationsPage,
})

const teamsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/teams',
  component: TeamsPage,
})

const submissionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/submission',
  component: SubmissionPage,
})

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  registrationsRoute,
  teamsRoute,
  submissionRoute,
])

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}