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
  user?: {
    name?: string
    email?: string
  }
  responses: Record<string, unknown>
}

export function RegistrationsPage() {
  const { hackathonId } = useParams({ from: '/h/$hackathonId' })
  const [data, setData] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)

  const [hackathonData, setHackathonData] = useState<Hackathon | null>(null)

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
            
            // Try to find identity info from any form phase
            let name = reg.user?.name || 'Unknown'
            let email = reg.user?.email || 'N/A'
            let track = 'General'
            let team = 'Individual'

            const registrationData = (responses['phase_1_registration'] || {}) as Record<string, unknown>

            // Fallback heuristics to extract info from dynamic forms
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
              email: email,
              team: team,
              track: track,
              checkIn: new Date(reg.registrationDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              status: reg.status || 'Pending',
              phases: phases.map((p: { id: string }) => responses[p.id] !== undefined),
              responses: responses,
              registrationData: registrationData
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

  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredData = data.filter(item => 
    item.participant.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const pendingCount = data.filter(u => u.status === 'Pending').length
  const approvedCount = data.filter(u => u.status === 'Approved' || u.status === 'Done').length

  return (
    <section className="space-y-8">
      <header className="glass-card p-8 border-cyan-500/20">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400 font-orbitron mb-2">
          Identity Management
        </p>
        <h1 className="text-4xl font-black text-white md:text-5xl tracking-tight font-orbitron">
          Registry <span className="text-cyan-400 text-glow">Manifest</span>
          {hackathonData && (
            <span className="block text-sm text-slate-500 mt-2 font-mono tracking-widest opacity-60">
              NODE: {hackathonData.title.toUpperCase()}
            </span>
          )}
        </h1>
        <p className="mt-4 text-sm text-slate-400 font-medium tracking-wide">
          Manage and review participant enrollment and onboarding across the arena.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="glass-card p-6 border-cyan-500/10 hover:border-cyan-500/30 transition-all">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500 font-orbitron">Queue Size</p>
          <p className="mt-3 text-5xl font-black text-white font-orbitron">{data.length}</p>
          <div className="mt-4 flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-orange-500 shadow-[0_0_5px_#ff7300] animate-pulse" />
            <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">{pendingCount} validation required</p>
          </div>
        </article>
        <article className="glass-card p-6 border-cyan-500/10 hover:border-cyan-500/30 transition-all">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500 font-orbitron">Approved</p>
          <p className="mt-3 text-5xl font-black text-white font-orbitron">{approvedCount}</p>
          <div className="mt-4 flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-cyan-400 shadow-[0_0_5px_#00ffff]" />
            <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">In the arena</p>
          </div>
        </article>
      </div>

      <div className="grid gap-6">
        <article className="glass-card p-8 border-cyan-500/10">
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between border-b border-cyan-500/10 pb-6 gap-4">
            <div className="flex items-center gap-4">
              <div className="h-8 w-1 bg-cyan-400 shadow-[0_0_15px_#00ffff]" />
              <h2 className="text-2xl font-black text-white tracking-widest font-orbitron">Entity Registry</h2>
            </div>
            <div className="relative">
              <input 
                type="text"
                placeholder="SEARCH MANIFEST..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-900 border border-cyan-500/20 px-4 py-2 text-[10px] font-orbitron tracking-widest text-cyan-400 focus:border-cyan-400 outline-none w-full md:w-64"
              />
            </div>
          </div>

          <div className="soft-scrollbar overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse">
              <thead>
                <tr className="text-left border-b border-white/5">
                  <th className="pb-4 px-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 font-orbitron">Entity UID</th>
                  <th className="pb-4 px-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 font-orbitron">Participant</th>
                  <th className="pb-4 px-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 font-orbitron">Squad</th>
                  <th className="pb-4 px-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 font-orbitron">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-10">
                      <Loader text="Fetching encrypted data..." />
                    </td>
                  </tr>
                ) : (
                  filteredData.map((row) => (
                    <tr 
                      key={row.mongoId} 
                      onClick={() => navigate({ 
                        to: '/h/$hackathonId/registrations/$registrationId', 
                        params: { hackathonId, registrationId: row.mongoId } 
                      })}
                      className="group hover:bg-cyan-500/[0.05] transition-all cursor-pointer border-b border-white/5 last:border-0"
                    >
                      <td className="py-5 px-4 text-[10px] font-bold text-cyan-400 font-orbitron tracking-widest">
                        {row.id}
                      </td>
                      <td className="py-5 px-4">
                        <p className="text-xs font-black text-white uppercase tracking-widest font-orbitron group-hover:text-cyan-400 transition-colors">{row.participant}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{row.email}</p>
                        <p className="text-[9px] font-mono text-slate-600 mt-1">{row.checkIn}</p>
                      </td>
                      <td className="py-5 px-4">
                         <p className="text-xs font-bold text-slate-400 tracking-wide uppercase font-orbitron">{row.team}</p>
                      </td>
                      <td className="py-5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[9px] font-bold tracking-widest uppercase border ${
                          row.status === 'Approved' ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5' :
                          row.status === 'Done' ? 'text-cyan-400 border-cyan-400/20 bg-cyan-400/5' :
                          row.status === 'Rejected' ? 'text-rose-400 border-rose-400/20 bg-rose-400/5' :
                          'text-amber-400 border-amber-400/20 bg-amber-400/5'
                        }`}>
                          <span className={`h-1 w-1 rounded-full ${
                            row.status === 'Approved' ? 'bg-emerald-400 shadow-[0_0_5px_#10b981]' :
                            row.status === 'Done' ? 'bg-cyan-400 shadow-[0_0_5px_#00ffff]' :
                            row.status === 'Rejected' ? 'bg-rose-400' :
                            'bg-amber-400 animate-pulse'
                          }`} />
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>
      </div>
    </section>
  )
}