import { useState } from 'react'

type MetricTone = 'cyan' | 'amber' | 'emerald' | 'rose'

type Metric = {
  label: string
  value: string
  delta: string
  tone: MetricTone
}

type EventSeverity = 'info' | 'warn' | 'critical'

type ActivityEvent = {
  time: string
  title: string
  details: string
  severity: EventSeverity
}

type ZoneLoad = {
  zone: string
  activeTeams: number
  utilization: number
}

type LiveReview = {
  id: string
  team: string
  project: string
  track: string
  stage: string
  eta: string
}

type TeamChecklistItem = {
  id: string
  team: string
  lead: string
  members: number
  registration: boolean
  food: boolean
}

const initialTeamChecklist: TeamChecklistItem[] = [
  {
    id: 'TM-01',
    team: 'OrbitOps',
    lead: 'Aisha Khan',
    members: 5,
    registration: true,
    food: true,
  },
  {
    id: 'TM-02',
    team: 'StackMinds',
    lead: 'Rahul Sen',
    members: 5,
    registration: true,
    food: false,
  },
  {
    id: 'TM-03',
    team: 'NovaThread',
    lead: 'Nabil Arif',
    members: 4,
    registration: true,
    food: true,
  },
  {
    id: 'TM-04',
    team: 'CodeNinjas',
    lead: 'Mina Dey',
    members: 6,
    registration: false,
    food: false,
  },
  {
    id: 'TM-05',
    team: 'ByteBandits',
    lead: 'Sadia Noor',
    members: 5,
    registration: true,
    food: true,
  },
  {
    id: 'TM-06',
    team: 'NeonLoop',
    lead: 'Tamim Raihan',
    members: 4,
    registration: false,
    food: false,
  },
]

const toneClasses: Record<MetricTone, string> = {
  cyan: 'border-cyan-300/35 bg-cyan-500/10 text-cyan-200',
  amber: 'border-amber-300/35 bg-amber-500/10 text-amber-200',
  emerald: 'border-emerald-300/35 bg-emerald-500/10 text-emerald-200',
  rose: 'border-rose-300/35 bg-rose-500/10 text-rose-200',
}

const activityFeed: ActivityEvent[] = [
  {
    time: '10:42',
    title: 'ByteBandits deployed v1.3 to demo track',
    details: 'Auto-tests passed, waiting for mentor sign-off.',
    severity: 'info',
  },
  {
    time: '10:33',
    title: 'Registration spike in AI track',
    details: '12 new walk-ins queued at Gate B for verification.',
    severity: 'warn',
  },
  {
    time: '10:18',
    title: 'Judge panel room switched to backup Wi-Fi',
    details: 'Ops resolved packet loss issue in 4 minutes.',
    severity: 'critical',
  },
  {
    time: '10:03',
    title: 'Team Nova synced final pitch deck',
    details: 'Submission linked to track: Open Innovation.',
    severity: 'info',
  },
]

const severityClasses: Record<EventSeverity, string> = {
  info: 'bg-cyan-400/80',
  warn: 'bg-amber-400/80',
  critical: 'bg-rose-400/80',
}

const zoneLoads: ZoneLoad[] = [
  { zone: 'AI Arena', activeTeams: 16, utilization: 88 },
  { zone: 'Web3 Lab', activeTeams: 9, utilization: 63 },
  { zone: 'Design Bay', activeTeams: 7, utilization: 52 },
  { zone: 'Pitch Stage', activeTeams: 4, utilization: 31 },
]

const liveReviews: LiveReview[] = [
  {
    id: '#RV-73',
    team: 'OrbitOps',
    project: 'PulseBoard',
    track: 'Productivity',
    stage: 'Under judging',
    eta: '08m',
  },
  {
    id: '#RV-72',
    team: 'StackMinds',
    project: 'RuralPay',
    track: 'FinTech',
    stage: 'Demo queued',
    eta: '14m',
  },
  {
    id: '#RV-71',
    team: 'NeonLoop',
    project: 'SmartQueue',
    track: 'Civic Tech',
    stage: 'Rework requested',
    eta: '22m',
  },
  {
    id: '#RV-70',
    team: 'CodeNinjas',
    project: 'GreenGrid',
    track: 'Climate',
    stage: 'Under judging',
    eta: '06m',
  },
]

