type TeamStatus = 'Building' | 'Review' | 'Blocked'

type Team = {
  name: string
  members: number
  track: string
  progress: number
  velocity: number
  status: TeamStatus
}

type LeaderboardRow = {
  rank: number
  team: string
  score: number
  demos: number
  mentors: string
}

const teams: Team[] = [
  {
    name: 'OrbitOps',
    members: 5,
    track: 'Productivity',
    progress: 86,
    velocity: 9,
    status: 'Review',
  },
  {
    name: 'NovaThread',
    members: 4,
    track: 'HealthTech',
    progress: 64,
    velocity: 7,
    status: 'Building',
  },
  {
    name: 'CodeNinjas',
    members: 6,
    track: 'Climate',
    progress: 48,
    velocity: 5,
    status: 'Blocked',
  },
  {
    name: 'StackMinds',
    members: 5,
    track: 'FinTech',
    progress: 73,
    velocity: 8,
    status: 'Building',
  },
]

const statusClasses: Record<TeamStatus, string> = {
  Building: 'border-cyan-300/35 bg-cyan-500/15 text-cyan-200',
  Review: 'border-emerald-300/35 bg-emerald-500/15 text-emerald-200',
  Blocked: 'border-rose-300/35 bg-rose-500/15 text-rose-200',
}

const leaderboard: LeaderboardRow[] = [
  {
    rank: 1,
    team: 'OrbitOps',
    score: 91,
    demos: 3,
    mentors: 'Nadia, Rafi',
  },
  {
    rank: 2,
    team: 'StackMinds',
    score: 88,
    demos: 2,
    mentors: 'Imran, Koyal',
  },
  {
    rank: 3,
    team: 'NovaThread',
    score: 83,
    demos: 2,
    mentors: 'Isha, Suman',
  },
  {
    rank: 4,
    team: 'CodeNinjas',
    score: 79,
    demos: 1,
    mentors: 'Sadia, Arif',
  },
]

export function TeamsPage() {
  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold text-slate-50 md:text-4xl">Teams</h1>
        <p className="mt-1 text-sm text-slate-400">
          Track squad velocity, submission progress, and mentor feedback loops.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {teams.map((team) => (
          <article key={team.name} className="panel p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-white">{team.name}</h2>
                <p className="text-sm text-slate-400">{team.track}</p>
              </div>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses[team.status]}`}
              >
                {team.status}
              </span>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-lg bg-slate-950/65 px-3 py-2 text-slate-300">
                <span>Members</span>
                <span className="font-semibold text-white">{team.members}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-950/65 px-3 py-2 text-slate-300">
                <span>Velocity</span>
                <span className="font-semibold text-white">{team.velocity}/10</span>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between text-slate-300">
                  <span>Submission Progress</span>
                  <span>{team.progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-300"
                    style={{ width: `${team.progress}%` }}
                  />
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <article className="panel p-5">
        <h2 className="mb-4 text-2xl font-semibold text-white">Leaderboard Snapshot</h2>
        <div className="soft-scrollbar overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr>
                <th className="border-b border-slate-800 px-3 py-3 font-semibold uppercase tracking-[0.1em] text-slate-500">
                  Rank
                </th>
                <th className="border-b border-slate-800 px-3 py-3 font-semibold uppercase tracking-[0.1em] text-slate-500">
                  Team
                </th>
                <th className="border-b border-slate-800 px-3 py-3 font-semibold uppercase tracking-[0.1em] text-slate-500">
                  Score
                </th>
                <th className="border-b border-slate-800 px-3 py-3 font-semibold uppercase tracking-[0.1em] text-slate-500">
                  Demos
                </th>
                <th className="border-b border-slate-800 px-3 py-3 font-semibold uppercase tracking-[0.1em] text-slate-500">
                  Mentors
                </th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((row) => (
                <tr key={row.rank}>
                  <td className="border-b border-slate-800/70 px-3 py-3 font-semibold text-cyan-200">
                    #{row.rank}
                  </td>
                  <td className="border-b border-slate-800/70 px-3 py-3 text-slate-200">
                    {row.team}
                  </td>
                  <td className="border-b border-slate-800/70 px-3 py-3 text-slate-300">
                    {row.score}
                  </td>
                  <td className="border-b border-slate-800/70 px-3 py-3 text-slate-300">
                    {row.demos}
                  </td>
                  <td className="border-b border-slate-800/70 px-3 py-3 text-slate-300">
                    {row.mentors}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  )
}