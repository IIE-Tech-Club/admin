import { useEffect, useState } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import Loader from '../components/ui/Loader'

type TeamStatus = 'Building' | 'Review' | 'Blocked'

type Team = {
  name: string
  members: number
  track: string
  progress: number
  velocity: number
  status: TeamStatus
}

interface Hackathon {
  _id: string
  title: string
}

interface RegistrationResponse {
  _id: string
  responses: Record<string, unknown>
}

export function TeamsPage() {
  const { hackathonId } = useParams({ from: '/h/$hackathonId' })
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const [hackathonData, setHackathonData] = useState<Hackathon | null>(null)

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const hRes = await fetch(`${import.meta.env.VITE_API_URL}/hackathons/${hackathonId}`)
        const hackathon = await hRes.json()
        setHackathonData(hackathon)

        const response = await fetch(`${import.meta.env.VITE_API_URL}/registrations/${hackathonId}`)
        const registrations = await response.json()
        
        const teamMap = new Map<string, Team>();
        
        (registrations as RegistrationResponse[]).forEach((reg) => {
          const responses = reg.responses || {}
          let teamName = ''
          let membersCount = 1
          let track = 'General'
          
          const teamFormationData = responses['phase_2_team_formation'] as Record<string, unknown> | undefined
          const registrationData = responses['phase_1_registration'] as Record<string, unknown> | undefined

          if (teamFormationData) {
            teamName = String(teamFormationData.teamName || '')
            membersCount = parseInt(String(teamFormationData.teamSize || '1')) || 1
            track = String(teamFormationData.role || 'General')
          } else if (registrationData) {
            teamName = String(registrationData.teamName || '')
            track = String(registrationData.branch || 'General')
          }
          
          if (!teamName) {
            Object.values(responses).forEach((data) => {
                if (data && typeof data === 'object') {
                    const d = data as Record<string, unknown>
                    if (d.teamName) teamName = String(d.teamName)
                }
            })
          }

          if (teamName) {
            const existing = teamMap.get(teamName)
            if (existing) {
              if (teamFormationData) {
                  existing.members = membersCount
                  existing.track = track
              }
            } else {
              teamMap.set(teamName, {
                name: teamName,
                members: membersCount,
                track: track,
                progress: 0,
                velocity: 0,
                status: 'Building'
              })
            }
          }
        })

        setTeams(Array.from(teamMap.values()))
      } catch (error) {
        console.error('Failed to fetch teams:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchTeams()
  }, [hackathonId])

  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.track.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <section className="space-y-5 pb-16">
      <header className="glass-card p-5 sm:p-8 border-cyan-500/20">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400 font-orbitron mb-2">
          Tactical Units
        </p>
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight font-orbitron">
          Team <span className="text-cyan-400 text-glow">Roster</span>
        </h1>
        {hackathonData && (
          <p className="mt-1 text-[10px] text-slate-500 font-mono tracking-widest uppercase">
            NODE: {hackathonData.title}
          </p>
        )}
        <p className="mt-3 text-xs sm:text-sm text-slate-400 font-medium tracking-wide">
          Active tactical units deployed across the arena.
        </p>
      </header>

      <article className="glass-card border-cyan-500/10 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-cyan-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-5 w-1 bg-cyan-400 shadow-[0_0_10px_#00ffff]" />
            <h2 className="text-base sm:text-xl font-black text-white tracking-wider font-orbitron">Active Squads</h2>
          </div>

          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="SEARCH SQUADS..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-cyan-500/20 pl-8 pr-4 py-2 text-[10px] font-orbitron tracking-widest text-cyan-400 focus:border-cyan-400 outline-none w-full sm:w-52"
            />
          </div>
        </div>

        <div className="soft-scrollbar overflow-x-auto">
          <table className="w-full min-w-[400px] border-collapse">
            <thead>
              <tr className="text-left border-b border-white/5">
                <th className="pb-4 px-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 font-orbitron">Squad Name</th>
                <th className="pb-4 px-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 font-orbitron">Track / Role</th>
                <th className="pb-4 px-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 font-orbitron">Strength</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={3} className="py-10">
                    <Loader text="Syncing tactical units..." />
                  </td>
                </tr>
              ) : teams.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-10 text-center text-xs text-slate-600 uppercase tracking-widest font-orbitron">
                    No squads detected in arena
                  </td>
                </tr>
              ) : (
                filteredTeams.map((team) => (
                  <tr key={team.name} className="group hover:bg-cyan-500/[0.02] transition-colors relative">
                    <td className="py-5 px-4 text-[10px] font-bold text-cyan-400 font-orbitron tracking-widest">
                      {team.name}
                      <Link to="/h/$hackathonId/teams/$teamName" params={{ hackathonId, teamName: team.name }} className="absolute inset-0 z-10" />
                    </td>
                    <td className="py-5 px-4">
                      <p className="text-xs font-black text-white uppercase tracking-widest font-orbitron">{team.track}</p>
                    </td>
                    <td className="py-5 px-4">
                      <span className="text-xs font-black text-white font-orbitron">{team.members} UNITS</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  )
}