export function DashboardPage() {
  const [teamChecklist, setTeamChecklist] = useState(initialTeamChecklist)

  const updateTeamChecklist = (
    teamId: string,
    key: 'registration' | 'food',
    checked: boolean,
  ) => {
    setTeamChecklist((previous) =>
      previous.map((team) => {
        if (team.id !== teamId) {
          return team
        }

        if (key === 'registration') {
          return { ...team, registration: checked }
        }

        return { ...team, food: checked }
      }),
    )
  }

  const registrationsDone = teamChecklist.filter((team) => team.registration).length
  const teamsCreated = teamChecklist.length
  const submittedProjects = 4
  const foodConfirmed = teamChecklist.filter((team) => team.food).length

  const metrics: Metric[] = [
    {
      label: 'Registrations Done',
      value: String(registrationsDone),
      delta: `${teamsCreated - registrationsDone} pending verification`,
      tone: 'emerald',
    },
    {
      label: 'Teams Created',
      value: String(teamsCreated),
      delta: 'active in dashboard list',
      tone: 'cyan',
    },
    {
      label: 'Submitted Projects',
      value: String(submittedProjects),
      delta: `${teamsCreated - submittedProjects} not submitted yet`,
      tone: 'amber',
    },
    {
      label: 'Food Confirmed',
      value: String(foodConfirmed),
      delta: `${teamsCreated - foodConfirmed} pending meal check`,
      tone: 'rose',
    },
  ]

  return (
    <section className="space-y-6">
      <div className="panel relative overflow-hidden p-6 md:p-8">
        <div className="absolute -right-14 -top-20 h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-amber-400/20 blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
              Hackathon Command Center
            </p>
            <h1 className="mt-2 max-w-2xl text-3xl font-semibold text-white md:text-4xl">
              Monitor registrations, team activity, and judging flow in one place.
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-300">
              Real-time ops console for the CodeCraft finals floor. Update calls,
              triage issues, and keep mentors synced.
            </p>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto">
            <button
              type="button"
              className="rounded-xl border border-cyan-300/45 bg-cyan-400/15 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/25"
            >
              Start Registration
            </button>
            <button
              type="button"
              className="rounded-xl border border-cyan-300/45 bg-cyan-400/15 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/25"
            >
              Start Submission
            </button>
            <button
              type="button"
              className="rounded-xl border border-slate-600 bg-slate-900/80 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-400"
            >
              Export 
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <article key={metric.label} className="panel p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              {metric.label}
            </p>
            <p className="mt-3 text-4xl font-semibold text-white">{metric.value}</p>
            <p
              className={`mt-3 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${toneClasses[metric.tone]}`}
            >
              {metric.delta}
            </p>
          </article>
        ))}
      </div>

      {/* <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">Live Activity Feed</h2>
            <span className="rounded-full border border-emerald-300/35 bg-emerald-500/15 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.15em] text-emerald-300">
              Streaming
            </span>
          </div>

          <div className="space-y-3">
            {activityFeed.map((item) => (
              <article
                key={`${item.time}-${item.title}`}
                className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${severityClasses[item.severity]}`}
                  />
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {item.time}
                  </p>
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-100">{item.title}</p>
                <p className="mt-1 text-sm text-slate-400">{item.details}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="panel p-5">
          <h2 className="mb-4 text-2xl font-semibold text-white">Arena Zone Load</h2>

          <div className="space-y-4">
            {zoneLoads.map((zone) => (
              <article key={zone.zone}>
                <div className="mb-1.5 flex items-center justify-between text-sm text-slate-300">
                  <p className="font-semibold text-slate-200">{zone.zone}</p>
                  <p>
                    {zone.activeTeams} teams · {zone.utilization}%
                  </p>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-300"
                    style={{ width: `${zone.utilization}%` }}
                  />
                </div>
              </article>
            ))}
          </div>
        </section>
      </div> */}

      <section className="panel p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-2xl font-semibold text-white">Team Admin Checklist</h2>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full border border-emerald-300/35 bg-emerald-500/15 px-2.5 py-1 font-semibold text-emerald-200">
              Registration {registrationsDone}/{teamsCreated}
            </span>
            <span className="rounded-full border border-amber-300/35 bg-amber-500/15 px-2.5 py-1 font-semibold text-amber-200">
              Food {foodConfirmed}/{teamsCreated}
            </span>
          </div>
        </div>

        <div className="soft-scrollbar overflow-x-auto">
          <table className="w-full min-w-[760px] border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr>
                <th className="border-b border-slate-800 px-3 py-3 font-semibold uppercase tracking-[0.1em] text-slate-500">
                  Team ID
                </th>
                <th className="border-b border-slate-800 px-3 py-3 font-semibold uppercase tracking-[0.1em] text-slate-500">
                  Team
                </th>
                <th className="border-b border-slate-800 px-3 py-3 font-semibold uppercase tracking-[0.1em] text-slate-500">
                  Team Lead
                </th>
                <th className="border-b border-slate-800 px-3 py-3 font-semibold uppercase tracking-[0.1em] text-slate-500">
                  Members
                </th>
                <th className="border-b border-slate-800 px-3 py-3 font-semibold uppercase tracking-[0.1em] text-slate-500">
                  Registration
                </th>
                <th className="border-b border-slate-800 px-3 py-3 font-semibold uppercase tracking-[0.1em] text-slate-500">
                  Food
                </th>
              </tr>
            </thead>
            <tbody>
              {teamChecklist.map((team) => (
                <tr key={team.id}>
                  <td className="border-b border-slate-800/70 px-3 py-3 font-semibold text-cyan-200">
                    {team.id}
                  </td>
                  <td className="border-b border-slate-800/70 px-3 py-3 text-slate-200">
                    {team.team}
                  </td>
                  <td className="border-b border-slate-800/70 px-3 py-3 text-slate-300">
                    {team.lead}
                  </td>
                  <td className="border-b border-slate-800/70 px-3 py-3 text-slate-300">
                    {team.members}
                  </td>
                  <td className="border-b border-slate-800/70 px-3 py-3">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-xs font-semibold text-slate-300">
                      <input
                        type="checkbox"
                        checked={team.registration}
                        onChange={(event) =>
                          updateTeamChecklist(
                            team.id,
                            'registration',
                            event.target.checked,
                          )
                        }
                        className="h-4 w-4 rounded border-slate-500 bg-slate-900 text-emerald-400"
                      />
                      Done
                    </label>
                  </td>
                  <td className="border-b border-slate-800/70 px-3 py-3">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-xs font-semibold text-slate-300">
                      <input
                        type="checkbox"
                        checked={team.food}
                        onChange={(event) =>
                          updateTeamChecklist(team.id, 'food', event.target.checked)
                        }
                        className="h-4 w-4 rounded border-slate-500 bg-slate-900 text-amber-400"
                      />
                      Done
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">Review Queue</h2>
          <button
            type="button"
            className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-1.5 text-sm font-medium text-slate-300"
          >
            Assign Judges
          </button>
        </div>

        <div className="soft-scrollbar overflow-x-auto">
          <table className="w-full min-w-[760px] border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr>
                <th className="border-b border-slate-800 px-3 py-3 font-semibold uppercase tracking-[0.1em] text-slate-500">
                  Review ID
                </th>
                <th className="border-b border-slate-800 px-3 py-3 font-semibold uppercase tracking-[0.1em] text-slate-500">
                  Team
                </th>
                <th className="border-b border-slate-800 px-3 py-3 font-semibold uppercase tracking-[0.1em] text-slate-500">
                  Project
                </th>
                <th className="border-b border-slate-800 px-3 py-3 font-semibold uppercase tracking-[0.1em] text-slate-500">
                  Track
                </th>
                <th className="border-b border-slate-800 px-3 py-3 font-semibold uppercase tracking-[0.1em] text-slate-500">
                  Stage
                </th>
                <th className="border-b border-slate-800 px-3 py-3 font-semibold uppercase tracking-[0.1em] text-slate-500">
                  ETA
                </th>
              </tr>
            </thead>
            <tbody>
              {liveReviews.map((row) => (
                <tr key={row.id}>
                  <td className="border-b border-slate-800/70 px-3 py-3 font-semibold text-cyan-200">
                    {row.id}
                  </td>
                  <td className="border-b border-slate-800/70 px-3 py-3 text-slate-200">
                    {row.team}
                  </td>
                  <td className="border-b border-slate-800/70 px-3 py-3 text-slate-300">
                    {row.project}
                  </td>
                  <td className="border-b border-slate-800/70 px-3 py-3 text-slate-300">
                    {row.track}
                  </td>
                  <td className="border-b border-slate-800/70 px-3 py-3">
                    <span className="rounded-full border border-cyan-300/30 bg-cyan-500/15 px-3 py-1 text-xs font-semibold text-cyan-200">
                      {row.stage}
                    </span>
                  </td>
                  <td className="border-b border-slate-800/70 px-3 py-3 text-slate-300">
                    {row.eta}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  )
}