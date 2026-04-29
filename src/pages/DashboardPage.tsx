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
        const [hRes, rRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/hackathons/${hackathonId}`),
          fetch(`${import.meta.env.VITE_API_URL}/registrations/${hackathonId}`)
        ])
        
        const hData = await hRes.json()
        const rData = await rRes.json()

        if (hRes.ok) setHackathon(hData)
        else { setHackathon(null); return }
        
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
  }, [hackathonId])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader text="Initializing Command Center..." />
      </div>
    )
  }

  const total = registrations.length
  const approved = registrations.filter(r => r.status === 'Approved').length
  const pending = registrations.filter(r => r.status === 'Pending').length
  const rejected = registrations.filter(r => r.status === 'Rejected').length
  
  const phaseStats: PhaseStat[] = (hackathon?.phases || []).map(phase => {
    const count = registrations.filter(r => r.responses && r.responses[phase.id]).length
    return { id: phase.id, name: phase.name, count, percentage: total > 0 ? Math.round((count / total) * 100) : 0 }
  })

  const activeTeams = new Set(registrations.filter(r => r.team !== 'Individual').map(r => r.team)).size

  const metrics: Metric[] = [
    {
      label: 'Registrations',
      value: String(total),
      delta: 'Total participants',
      tone: 'cyan',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      )
    },
    {
      label: 'Approval Rate',
      value: `${total > 0 ? Math.round((approved / total) * 100) : 0}%`,
      delta: `${pending} awaiting review`,
      tone: 'emerald',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      )
    },
    {
      label: 'Active Teams',
      value: String(activeTeams),
      delta: 'Unique squads formed',
      tone: 'amber',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      )
    },
    {
      label: 'Phases',
      value: String(hackathon?.phases?.length || 0),
      delta: 'Active routing nodes',
      tone: 'rose',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
        </svg>
      )
    },
  ]

  const trackCounts = registrations.reduce((acc, r) => {
    const track = r.track || 'General'
    acc[track] = (acc[track] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  const sortedTracks = Object.entries(trackCounts).sort((a, b) => b[1] - a[1])
  const soloCount = registrations.filter(r => r.team === 'Individual').length
  const teamUsersCount = total - soloCount

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
              {hackathon?.title}{' '}
              <span className="text-cyan-400 text-glow">Dashboard</span>
            </h1>
            <p className="mt-3 text-slate-400 text-xs sm:text-sm font-medium tracking-wide max-w-xl">
              Global operational intelligence for hackathon lifecycle management.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button 
              onClick={() => navigate({ to: '/h/$hackathonId/settings', params: { hackathonId } })}
              className="neon-btn-cyan !py-3 !px-6"
            >
              RECONFIGURE PHASES
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const t = toneMap[metric.tone]
          return (
            <article key={metric.label} className={`glass-card p-4 sm:p-6 border-white/5 hover:${t.border} transition-all group`}>
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.25em] text-slate-500 font-orbitron leading-tight pr-2">
                  {metric.label}
                </p>
                <span className={`${t.bg} p-1.5 sm:p-2 border ${t.border} ${t.text} shrink-0`}>
                  {metric.icon}
                </span>
              </div>
              <p className={`text-3xl sm:text-5xl font-black text-white font-orbitron tracking-tighter`}>
                {metric.value}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <div className={`h-0.5 w-3 ${t.bar}`} />
                <p className={`text-[9px] sm:text-[10px] font-bold ${t.text} uppercase tracking-widest font-orbitron`}>
                  {metric.delta}
                </p>
              </div>
            </article>
          )
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
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
                      <p className="text-[9px] sm:text-[10px] font-black text-cyan-400 uppercase tracking-wider font-orbitron truncate">{phase.name}</p>
                      <p className="text-[9px] text-slate-500 font-orbitron">{phase.count} processed</p>
                    </div>
                  </div>
                  <p className="text-base sm:text-lg font-black text-white font-orbitron shrink-0 ml-2">{phase.percentage}%</p>
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
              <p className="text-slate-600 font-orbitron text-xs italic">No deployment phases configured.</p>
            )}
          </div>
        </section>

        {/* Entity Logistics */}
        <section className="glass-card p-5 sm:p-8 border-white/5 flex flex-col gap-5">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="h-5 w-1 bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
            <h2 className="text-base sm:text-xl font-black text-white tracking-wider font-orbitron uppercase">
              Logistics
            </h2>
          </div>

          {/* Track + Formation */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 bg-slate-900/50 border border-white/5 border-l-2 border-l-cyan-400">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-orbitron mb-3">Track Split</p>
              <div className="space-y-2.5">
                {sortedTracks.slice(0, 3).map(([track, count]) => (
                  <div key={track}>
                    <div className="flex justify-between text-[9px] sm:text-[10px] font-mono text-cyan-400 mb-1">
                      <span className="truncate pr-1">{track}</span>
                      <span className="shrink-0">{count}</span>
                    </div>
                    <div className="h-0.5 w-full bg-slate-800">
                      <div className="h-full bg-cyan-500/50" style={{ width: `${(count/total)*100}%` }} />
                    </div>
                  </div>
                ))}
                {sortedTracks.length === 0 && <p className="text-[10px] text-slate-600 font-mono italic">No data</p>}
              </div>
            </div>

            <div className="p-3 sm:p-4 bg-slate-900/50 border border-white/5 border-l-2 border-l-violet-400 flex flex-col justify-center">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-orbitron mb-3">Formation</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-violet-400 font-mono">Solo</span>
                  <span className="text-sm font-bold text-white font-orbitron">{soloCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-violet-400 font-mono">Squads</span>
                  <span className="text-sm font-bold text-white font-orbitron">{teamUsersCount}</span>
                </div>
                <div className="mt-2 h-1 w-full bg-slate-800 flex">
                  <div className="h-full bg-violet-400" style={{ width: `${total ? (soloCount/total)*100 : 0}%` }} />
                  <div className="h-full bg-violet-600" style={{ width: `${total ? (teamUsersCount/total)*100 : 0}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Validation Spread */}
          <div className="p-3 sm:p-4 border border-white/5 bg-black/20">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-orbitron mb-3">Validation Spread</p>
            <div className="relative h-2 bg-slate-900 border border-white/5 flex overflow-hidden rounded-full">
              <div className="h-full bg-emerald-500 shadow-[0_0_8px_#10b981]" style={{ width: `${total > 0 ? (approved/total)*100 : 0}%` }} />
              <div className="h-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" style={{ width: `${total > 0 ? (pending/total)*100 : 0}%` }} />
              <div className="h-full bg-rose-500" style={{ width: `${total > 0 ? (rejected/total)*100 : 0}%` }} />
            </div>
            <div className="flex flex-wrap justify-between mt-2 gap-2 text-[9px] font-bold text-slate-400 font-orbitron uppercase tracking-widest">
              <span className="text-emerald-400">{approved} Approved</span>
              <span className="text-amber-400">{pending} Pending</span>
              <span className="text-rose-400">{rejected} Rejected</span>
            </div>
          </div>
        </section>
      </div>

      {/* Live Feed + Quick Actions */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 glass-card border-white/5 flex flex-col overflow-hidden">
          <div className="p-3 sm:p-4 border-b border-white/5 bg-slate-900/50 flex justify-between items-center">
            <h3 className="text-xs sm:text-sm font-black text-white font-orbitron tracking-[0.2em] uppercase flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00ffff]" />
              Live Terminal
            </h3>
            <span className="text-[9px] text-cyan-400/50 font-mono uppercase">{registrations.length} signatures</span>
          </div>
          <div className="flex-1 bg-black/40 p-3 sm:p-4 font-mono text-[9px] sm:text-[10px] space-y-2 overflow-y-auto max-h-[220px]">
            {registrations.slice(0, 10).map((reg, idx) => (
              <div key={reg.uid} className="flex gap-2 sm:gap-3 text-slate-400 border-l-2 border-cyan-500/30 pl-2 animate-fade-up" style={{ animationDelay: `${idx * 0.08}s`, animationFillMode: 'both' }}>
                <span className="text-cyan-500/50 shrink-0">[{new Date().toISOString().split('T')[1].slice(0,8)}]</span>
                <span className="text-amber-400 shrink-0">[AUTH]</span>
                <span className="truncate">
                  <span className="text-white">'{reg.name}'</span>{' '}
                  <span className="text-slate-500 hidden sm:inline">→ {reg.team}</span>
                </span>
              </div>
            ))}
            {registrations.length === 0 && (
              <div className="text-cyan-500/50 animate-pulse italic">Waiting for inbound connections...</div>
            )}
            <div className="flex gap-3 text-cyan-400 pl-2 mt-3">
              <span className="shrink-0">[{new Date().toISOString().split('T')[1].slice(0,8)}]</span>
              <span className="animate-pulse">_</span>
            </div>
          </div>
        </div>

        {/* Control Nexus */}
        <div className="glass-card p-5 sm:p-6 border-white/5 bg-cyan-500/[0.02]">
          <h3 className="text-xs sm:text-sm font-black text-white font-orbitron tracking-[0.2em] mb-5 uppercase">Control Nexus</h3>
          <div className="space-y-3">
            {[
              { label: 'Open Registry', sub: 'Manual entity validation', to: '/h/$hackathonId/registrations' },
              { label: 'Team Matrix', sub: 'Coordinate squad deployments', to: '/h/$hackathonId/teams' },
              { label: 'Submissions', sub: 'Audit project deliverables', to: '/h/$hackathonId/submission' },
            ].map(item => (
              <button
                key={item.label}
                onClick={() => navigate({ to: item.to as string, params: { hackathonId } as Record<string, string> })}
                className="w-full text-left p-3 sm:p-4 border border-white/5 hover:border-cyan-400/40 hover:bg-cyan-500/5 transition-all group"
              >
                <p className="text-[10px] font-black text-cyan-400 font-orbitron uppercase tracking-widest">{item.label}</p>
                <p className="text-[9px] text-slate-500 font-orbitron mt-0.5">{item.sub}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}