import { useEffect, useState } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import Loader from '../components/ui/Loader'

type SubmissionItem = {
  id: string
  regId: string
  team: string
  project: string
  submittedAt: string
  scoreRisk: string
  link: string
}

interface RegistrationResponse {
  _id: string
  registrationDate: string
  responses: Record<string, unknown>
  status?: string
}

export function SubmissionPage() {
  const { hackathonId } = useParams({ from: '/h/$hackathonId' })
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/registrations/${hackathonId}`)
        const registrations = await response.json()
        
        // Use a Map to group submissions by team name
        const teamSubmissions = new Map<string, SubmissionItem>();

        (registrations as RegistrationResponse[]).forEach((reg) => {
          const responses = reg.responses || {}
          const submissionData = responses['phase_3_submissions'] as Record<string, unknown> | undefined
          
          // Only proceed if there is actual submission data
          if (submissionData) {
            const teamData = responses['phase_2_team_formation'] as Record<string, unknown> | undefined
            const regData = responses['phase_1_registration'] as Record<string, unknown> | undefined
            const teamName = (teamData?.teamName as string) || (regData?.teamName as string) || 'Individual'
            
            // Only add if this team hasn't been added yet (or update if needed)
            if (!teamSubmissions.has(teamName)) {
              teamSubmissions.set(teamName, {
                id: reg._id.substring(reg._id.length - 8).toUpperCase(),
                regId: reg._id,
                team: teamName,
                project: (submissionData.projectName as string) || 'Untitled Project',
                submittedAt: new Date(reg.registrationDate).toLocaleDateString(),
                scoreRisk: reg.status === 'Approved' ? 'Low Risk' : 'Medium Risk',
                link: (submissionData.repoLink as string) || (submissionData.demoLink as string) || '#'
              })
            }
          }
        })

        setSubmissions(Array.from(teamSubmissions.values()))
      } catch (error) {
        console.error('Failed to fetch submissions:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchSubmissions()
  }, [hackathonId])

  return (
    <section className="space-y-5 pb-16">
      <header className="glass-card p-5 sm:p-8 border-cyan-500/20">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400 font-orbitron mb-2">
          Submission Protocol
        </p>
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight font-orbitron">
          Submission <span className="text-cyan-400 text-glow">Archive</span>
        </h1>
        <p className="mt-3 text-xs sm:text-sm text-slate-400 font-medium tracking-wide">
          Project artifacts submitted by participants during the final phase.
        </p>
      </header>

      <article className="glass-card border-cyan-500/10 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-cyan-500/10 flex items-center gap-3">
          <div className="h-5 w-1 bg-cyan-400 shadow-[0_0_10px_#00ffff]" />
          <h2 className="text-base sm:text-xl font-black text-white tracking-wider font-orbitron">Packet Stream</h2>
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block soft-scrollbar overflow-x-auto">
          <table className="w-full min-w-[400px] border-collapse">
            <thead>
              <tr className="text-left border-b border-white/5">
                <th className="pb-4 px-4 pt-4 text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 font-orbitron">Packet UID</th>
                <th className="pb-4 px-4 pt-4 text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 font-orbitron">Deployment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={2} className="py-10">
                    <Loader text="Scanning neural links..." />
                  </td>
                </tr>
              ) : submissions.length === 0 ? (
                <tr>
                  <td colSpan={2} className="py-10 text-center text-xs text-slate-600 uppercase tracking-widest font-orbitron">
                    No packets detected in stream
                  </td>
                </tr>
              ) : (
                submissions.map((item) => (
                  <tr key={item.regId} className="group hover:bg-cyan-500/[0.02] transition-colors relative">
                    <td className="py-5 px-4 text-[10px] font-bold text-cyan-400 font-orbitron tracking-widest">
                      {item.id}
                      <Link to="/h/$hackathonId/submission/$registrationId" params={{ hackathonId, registrationId: item.regId }} className="absolute inset-0 z-10" />
                    </td>
                    <td className="py-5 px-4">
                      <p className="text-xs font-black text-white uppercase tracking-widest font-orbitron">{item.team}</p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile card list */}
        <div className="sm:hidden divide-y divide-white/5">
          {loading ? (
            <div className="py-10"><Loader text="Scanning..." /></div>
          ) : submissions.length === 0 ? (
            <div className="py-12 text-center text-slate-600 font-orbitron text-xs uppercase tracking-widest">No packets detected</div>
          ) : (
            submissions.map((item) => (
              <Link key={item.regId} to="/h/$hackathonId/submission/$registrationId" params={{ hackathonId, registrationId: item.regId }}
                className="flex items-center justify-between p-4 hover:bg-cyan-500/[0.04] active:bg-cyan-500/[0.08] transition-all">
                <div>
                  <p className="text-xs font-black text-white uppercase font-orbitron">{item.team}</p>
                  <p className="text-[9px] text-cyan-400/60 font-orbitron mt-0.5">{item.id}</p>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(0,255,255,0.4)" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </Link>
            ))
          )}
        </div>
      </article>
    </section>
  )
}
