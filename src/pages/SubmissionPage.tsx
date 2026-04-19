type PipelineColumn = {
  title: string
  count: number
  tone: 'cyan' | 'amber' | 'emerald'
  items: string[]
}

type SubmissionItem = {
  id: string
  team: string
  project: string
  submittedAt: string
  scoreRisk: string
}

const pipeline: PipelineColumn[] = [
  {
    title: 'Pending Screening',
    count: 13,
    tone: 'amber',
    items: ['ByteBandits', 'NeonLoop', 'StreamForge'],
  },
  {
    title: 'Under Judging',
    count: 9,
    tone: 'cyan',
    items: ['OrbitOps', 'StackMinds', 'NovaThread'],
  },
  {
    title: 'Finalized',
    count: 22,
    tone: 'emerald',
    items: ['CodeNinjas', 'PulseLab', 'GraphRiders'],
  },
]

const toneClass: Record<PipelineColumn['tone'], string> = {
  amber: 'border-amber-300/35 bg-amber-500/10 text-amber-200',
  cyan: 'border-cyan-300/35 bg-cyan-500/10 text-cyan-200',
  emerald: 'border-emerald-300/35 bg-emerald-500/10 text-emerald-200',
}

const submissions: SubmissionItem[] = [
  {
    id: 'SUB-9081',
    team: 'OrbitOps',
    project: 'PulseBoard',
    submittedAt: '10:41 AM',
    scoreRisk: 'Low Risk',
  },
  {
    id: 'SUB-9082',
    team: 'StackMinds',
    project: 'RuralPay',
    submittedAt: '10:35 AM',
    scoreRisk: 'Medium Risk',
  },
  {
    id: 'SUB-9083',
    team: 'NovaThread',
    project: 'MediMesh',
    submittedAt: '10:28 AM',
    scoreRisk: 'Low Risk',
  },
  {
    id: 'SUB-9084',
    team: 'CodeNinjas',
    project: 'GreenGrid',
    submittedAt: '10:11 AM',
    scoreRisk: 'High Risk',
  },
]

export function SubmissionPage() {
  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold text-slate-50 md:text-4xl">
          Submission
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Coordinate judging flow and review final project packages.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {pipeline.map((column) => (
          <article key={column.title} className="panel p-5">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl font-semibold text-white">{column.title}</h2>
              <span
                className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${toneClass[column.tone]}`}
              >
                {column.count}
              </span>
            </div>

            <div className="mt-4 space-y-2">
              {column.items.map((item) => (
                <p
                  key={item}
                  className="rounded-lg border border-slate-800/80 bg-slate-950/60 px-3 py-2 text-sm text-slate-300"
                >
                  {item}
                </p>
              ))}
            </div>
          </article>
        ))}
      </div>

      <article className="panel p-5">
        <h2 className="mb-4 text-2xl font-semibold text-white">Latest Submissions</h2>
        <div className="soft-scrollbar overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr>
                <th className="border-b border-slate-800 px-3 py-3 font-semibold uppercase tracking-[0.1em] text-slate-500">
                  Submission ID
                </th>
                <th className="border-b border-slate-800 px-3 py-3 font-semibold uppercase tracking-[0.1em] text-slate-500">
                  Team
                </th>
                <th className="border-b border-slate-800 px-3 py-3 font-semibold uppercase tracking-[0.1em] text-slate-500">
                  Project
                </th>
                <th className="border-b border-slate-800 px-3 py-3 font-semibold uppercase tracking-[0.1em] text-slate-500">
                  Submitted At
                </th>
                <th className="border-b border-slate-800 px-3 py-3 font-semibold uppercase tracking-[0.1em] text-slate-500">
                  Risk Signal
                </th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((item) => (
                <tr key={item.id}>
                  <td className="border-b border-slate-800/70 px-3 py-3 font-semibold text-cyan-200">
                    {item.id}
                  </td>
                  <td className="border-b border-slate-800/70 px-3 py-3 text-slate-200">
                    {item.team}
                  </td>
                  <td className="border-b border-slate-800/70 px-3 py-3 text-slate-300">
                    {item.project}
                  </td>
                  <td className="border-b border-slate-800/70 px-3 py-3 text-slate-300">
                    {item.submittedAt}
                  </td>
                  <td className="border-b border-slate-800/70 px-3 py-3">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                        item.scoreRisk === 'Low Risk'
                          ? 'border-emerald-300/35 bg-emerald-500/15 text-emerald-200'
                          : item.scoreRisk === 'Medium Risk'
                            ? 'border-amber-300/35 bg-amber-500/15 text-amber-200'
                            : 'border-rose-300/35 bg-rose-500/15 text-rose-200'
                      }`}
                    >
                      {item.scoreRisk}
                    </span>
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