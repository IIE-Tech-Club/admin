import { useState, useEffect } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { type RegistrationStatus } from './RegistrationsPage'
import { auth, onAuthStateChanged } from '../lib/firebase'
import type { User } from '../lib/firebase'
import Loader from '../components/ui/Loader'

type MetricTone = 'cyan' | 'amber' | 'emerald' | 'rose'

type Metric = {
  label: string
  value: string
  delta: string
  tone: MetricTone
  icon: React.ReactNode
  to: string
}

type PhaseStat = {
  id: string
  name: string
  count: number
  percentage: number
}

interface Phase {
  id: string
  name: string
  type: string
}

type BackendUser = {
  uid: string
  name: string
  email: string
  status: RegistrationStatus
  team: string
  track: string
  responses: Record<string, unknown>
}

type Hackathon = {
    id: string
    title: string
    creatorId: string
    creatorEmail: string
    phases: Phase[]
    organizers?: Array<{
        name: string;
        avatar: string;
        email?: string;
    }>;
    organisers?: Array<{
        name: string;
        avatar: string;
        email?: string;
    }>;
    judges?: Array<{
        email: string;
        status: string;
        name?: string;
        avatar?: string;
    }>;
}

interface OrganizerData {
  name?: string;
  fullName?: string;
  displayName?: string;
  email?: string;
  contactEmail?: string;
  avatar?: string;
  user?: {
    name?: string;
    email?: string;
    avatar?: string;
  };
  details?: {
    name?: string;
    email?: string;
    avatar?: string;
  };
}

