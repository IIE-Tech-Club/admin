import { useEffect, useState } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import Loader from '../components/ui/Loader'

export type RegistrationStatus = 'Pending' | 'Approved' | 'Rejected' | 'Done'

export type Registration = {
  mongoId: string
  id: string
  participant: string
  email: string
  team: string
  track: string
  checkIn: string
  status: RegistrationStatus
  phases: boolean[]
  responses: Record<string, unknown>
  registrationData: Record<string, unknown>
}

interface Hackathon {
  _id: string
  title: string
  phases: { id: string }[]
}

interface RegistrationResponse {
  _id: string
  registrationDate: string
  status?: RegistrationStatus
  user?: { name?: string; email?: string }
  responses: Record<string, unknown>
}

const statusStyles: Record<RegistrationStatus, { text: string; border: string; bg: string; dot: string }> = {
  Approved: { text: 'text-emerald-400', border: 'border-emerald-400/20', bg: 'bg-emerald-400/5', dot: 'bg-emerald-400 shadow-[0_0_5px_#10b981]' },
  Done:     { text: 'text-cyan-400',    border: 'border-cyan-400/20',    bg: 'bg-cyan-400/5',    dot: 'bg-cyan-400 shadow-[0_0_5px_#00ffff]' },
  Rejected: { text: 'text-rose-400',   border: 'border-rose-400/20',   bg: 'bg-rose-400/5',   dot: 'bg-rose-400' },
  Pending:  { text: 'text-amber-400',  border: 'border-amber-400/20',  bg: 'bg-amber-400/5',  dot: 'bg-amber-400 animate-pulse' },
}

