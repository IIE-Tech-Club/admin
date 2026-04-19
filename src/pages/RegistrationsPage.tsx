type RegistrationStatus = 'Pending' | 'Approved' | 'Rejected'

type Registration = {
  id: string
  participant: string
  team: string
  track: string
  checkIn: string
  status: RegistrationStatus
}

type Demand = {
  track: string
  teams: number
  occupancy: number
}

const registrations: Registration[] = [
  {
    id: 'REG-3412',
    participant: 'Aisha Khan',
    team: 'ByteBandits',
    track: 'AI for Social Good',
    checkIn: '10:40 AM',
    status: 'Pending',
  },
  {
    id: 'REG-3413',
    participant: 'Rahul Sen',
    team: 'StackMinds',
    track: 'FinTech',
    checkIn: '10:35 AM',
    status: 'Approved',
  },
  {
    id: 'REG-3414',
    participant: 'Nabil Arif',
    team: 'NovaThread',
    track: 'Open Innovation',
    checkIn: '10:22 AM',
    status: 'Pending',
  },
  {
    id: 'REG-3415',
    participant: 'Mina Dey',
    team: 'CircuitCrew',
    track: 'HealthTech',
    checkIn: '10:18 AM',
    status: 'Rejected',
  },
]

const statusClasses: Record<RegistrationStatus, string> = {
  Pending: 'border-amber-300/35 bg-amber-500/15 text-amber-200',
  Approved: 'border-emerald-300/35 bg-emerald-500/15 text-emerald-200',
  Rejected: 'border-rose-300/35 bg-rose-500/15 text-rose-200',
}

const trackDemand: Demand[] = [
  { track: 'AI for Social Good', teams: 14, occupancy: 92 },
  { track: 'FinTech', teams: 9, occupancy: 67 },
  { track: 'Open Innovation', teams: 11, occupancy: 74 },
  { track: 'HealthTech', teams: 7, occupancy: 53 },
]

export function RegistrationsPage() {
  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold text-slate-50 md:text-4xl">
          Registrations
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Approve participants, verify teams, and balance track capacity.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="panel p-5">
          <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Queue Size</p>
          <p className="mt-2 text-4xl font-semibold text-white">42</p>
          <p className="mt-2 text-sm text-amber-300">11 require manual ID check</p>
        </article>
        <article className="panel p-5">
          <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Approved Today</p>
          <p className="mt-2 text-4xl font-semibold text-white">87</p>
          <p className="mt-2 text-sm text-emerald-300">+23 since opening gate</p>
        </article>
        <article className="panel p-5">
          <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Rejected</p>
          <p className="mt-2 text-4xl font-semibold text-white">6</p>
          <p className="mt-2 text-sm text-rose-300">Duplicate profiles and invalid docs</p>
        </article>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.45fr_0.95fr]">
        <article className="panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">Check-in Queue</h2>
            <button
              type="button"
              className="rounded-lg border border-slate-700 bg-slate-900/75 px-3 py-1.5 text-sm text-slate-300"
            >
              Add Walk-in
            </button>
          </div>

          <div className="soft-scrollbar overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr>
                  <th className="border-b border-slate-800 px-3 py-3 font-semibold uppercase tracking-[0.1em] text-slate-500">
                    Registration ID
                  </th>
                  <th className="border-b border-slate-800 px-3 py-3 font-semibold uppercase tracking-[0.1em] text-slate-500">
                    Participant
                  </th>
                  <th className="border-b border-slate-800 px-3 py-3 font-semibold uppercase tracking-[0.1em] text-slate-500">
                    Team
                  </th>
                  <th className="border-b border-slate-800 px-3 py-3 font-semibold uppercase tracking-[0.1em] text-slate-500">
                    Track
                  </th>
                  <th className="border-b border-slate-800 px-3 py-3 font-semibold uppercase tracking-[0.1em] text-slate-500">
                    Check-in
                  </th>
                  <th className="border-b border-slate-800 px-3 py-3 font-semibold uppercase tracking-[0.1em] text-slate-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((row) => (
                  <tr key={row.id}>
                    <td className="border-b border-slate-800/70 px-3 py-3 font-semibold text-cyan-200">
                      {row.id}
                    </td>
                    <td className="border-b border-slate-800/70 px-3 py-3 text-slate-200">
                      {row.participant}
                    </td>
                    <td className="border-b border-slate-800/70 px-3 py-3 text-slate-300">
                      {row.team}
                    </td>
                    <td className="border-b border-slate-800/70 px-3 py-3 text-slate-300">
                      {row.track}
                    </td>
                    <td className="border-b border-slate-800/70 px-3 py-3 text-slate-300">
                      {row.checkIn}
                    </td>
                    <td className="border-b border-slate-800/70 px-3 py-3">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses[row.status]}`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel p-5">
          <h2 className="text-2xl font-semibold text-white">Track Demand</h2>
          <p className="mt-1 text-sm text-slate-400">
            Capacity heat by track for this sprint.
          </p>

          <div className="mt-4 space-y-4">
            {trackDemand.map((item) => (
              <div key={item.track}>
                <div className="mb-1.5 flex items-center justify-between text-sm text-slate-300">
                  <span className="font-medium text-slate-200">{item.track}</span>
                  <span>
                    {item.teams} teams · {item.occupancy}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-300 to-cyan-300"
                    style={{ width: `${item.occupancy}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}