const toneMap: Record<MetricTone, { bar: string; text: string; bg: string; border: string }> = {
  cyan:    { bar: 'bg-cyan-400',    text: 'text-cyan-400',    bg: 'bg-cyan-500/10',    border: 'border-cyan-500/20' },
  emerald: { bar: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  amber:   { bar: 'bg-amber-400',   text: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20' },
  rose:    { bar: 'bg-rose-400',    text: 'text-rose-400',    bg: 'bg-rose-500/10',    border: 'border-rose-500/20' },
}

export function DashboardPage() {
  const { hackathonId } = useParams({ from: '/h/$hackathonId' })
  const navigate = useNavigate()
  const [hackathon, setHackathon] = useState<Hackathon | null>(null)
  const [registrations, setRegistrations] = useState<BackendUser[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const idToken = await user?.getIdToken();
        const headers: HeadersInit = idToken ? { 'Authorization': `Bearer ${idToken}` } : {};

        const [hRes, rRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/hackathons/${hackathonId}`, { headers, cache: 'no-store' }),
          fetch(`${import.meta.env.VITE_API_URL}/registrations/${hackathonId}`, { headers, cache: 'no-store' })
        ]);
        
        const hData = await hRes.json()
        const rData = await rRes.json()

        if (hRes.ok) {
          // Ensure organizers and organisers are merged or checked
          const normalizedHackathon = {
            ...hData,
            organizers: hData.organizers || hData.organisers || []
          }
          setHackathon(normalizedHackathon)
        } else {
          setHackathon(null)
          return
        }
        
        if (!Array.isArray(rData)) { setRegistrations([]); return }

        const formatted: BackendUser[] = rData.map((reg: { userId: string; status?: RegistrationStatus; responses?: Record<string, unknown>; user?: { name?: string; email?: string } }) => {
            const responses = reg.responses || {}
            let name = reg.user?.name || 'Unknown'
            let email = reg.user?.email || 'N/A'
            let track = 'General'
            let team = 'Individual'

            Object.values(responses).forEach((data) => {
                if (typeof data === 'object' && data !== null) {
                    const d = data as Record<string, unknown>
                    if (d.name && name === 'Unknown') name = String(d.name)
                    if (d.email && email === 'N/A') email = String(d.email)
                    if (d.branch) track = String(d.branch)
                    if (d.teamName) team = String(d.teamName)
                }
            })

            return { uid: reg.userId, name, email, status: reg.status || 'Pending', team, track, responses }
        })

        setRegistrations(formatted)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [hackathonId, user])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader text="Initializing Command Center..." />
      </div>
    )
  }

  const total = registrations.length
  
  const phaseStats: PhaseStat[] = (hackathon?.phases || []).map(phase => {
    const count = registrations.filter(r => r.responses && r.responses[phase.id]).length
    return { id: phase.id, name: phase.name, count, percentage: total > 0 ? Math.round((count / total) * 100) : 0 }
  })

  const activeTeams = new Set(registrations.filter(r => r.team !== 'Individual').map(r => r.team)).size

  const totalSubmissions = registrations.filter(r => r.responses && r.responses['phase_3_submissions']).length

  const metrics: Metric[] = [
    {
      label: "Registrations",
      value: String(total),
      delta: "Total participants",
      tone: "cyan",
      to: "/h/$hackathonId/registrations",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      label: "Active Teams",
      value: String(activeTeams),
      delta: "Unique squads formed",
      tone: "amber",
      to: "/h/$hackathonId/teams",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
    },
    {
      label: "Submissions",
      value: String(totalSubmissions),
      delta: "Projects successfully logged",
      tone: "rose",
      to: "/h/$hackathonId/submission",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="icon icon-tabler icons-tabler-filled icon-tabler-automatic-gearbox"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M18 16a3 3 0 0 1 0 6h-1a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1zm0 4l.117 -.007a1 1 0 0 0 -.117 -1.993zm.5 -13a2.5 2.5 0 1 1 0 5h-.5v1a1 1 0 0 1 -.883 .993l-.117 .007a1 1 0 0 1 -1 -1v-5a1 1 0 0 1 1 -1zm-.5 3h.5a.5 .5 0 1 0 0 -1h-.5zm-5 0a1 1 0 0 1 0 2h-3v6h3a1 1 0 0 1 0 2h-3a2 2 0 0 1 -2 -2v-6h-2a2 2 0 0 1 -1.995 -1.85l-.005 -.15v-2.17a3 3 0 0 1 -2 -2.83l.005 -.176a3 3 0 1 1 3.996 3.005l-.001 2.171z" />
        </svg>
      ),
    },
  ];

  const isCreator = user?.uid === hackathon?.creatorId

  if (!isCreator) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] font-orbitron p-6 text-center">
        <div className="h-16 w-16 bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-5 rounded-full">
          <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-black text-white tracking-widest uppercase mb-3">Access Restricted</h2>
        <p className="text-slate-500 max-w-md text-sm leading-relaxed mb-6">
          Only the authorized creator <span className="text-cyan-400">[{hackathon?.creatorEmail}]</span> can access this terminal.
        </p>
        <button onClick={() => navigate({ to: '/' })} className="neon-btn-cyan">
          RETURN TO CENTRAL COMMAND
        </button>
      </div>
    )
  }

  return (
    <section className="space-y-5 sm:space-y-6 pb-16">
      {/* Hero Header */}
      <div className="glass-card relative overflow-hidden p-5 sm:p-8 border-cyan-500/20">
        <div className="absolute -right-16 -top-16 h-48 w-48 sm:h-64 sm:w-64 rounded-full bg-cyan-400/8 blur-[80px]" />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 sm:gap-8">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/30 text-[9px] text-cyan-400 font-orbitron font-bold tracking-widest uppercase">
                Live Node
              </span>
              <span className="text-[9px] text-slate-500 font-orbitron font-bold tracking-widest uppercase italic truncate max-w-[200px]">
                {hackathon?.creatorEmail}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter font-orbitron uppercase leading-none">
              {hackathon?.title}{" "}
              <span className="text-cyan-400 text-glow">Dashboard</span>
            </h1>
            <p className="mt-3 text-slate-400 text-xs sm:text-sm font-medium tracking-wide max-w-xl">
              Global operational intelligence for hackathon lifecycle
              management.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={() =>
                navigate({
                  to: "/h/$hackathonId/phases",
                  params: { hackathonId },
                })
              }
              className="neon-btn-cyan !py-3 !px-6"
            >
              RECONFIGURE PHASES
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3 w-full">
        {metrics.map((metric) => {
          const t = toneMap[metric.tone];
          return (
            <article
              key={metric.label}
              onClick={() => navigate({ to: metric.to, params: { hackathonId } } as unknown as Parameters<typeof navigate>[0])}
              className={`glass-card p-4 sm:p-6 border-white/5 hover:${t.border} transition-all group cursor-pointer hover:bg-white/[0.02] active:scale-[0.98]`}
            >
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.25em] text-slate-500 font-orbitron leading-tight pr-2">
                  {metric.label}
                </p>
                <span
                  className={`${t.bg} p-1.5 sm:p-2 border ${t.border} ${t.text} shrink-0`}
                >
                  {metric.icon}
                </span>
              </div>
              <p
                className={`text-3xl sm:text-5xl font-black text-white font-orbitron tracking-tighter`}
              >
                {metric.value}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <div className={`h-0.5 w-3 ${t.bar}`} />
                <p
                  className={`text-[9px] sm:text-[10px] font-bold ${t.text} uppercase tracking-widest font-orbitron`}
                >
                  {metric.delta}
                </p>
              </div>
            </article>
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-1">
        {/* Phase Synchronization */}
        <section className="glass-card p-5 sm:p-8 border-white/5">
          <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
            <div className="h-5 w-1 bg-cyan-400 shadow-[0_0_8px_#00ffff]" />
            <h2 className="text-base sm:text-xl font-black text-white tracking-wider font-orbitron uppercase">
              Phase Sync
            </h2>
          </div>

          <div className="space-y-5">
            {phaseStats.map((phase, idx) => (
              <div key={phase.id}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-4 w-4 border border-cyan-500/50 flex items-center justify-center text-[8px] text-cyan-400 font-orbitron font-bold shrink-0">
                      {idx + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] sm:text-[10px] font-black text-cyan-400 uppercase tracking-wider font-orbitron truncate">
                        {phase.name}
                      </p>
                      <p className="text-[9px] text-slate-500 font-orbitron">
                        {phase.count} processed
                      </p>
                    </div>
                  </div>
                  <p className="text-base sm:text-lg font-black text-white font-orbitron shrink-0 ml-2">
                    {phase.percentage}%
                  </p>
                </div>
                <div className="h-1.5 w-full bg-slate-900 border border-white/5 overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 transition-all duration-1000 ease-out shadow-[0_0_8px_#00ffff]"
                    style={{ width: `${phase.percentage}%` }}
                  />
                </div>
              </div>
            ))}
            {phaseStats.length === 0 && (
              <p className="text-slate-600 font-orbitron text-xs italic">
                No deployment phases configured.
              </p>
            )}
          </div>
        </section>
      </div>

      <div className="grid gap-5 md:grid-cols-2 mt-5">
        {/* Organizers Section */}
        <section className="glass-card p-5 sm:p-8 border-white/5">
          <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
            <div className="h-5 w-1 bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
            <h2 className="text-base sm:text-xl font-black text-white tracking-wider font-orbitron uppercase">
              Organizers
            </h2>
          </div>
          <div className="space-y-4">
            {hackathon?.organizers?.map((org: OrganizerData, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group">
                <div className="relative w-12 h-12 shrink-0 border border-white/10 overflow-hidden bg-slate-900 shadow-[0_0_15px_rgba(0,0,0,0.2)]">
                  {org.avatar ? (
                    <img 
                      src={org.avatar} 
                      alt={org.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-orbitron text-lg font-black text-cyan-400/80 group-hover:text-cyan-400 transition-colors">
                      {org.name?.charAt(0) || '?'}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-white font-orbitron uppercase tracking-[0.2em] mb-0.5 truncate group-hover:text-cyan-400 transition-colors">
                    {org.name || 'Anonymous Personnel'}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_5px_#00ffff] animate-pulse" />
                    <p className="text-[10px] text-slate-500 font-mono lowercase tracking-wider truncate">
                      {org.email || 'no-contact-data'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {(!hackathon?.organizers || hackathon.organizers.length === 0) && (
              <div className="p-10 border border-dashed border-white/5 flex flex-col items-center justify-center opacity-30">
                <p className="text-slate-600 font-orbitron text-[9px] uppercase tracking-[0.3em] italic text-center">No Command Personnel Detected</p>
              </div>
            )}
          </div>
        </section>

        {/* Judges Section */}
        <section className="glass-card p-5 sm:p-8 border-white/5">
          <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
            <div className="h-5 w-1 bg-rose-400 shadow-[0_0_8px_#f43f5e]" />
            <h2 className="text-base sm:text-xl font-black text-white tracking-wider font-orbitron uppercase">
              Judges
            </h2>
          </div>
          <div className="space-y-4">
            {hackathon?.judges?.map((judge, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5">
                <div className="w-10 h-10 border border-white/10 flex items-center justify-center bg-slate-800">
                  {judge.avatar ? (
                    <img src={judge.avatar} alt={judge.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-orbitron text-slate-500">JDG</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white font-orbitron uppercase tracking-wider truncate">{judge.name || judge.email}</p>
                  <p className="text-[10px] text-slate-500 font-mono lowercase">{judge.email}</p>
                </div>
                <div className={`px-2 py-0.5 text-[8px] font-bold font-orbitron uppercase tracking-widest border ${judge.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                  {judge.status}
                </div>
              </div>
            ))}
            {(!hackathon?.judges || hackathon.judges.length === 0) && (
              <p className="text-slate-600 font-orbitron text-xs italic">No judges assigned.</p>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}