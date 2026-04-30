import {
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { AdminLayout } from './components/AdminLayout'
import { DashboardPage } from './pages/DashboardPage'
import { RegistrationsPage } from './pages/RegistrationsPage'
import { RegistrationDetailsPage } from './pages/RegistrationDetailsPage'
import { SubmissionPage } from './pages/SubmissionPage'
import { SubmissionDetailsPage } from './pages/SubmissionDetailsPage'
import { TeamsPage } from './pages/TeamsPage'
import { TeamDetailsPage } from './pages/TeamDetailsPage'
import { SettingsPage } from './pages/SettingsPage'
import { HackathonSettingsPage } from './pages/HackathonSettingsPage'
import { OrganizersPage } from './pages/OrganizersPage'
import { JudgesPage } from './pages/JudgesPage'
import { SelectHackathonPage } from './pages/SelectHackathonPage'
import { NotFoundPage } from './pages/NotFoundPage'

const rootRoute = createRootRoute({
  notFoundComponent: NotFoundPage,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: SelectHackathonPage,
})

const hackathonParentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/h/$hackathonId',
  component: AdminLayout,
})

const dashboardRoute = createRoute({
  getParentRoute: () => hackathonParentRoute,
  path: '/',
  component: DashboardPage,
})

const registrationsRoute = createRoute({
  getParentRoute: () => hackathonParentRoute,
  path: '/registrations',
  component: RegistrationsPage,
})

const registrationsDetailRoute = createRoute({
  getParentRoute: () => hackathonParentRoute,
  path: '/registrations/$registrationId',
  component: RegistrationDetailsPage,
})

const teamsRoute = createRoute({
  getParentRoute: () => hackathonParentRoute,
  path: '/teams',
  component: TeamsPage,
})

const teamDetailsRoute = createRoute({
  getParentRoute: () => hackathonParentRoute,
  path: '/teams/$teamName',
  component: TeamDetailsPage,
})

const submissionRoute = createRoute({
  getParentRoute: () => hackathonParentRoute,
  path: '/submission',
  component: SubmissionPage,
})

const submissionDetailRoute = createRoute({
  getParentRoute: () => hackathonParentRoute,
  path: '/submission/$registrationId',
  component: SubmissionDetailsPage,
})

// Phase architect (renamed from /settings)
const phasesRoute = createRoute({
  getParentRoute: () => hackathonParentRoute,
  path: '/phases',
  component: SettingsPage,
})

// New hackathon settings (name, email etc.)
const settingsRoute = createRoute({
  getParentRoute: () => hackathonParentRoute,
  path: '/settings',
  component: HackathonSettingsPage,
})

const organizersRoute = createRoute({
  getParentRoute: () => hackathonParentRoute,
  path: '/organizers',
  component: OrganizersPage,
})

const judgesRoute = createRoute({
  getParentRoute: () => hackathonParentRoute,
  path: '/judges',
  component: JudgesPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  hackathonParentRoute.addChildren([
    dashboardRoute,
    registrationsRoute,
    registrationsDetailRoute,
    teamsRoute,
    teamDetailsRoute,
    submissionRoute,
    submissionDetailRoute,
    phasesRoute,
    organizersRoute,
    judgesRoute,
    settingsRoute,
  ]),
])

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultNotFoundComponent: NotFoundPage,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}