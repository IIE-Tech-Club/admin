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
}

type PhaseStat = {
  id: string
  name: string
  count: number
  percentage: number
}

type BackendUser = {
  uid: string
  name: string
  email: string
  status: RegistrationStatus
  team: string
  track: string
  responses: any
}

type Hackathon = {
    id: string
    title: string
    creatorId: string
    creatorEmail: string
    phases: any[]
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

        if (hRes.ok) {
            setHackathon(hData)
        } else {
            console.error("Hackathon fetch failed:", hData);
            setHackathon(null);
        }
        
        // Safety check: Ensure registrations data is an array
        if (!Array.isArray(rData)) {
            console.error("Expected array for registrations, got:", rData);
            setRegistrations([]);
            return;
        }

        const formatted: BackendUser[] = rData.map((reg: any) => {
            const responses = reg.responses || {}
            let name = reg.user?.name || 'Unknown'
            let email = reg.user?.email || 'N/A'
            let track = 'General'
            let team = 'Individual'

            Object.values(responses).forEach((data: any) => {
                if (typeof data === 'object' && data !== null) {
                    if (data.name && name === 'Unknown') name = data.name
                    if (data.email && email === 'N/A') email = data.email
                    if (data.branch) track = data.branch
                    if (data.teamName) team = data.teamName
                }
            })

            return {
              uid: reg.userId,
              name,
              email,
              status: reg.status || 'Pending',
              team,
              track,
              responses
            }
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
          <div className="flex flex-col items-center justify-center min-h-[400px] font-orbitron">
              <Loader text="Initializing Command Center..." />
          </div>
      )
  }

  // Calculate Stats
  const total = registrations.length
  const approved = registrations.filter(r => r.status === 'Approved').length
  const pending = registrations.filter(r => r.status === 'Pending').length
  
  const phaseStats: PhaseStat[] = (hackathon?.phases || []).map(phase => {
      const count = registrations.filter(r => r.responses && r.responses[phase.id]).length
      return {
          id: phase.id,
          name: phase.name,
          count,
          percentage: total > 0 ? Math.round((count / total) * 100) : 0
      }
  })

  const metrics: Metric[] = [
    { label: 'Total Entities', value: String(total), delta: 'Deployed in system', tone: 'cyan' },
    { label: 'Validation Rate', value: `${total > 0 ? Math.round((approved / total) * 100) : 0}%`, delta: `${pending} awaiting review`, tone: 'emerald' },
    { label: 'Active Teams', value: String(new Set(registrations.filter(r => r.team !== 'Individual').map(r => r.team)).size), delta: 'Squad formations', tone: 'amber' },
    { label: 'Network Phases', value: String(hackathon?.phases?.length || 0), delta: 'Active routing nodes', tone: 'rose' },
  ]

  // Track Distribution
  const trackCounts = registrations.reduce((acc, r) => {
      const track = r.track || 'General'
      acc[track] = (acc[track] || 0) + 1
      return acc
  }, {} as Record<string, number>)
  const sortedTracks = Object.entries(trackCounts).sort((a, b) => b[1] - a[1])

  // Team vs Solo
  const soloCount = registrations.filter(r => r.team === 'Individual').length
  const teamUsersCount = total - soloCount

  const isCreator = user?.uid === hackathon?.creatorId

  if (!isCreator) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] font-orbitron p-8 text-center">
            <div className="h-20 w-20 bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-6 rounded-full shadow-[0_0_20px_rgba(244,63,94,0.2)]">
                <svg className="w-10 h-10 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h2 className="text-3xl font-black text-white tracking-widest uppercase mb-4">Access Restricted</h2>
            <p className="text-slate-500 max-w-md text-sm leading-relaxed mb-8">
                Deployment Node [ {hackathonId} ] is encrypted. Only the authorized creator [ {hackathon?.creatorEmail} ] can access this intelligence terminal.
            </p>
            <button 
                onClick={() => navigate({ to: '/' })}
                className="neon-btn-cyan !px-12"
            >
                RETURN TO CENTRAL COMMAND
            </button>
        </div>
    )
  }

  return (
    <section className="space-y-8 pb-20">
      {/* Dynamic Header */}
      <div className="glass-card relative overflow-hidden p-8 border-cyan-500/20">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-[100px]" />
        
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/30 text-[9px] text-cyan-400 font-orbitron font-bold tracking-widest uppercase">Live Node</span>
                <span className="text-[10px] text-slate-500 font-orbitron font-bold tracking-widest uppercase italic">Creator: {hackathon?.creatorEmail}</span>
            </div>
            <h1 className="text-4xl font-black text-white md:text-5xl tracking-tighter font-orbitron uppercase">
                {hackathon?.title} <span className="text-cyan-400 text-glow">Dashboard</span>
            </h1>
            <p className="mt-4 text-slate-400 text-sm font-medium font-orbitron tracking-wide max-w-xl">
                Global operational intelligence for hackathon lifecycle management. 
                Monitor phase transitions and validate entity deployments in real-time.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => navigate({ to: '/h/$hackathonId/settings', params: { hackathonId } })}
                className="neon-btn-cyan !py-3 !px-8"
              >
                RECONFIGURE PHASES
              </button>
          </div>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <article key={metric.label} className="glass-card p-6 border-white/5 hover:border-cyan-500/20 transition-all">
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500 font-orbitron mb-4">{metric.label}</p>
            <p className="text-5xl font-black text-white font-orbitron tracking-tighter">{metric.value}</p>
            <div className="mt-4 flex items-center gap-2">
                <div className={`h-1 w-4 ${metric.tone === 'emerald' ? 'bg-emerald-500' : metric.tone === 'cyan' ? 'bg-cyan-500' : metric.tone === 'amber' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                <p className="text-[10px] font-bold text-slate-400 font-orbitron uppercase tracking-widest">{metric.delta}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Phase Completion Analysis */}
        <section className="glass-card p-8 border-white/5 relative group">
            <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-4">
                <div className="h-6 w-1 bg-cyan-400 shadow-[0_0_10px_#00ffff]" />
                <h2 className="text-xl font-black text-white tracking-widest font-orbitron uppercase">Phase Synchronization</h2>
            </div>
            
            <div className="space-y-6">
                {phaseStats.map((phase, idx) => (
                    <div key={phase.id} className="relative">
                        {idx !== 0 && (
                            <div className="absolute -top-6 left-2 w-0.5 h-6 bg-cyan-900/50" />
                        )}
                        <div className="flex justify-between items-end mb-2">
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 border border-cyan-500/50 flex items-center justify-center text-[8px] text-cyan-400 font-orbitron font-bold">
                                    {idx + 1}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest font-orbitron">{phase.name}</p>
                                    <p className="text-[9px] text-slate-500 font-bold font-orbitron">{phase.count} Entities Processed</p>
                                </div>
                            </div>
                            <p className="text-lg font-black text-white font-orbitron">{phase.percentage}%</p>
                        </div>
                        <div className="h-1.5 w-full bg-slate-900 border border-white/5 overflow-hidden rounded-r-full">
                            <div 
                                className="h-full bg-cyan-400 transition-all duration-1000 ease-out relative shadow-[0_0_10px_#00ffff]"
                                style={{ width: `${phase.percentage}%` }}
                            >
                                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.4)_50%,transparent_100%)] animate-[scanline_2s_infinite_linear]" />
                            </div>
                        </div>
                    </div>
                ))}
                {phaseStats.length === 0 && (
                    <p className="text-slate-500 font-orbitron text-xs italic">No deployment phases configured for this node.</p>
                )}
            </div>
        </section>

        {/* Deployment Status Distribution */}
        <section className="glass-card p-8 border-white/5 flex flex-col justify-between relative group">
            <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div>
                <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-4">
                    <div className="h-6 w-1 bg-amber-400 shadow-[0_0_10px_#ff7300]" />
                    <h2 className="text-xl font-black text-white tracking-widest font-orbitron uppercase">Entity Logistics</h2>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 bg-slate-900/50 border border-white/5 border-l-cyan-400 border-l-2">
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-orbitron mb-2">Track Distribution</p>
                        <div className="space-y-3">
                            {sortedTracks.slice(0, 3).map(([track, count]) => (
                                <div key={track}>
                                    <div className="flex justify-between text-[10px] font-mono text-cyan-400 mb-1">
                                        <span className="truncate pr-2">{track}</span>
                                        <span>{count}</span>
                                    </div>
                                    <div className="h-0.5 w-full bg-slate-800">
                                        <div className="h-full bg-cyan-500/50" style={{ width: `${(count/total)*100}%` }} />
                                    </div>
                                </div>
                            ))}
                            {sortedTracks.length === 0 && <p className="text-[10px] text-slate-600 font-mono italic">No data</p>}
                        </div>
                    </div>

                    <div className="p-4 bg-slate-900/50 border border-white/5 border-l-violet-400 border-l-2 flex flex-col justify-center">
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-orbitron mb-4">Formation Structure</p>
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-[10px] text-violet-400 font-mono">Solo Operatives</span>
                            <span className="text-sm font-bold text-white font-orbitron">{soloCount}</span>
                        </div>
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] text-violet-400 font-mono">Squad Members</span>
                            <span className="text-sm font-bold text-white font-orbitron">{teamUsersCount}</span>
                        </div>
                        <div className="mt-4 h-1 w-full bg-slate-800 flex">
                            <div className="h-full bg-violet-400" style={{ width: `${total ? (soloCount/total)*100 : 0}%` }} />
                            <div className="h-full bg-violet-600" style={{ width: `${total ? (teamUsersCount/total)*100 : 0}%` }} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 border border-white/5 bg-black/20">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-orbitron mb-3">Validation Spread</p>
                <div className="relative h-2 bg-slate-900 border border-white/5 flex overflow-hidden rounded-full">
                    <div className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]" style={{ width: `${total > 0 ? (approved/total)*100 : 0}%` }} />
                    <div className="h-full bg-amber-500 shadow-[0_0_10px_#f59e0b]" style={{ width: `${total > 0 ? (pending/total)*100 : 0}%` }} />
                    <div className="h-full bg-rose-500 shadow-[0_0_10px_#f43f5e]" style={{ width: `${total > 0 ? (registrations.filter(r => r.status === 'Rejected').length/total)*100 : 0}%` }} />
                </div>
                <div className="flex justify-between mt-3 text-[9px] font-bold text-slate-400 font-orbitron uppercase tracking-widest">
                    <span className="text-emerald-400">{approved} Approved</span>
                    <span className="text-amber-400">{pending} Pending</span>
                    <span className="text-rose-400">{registrations.filter(r => r.status === 'Rejected').length} Rejected</span>
                </div>
            </div>
        </section>
      </div>

      {/* Quick Actions / Activity Header */}
      <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 glass-card p-0 border-white/5 flex flex-col">
              <div className="p-4 border-b border-white/5 bg-slate-900/50 flex justify-between items-center">
                <h3 className="text-sm font-black text-white font-orbitron tracking-[0.2em] uppercase flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00ffff]" />
                    Live Terminal Feed
                </h3>
                <span className="text-[9px] text-cyan-400/50 font-mono uppercase">Monitoring {registrations.length} signatures</span>
              </div>
              <div className="flex-1 bg-black/40 p-4 font-mono text-[10px] space-y-2 overflow-y-auto max-h-[250px] relative">
                  <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-[linear-gradient(rgba(0,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_4px]" />
                  {registrations.slice(0, 10).map((reg, idx) => (
                      <div key={reg.uid} className="flex gap-3 text-slate-400 border-l-2 border-cyan-500/30 pl-2 animate-fade-up" style={{ animationDelay: `${idx * 0.1}s`, animationFillMode: 'both' }}>
                          <span className="text-cyan-500/50 shrink-0">[{new Date().toISOString().split('T')[1].slice(0,8)}]</span>
                          <span className="text-amber-400 shrink-0">[AUTH]</span>
                          <span className="truncate">
                              Entity <span className="text-white">'{reg.name}'</span> registered under <span className="text-cyan-300">'{reg.team}'</span> 
                              <span className="text-slate-500"> // {reg.email}</span>
                          </span>
                      </div>
                  ))}
                  {registrations.length === 0 && (
                      <div className="text-cyan-500/50 animate-pulse italic">Waiting for inbound connections...</div>
                  )}
                  <div className="flex gap-3 text-cyan-400 pl-2 mt-4">
                      <span className="shrink-0">[{new Date().toISOString().split('T')[1].slice(0,8)}]</span>
                      <span className="animate-pulse">_</span>
                  </div>
              </div>
          </div>

          <div className="glass-card p-8 border-white/5 bg-cyan-500/[0.02]">
              <h3 className="text-sm font-black text-white font-orbitron tracking-[0.2em] mb-6 uppercase">Control Nexus</h3>
              <div className="space-y-4">
                  <button onClick={() => navigate({ to: '/h/$hackathonId/registrations', params: { hackathonId } })} className="w-full text-left p-4 border border-white/5 hover:border-cyan-400/50 transition-colors group">
                      <p className="text-[10px] font-black text-cyan-400 font-orbitron uppercase tracking-widest">Open Registry</p>
                      <p className="text-[9px] text-slate-500 font-orbitron mt-1">Manual entity validation</p>
                  </button>
                  <button onClick={() => navigate({ to: '/h/$hackathonId/teams', params: { hackathonId } })} className="w-full text-left p-4 border border-white/5 hover:border-cyan-400/50 transition-colors group">
                      <p className="text-[10px] font-black text-cyan-400 font-orbitron uppercase tracking-widest">Team Matrix</p>
                      <p className="text-[9px] text-slate-500 font-orbitron mt-1">Coordinate squad deployments</p>
                  </button>
                  <button onClick={() => navigate({ to: '/h/$hackathonId/submission', params: { hackathonId } })} className="w-full text-left p-4 border border-white/5 hover:border-cyan-400/50 transition-colors group">
                      <p className="text-[10px] font-black text-cyan-400 font-orbitron uppercase tracking-widest">Submissions</p>
                      <p className="text-[9px] text-slate-500 font-orbitron mt-1">Audit project deliverables</p>
                  </button>
              </div>
          </div>
      </div>
    </section>
  )
}