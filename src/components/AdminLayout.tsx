import { Link, Outlet, useRouterState } from '@tanstack/react-router'

const navItems = [
  { to: '/', label: 'Dashboard', badge: 'LIVE' },
  { to: '/registrations', label: 'Registrations', badge: '12' },
  { to: '/teams', label: 'Teams', badge: '28' },
  { to: '/submission', label: 'Submission', badge: '84' },
] as const

const sectionByPath: Record<string, { title: string; subtitle: string }> = {
  '/': {
    title: 'Dashboard',
    subtitle: 'Live pulse of the hackathon floor',
  },
  '/registrations': {
    title: 'Registrations',
    subtitle: 'Participant onboarding and check-in queue',
  },
  '/teams': {
    title: 'Teams',
    subtitle: 'Squad health, progress, and velocity',
  },
  '/submission': {
    title: 'Submission',
    subtitle: 'Judging pipeline and latest uploads',
  },
}

export function AdminLayout() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  const currentSection = sectionByPath[pathname] ?? sectionByPath['/']

  return (
    <div className="min-h-screen bg-[#040613] text-slate-200">
      <div
        className="pointer-events-none fixed inset-0 overflow-hidden"
        aria-hidden
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_15%,rgba(34,211,238,0.12),transparent_34%),radial-gradient(circle_at_92%_6%,rgba(251,191,36,0.1),transparent_27%),radial-gradient(circle_at_78%_84%,rgba(56,189,248,0.1),transparent_30%),linear-gradient(180deg,#070b1d_0%,#040613_50%,#040510_100%)]" />
        <div className="dot-grid absolute inset-0 opacity-[0.16]" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1700px]">
        <aside className="hidden w-72 shrink-0 border-r border-slate-800/90 bg-slate-950/80 backdrop-blur-xl lg:sticky lg:top-0 lg:h-screen lg:self-start lg:flex lg:flex-col">
          <div className="border-b border-slate-800/90 px-6 py-6">
            <div className="flex items-center gap-3.5">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/20 text-sm font-bold tracking-[0.2em] text-cyan-100 shadow-[inset_0_0_0_1px_rgba(103,232,249,0.45)]">
                OP
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300/85">
                  CodeCraft
                </p>
                <p className="text-base font-semibold text-white">Hackathon </p>
              </div>
            </div>
          </div>

          <div className="px-5 py-4 text-[11px] font-semibold tracking-[0.24em] text-slate-500">
            OPERATIONS
          </div>

          <nav className="space-y-2 px-4">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === '/' }}
                className="group flex items-center justify-between rounded-xl border border-transparent px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:border-slate-700/90 hover:bg-slate-900/80 hover:text-white"
                activeProps={{
                  className:
                    'border-cyan-300/40 bg-cyan-400/15 text-cyan-100 shadow-[inset_0_0_0_1px_rgba(125,211,252,0.3)]',
                }}
              >
                <span className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-500 transition group-hover:bg-cyan-300" />
                  {item.label}
                </span>
                <span className="rounded-full border border-slate-700/80 px-2 py-0.5 text-[11px] font-semibold text-slate-400 group-hover:border-slate-500 group-hover:text-slate-200">
                  {item.badge}
                </span>
              </Link>
            ))}
          </nav>

          <div className="mt-auto border-t border-slate-800/90 px-5 py-5 text-sm">
            
            <button
              type="button"
              className="w-full rounded-xl border border-rose-400/35 px-3 py-2 text-left text-rose-300 transition hover:bg-rose-500/10 hover:text-rose-200"
            >
              Log Out
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 md:px-8">
              <div>
                <p className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-slate-500">
                  <span className="font-semibold text-cyan-300">CodeCraft Hackathon</span>
                  <span>/</span>
                  <span>{currentSection.title}</span>
                </p>
                
              </div>

              <div className="flex items-center gap-2.5 text-sm">
              
                <button
                  type="button"
                  className="rounded-lg border border-cyan-300/45 bg-cyan-500/15 px-3 py-1.5 font-medium text-cyan-100 transition hover:bg-cyan-500/25"
                >
                  Scan
                </button>
               
              </div>
            </div>

            <div className="border-t border-slate-800/80 px-4 py-3 lg:hidden">
              <nav className="soft-scrollbar flex gap-2 overflow-x-auto pb-1">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    activeOptions={{ exact: item.to === '/' }}
                    className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-slate-700/70 px-3 py-1.5 text-sm text-slate-300"
                    activeProps={{
                      className: 'border-cyan-400/50 bg-cyan-400/15 text-cyan-100',
                    }}
                  >
                    <span>{item.label}</span>
                    <span className="rounded-full border border-slate-700/80 px-1.5 text-[11px] text-slate-400">
                      {item.badge}
                    </span>
                  </Link>
                ))}
              </nav>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}