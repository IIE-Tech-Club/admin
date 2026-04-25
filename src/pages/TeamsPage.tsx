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

export function TeamsPage() {
  const { hackathonId } = useParams({ from: '/h/$hackathonId' })
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)

  const [hackathonData, setHackathonData] = useState<any>(null)

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const hRes = await fetch(`${import.meta.env.VITE_API_URL}/hackathons/${hackathonId}`)
        const hackathon = await hRes.json()
        setHackathonData(hackathon)

        const response = await fetch(`${import.meta.env.VITE_API_URL}/registrations/${hackathonId}`)
        const registrations = await response.json()
        
        const teamMap = new Map<string, Team>()
        
        registrations.forEach((reg: any) => {
          const responses = reg.responses || {}
          let teamName = ''
          let membersCount = 1
          let track = 'General'
          
          const teamFormationData = responses['phase_2_team_formation']
          const registrationData = responses['phase_1_registration']

          if (teamFormationData) {
            teamName = teamFormationData.teamName
            membersCount = parseInt(teamFormationData.teamSize) || 1
            track = teamFormationData.role 
          } else if (registrationData) {
            teamName = registrationData.teamName
            track = registrationData.branch || 'General'
          }
          
          if (!teamName) {
            Object.values(responses).forEach((data: any) => {
                if (typeof data === 'object' && data !== null && data.teamName) {
                    teamName = data.teamName
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

  return (
    <section className="space-y-8">
      <header className="glass-card p-8 border-cyan-500/20">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400 font-orbitron mb-2">
          Tactical Units
        </p>
        <h1 className="text-4xl font-black text-white md:text-5xl tracking-tight font-orbitron">
          Team <span className="text-cyan-400 text-glow">Roster</span>
          {hackathonData && (
            <span className="block text-sm text-slate-500 mt-2 font-mono tracking-widest opacity-60 uppercase">
              NODE: {hackathonData.title}
            </span>
          )}
        </h1>
        <p className="mt-4 text-sm text-slate-400 font-medium tracking-wide">
          Manage and review the active tactical units deployed across the arena.
        </p>
      </header>

      <article className="glass-card p-8 border-cyan-500/10">
        <div className="mb-8 flex items-center gap-4 border-b border-cyan-500/10 pb-6">
          <div className="h-8 w-1 bg-cyan-400 shadow-[0_0_15px_#00ffff]" />
          <h2 className="text-2xl font-black text-white tracking-widest font-orbitron">Active Squads</h2>
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
                teams.map((team) => (
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