export function RegistrationsPage() {
  const { hackathonId } = useParams({ from: '/h/$hackathonId' })
  const [data, setData] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [hackathonData, setHackathonData] = useState<Hackathon | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const hRes = await fetch(`${import.meta.env.VITE_API_URL}/hackathons/${hackathonId}`)
        const hackathon = await hRes.json()
        setHackathonData(hackathon)

        const response = await fetch(`${import.meta.env.VITE_API_URL}/registrations/${hackathonId}`)
        const registrations = await response.json()
        const phases = hackathon.phases || []

        const formattedUsers: Registration[] = (registrations as RegistrationResponse[]).map((reg) => {
          const responses = reg.responses || {}
          let name = reg.user?.name || 'Unknown'
          let email = reg.user?.email || 'N/A'
          let track = 'General'
          let team = 'Individual'

          const registrationData = (responses['phase_1_registration'] || {}) as Record<string, unknown>

          Object.values(responses).forEach((data) => {
            if (data && typeof data === 'object') {
              const d = data as Record<string, unknown>
              if (d.name && name === 'Unknown') name = String(d.name)
              if (d.email && email === 'N/A') email = String(d.email)
              if (d.branch) track = String(d.branch)
              if (d.teamName) team = String(d.teamName)
            }
          })

          return {
            mongoId: reg._id,
            id: reg._id.substring(reg._id.length - 8).toUpperCase(),
            participant: name,
            email,
            team,
            track,
            checkIn: new Date(reg.registrationDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: reg.status || 'Pending',
            phases: phases.map((p: { id: string }) => responses[p.id] !== undefined),
            responses,
            registrationData,
          }
        })

        setData(formattedUsers)
      } catch (error) {
        console.error('Failed to fetch registrations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRegistrations()
  }, [hackathonId])

  const filteredData = data.filter(item => {
    const matchesSearch =
      item.participant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const pendingCount = data.filter(u => u.status === 'Pending').length
  const approvedCount = data.filter(u => u.status === 'Approved' || u.status === 'Done').length

  return (
    <section className="space-y-5 pb-16">
      {/* Header */}
      <header className="glass-card p-5 sm:p-8 border-cyan-500/20">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400 font-orbitron mb-2">
          Identity Management
        </p>
        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight font-orbitron">
          Registry <span className="text-cyan-400 text-glow">Manifest</span>
        </h1>
        {hackathonData && (
          <p className="mt-1 text-[10px] text-slate-500 font-mono tracking-widest">
            NODE: {hackathonData.title.toUpperCase()}
          </p>
        )}
        <p className="mt-3 text-xs sm:text-sm text-slate-400 font-medium tracking-wide">
          Manage and review participant enrollment across the arena.
        </p>
      </header>

      {/* Stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2">
        <article className="glass-card p-4 sm:p-6 border-cyan-500/10 hover:border-cyan-500/30 transition-all">
          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500 font-orbitron">Queue Size</p>
          <p className="mt-2 sm:mt-3 text-3xl sm:text-5xl font-black text-white font-orbitron">{data.length}</p>
          <div className="mt-3 flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-orange-500 animate-pulse shadow-[0_0_5px_#ff7300]" />
            <p className="text-[9px] sm:text-[10px] font-bold text-orange-400 uppercase tracking-widest">{pendingCount} need validation</p>
          </div>
        </article>
        <article className="glass-card p-4 sm:p-6 border-cyan-500/10 hover:border-cyan-500/30 transition-all">
          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500 font-orbitron">Approved</p>
          <p className="mt-2 sm:mt-3 text-3xl sm:text-5xl font-black text-white font-orbitron">{approvedCount}</p>
          <div className="mt-3 flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-cyan-400 shadow-[0_0_5px_#00ffff]" />
            <p className="text-[9px] sm:text-[10px] font-bold text-cyan-400 uppercase tracking-widest">In the arena</p>
          </div>
        </article>
      </div>

      {/* Table Card */}
      <article className="glass-card border-cyan-500/10 overflow-hidden">
        {/* Table Header */}
        <div className="p-4 sm:p-6 border-b border-cyan-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-6 w-1 bg-cyan-400 shadow-[0_0_10px_#00ffff]" />
            <h2 className="text-base sm:text-xl font-black text-white tracking-wider font-orbitron">Entity Registry</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-cyan-500/20 px-3 py-2 text-[10px] font-orbitron tracking-widest text-cyan-400 focus:border-cyan-400 outline-none"
            >
              <option value="All">ALL STATUS</option>
              <option value="Pending">PENDING</option>
              <option value="Approved">APPROVED</option>
              <option value="Rejected">REJECTED</option>
              <option value="Done">DONE</option>
            </select>
            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="SEARCH..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-slate-900 border border-cyan-500/20 pl-8 pr-4 py-2 text-[10px] font-orbitron tracking-widest text-cyan-400 focus:border-cyan-400 outline-none w-full sm:w-52"
              />
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block soft-scrollbar overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr className="text-left border-b border-white/5">
                <th className="pb-3 px-4 pt-4 text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 font-orbitron">UID</th>
                <th className="pb-3 px-4 pt-4 text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 font-orbitron">Participant</th>
                <th className="pb-3 px-4 pt-4 text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 font-orbitron">Squad</th>
                <th className="pb-3 px-4 pt-4 text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 font-orbitron">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-10">
                    <Loader text="Fetching encrypted data..." />
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-600 font-orbitron text-xs uppercase tracking-widest">
                    No matching records found
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => {
                  const s = statusStyles[row.status]
                  return (
                    <tr
                      key={row.mongoId}
                      onClick={() => navigate({ to: '/h/$hackathonId/registrations/$registrationId', params: { hackathonId, registrationId: row.mongoId } })}
                      className="group hover:bg-cyan-500/[0.04] transition-all cursor-pointer"
                    >
                      <td className="py-4 px-4 text-[10px] font-bold text-cyan-400 font-orbitron tracking-widest">{row.id}</td>
                      <td className="py-4 px-4">
                        <p className="text-xs font-black text-white uppercase tracking-widest font-orbitron group-hover:text-cyan-400 transition-colors">{row.participant}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{row.email}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-xs font-bold text-slate-400 tracking-wide uppercase font-orbitron">{row.team}</p>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase border ${s.text} ${s.border} ${s.bg}`}>
                          <span className={`h-1 w-1 rounded-full ${s.dot}`} />
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List */}
        <div className="sm:hidden divide-y divide-white/5">
          {loading ? (
            <div className="py-10">
              <Loader text="Fetching data..." />
            </div>
          ) : filteredData.length === 0 ? (
            <div className="py-12 text-center text-slate-600 font-orbitron text-xs uppercase tracking-widest">
              No matching records
            </div>
          ) : (
            filteredData.map((row) => {
              const s = statusStyles[row.status]
              return (
                <div
                  key={row.mongoId}
                  onClick={() => navigate({ to: '/h/$hackathonId/registrations/$registrationId', params: { hackathonId, registrationId: row.mongoId } })}
                  className="p-4 hover:bg-cyan-500/[0.04] active:bg-cyan-500/[0.08] transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black text-white uppercase tracking-wide font-orbitron truncate">{row.participant}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 truncate">{row.email}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[9px] text-cyan-400/60 font-orbitron font-bold">{row.id}</span>
                        <span className="text-[9px] text-slate-600 font-mono truncate">{row.team}</span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase border shrink-0 ${s.text} ${s.border} ${s.bg}`}>
                      <span className={`h-1 w-1 rounded-full ${s.dot}`} />
                      {row.status}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer count */}
        {!loading && (
          <div className="px-4 sm:px-6 py-3 border-t border-white/5 bg-slate-900/30">
            <p className="text-[9px] text-slate-600 font-orbitron uppercase tracking-widest">
              Showing {filteredData.length} of {data.length} entities
            </p>
          </div>
        )}
      </article>
    </section>
  )
}