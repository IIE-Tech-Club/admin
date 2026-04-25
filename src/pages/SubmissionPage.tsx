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

export function SubmissionPage() {
  const { hackathonId } = useParams({ from: '/h/$hackathonId' })
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/registrations/${hackathonId}`)
        const registrations = await response.json()
        
        const filtered = registrations
          .filter((reg: any) => {
              return reg.responses && (reg.responses['phase_3_submissions'] || Object.keys(reg.responses).length > 0);
          })
          .map((reg: any) => {
            const responses = reg.responses || {}
            let team = 'N/A'
            let project = 'Untitled'
            let link = '#'

            const submissionData = responses['phase_3_submissions']
            const teamData = responses['phase_2_team_formation']
            const registrationData = responses['phase_1_registration']

            if (submissionData) {
              project = submissionData.projectName
              link = submissionData.repoLink || submissionData.demoLink || '#'
            }

            if (teamData) {
              team = teamData.teamName
            } else if (registrationData) {
              team = registrationData.teamName || 'Individual'
            }

            if (project === 'Untitled') {
                Object.values(responses).forEach((data: any) => {
                    if (typeof data === 'object' && data !== null) {
                        if (data.title || data.projectName) project = data.title || data.projectName
                        if (data.driveLink || data.link || data.url) link = data.driveLink || data.link || data.url
                    }
                })
            }

            return {
              id: reg._id.substring(reg._id.length - 8).toUpperCase(),
              regId: reg._id,
              team,
              project,
              submittedAt: new Date(reg.registrationDate).toLocaleDateString(),
              scoreRisk: reg.status === 'Approved' ? 'Low Risk' : 'Medium Risk',
              link
            }
          })

        setSubmissions(filtered)
      } catch (error) {
        console.error('Failed to fetch submissions:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchSubmissions()
  }, [hackathonId])

  return (
    <section className="space-y-8">
      <header className="glass-card p-8 border-cyan-500/20">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400 font-orbitron mb-2">
          Submission Protocol
        </p>
        <h1 className="text-4xl font-black text-white md:text-5xl tracking-tight font-orbitron">
          Submission <span className="text-cyan-400 text-glow">Archive</span>
        </h1>
        <p className="mt-4 text-sm text-slate-400 font-medium tracking-wide">
          Access and manage project artifacts submitted by participants during the final phase.
        </p>
      </header>

      <article className="glass-card p-8 border-cyan-500/10">
        <div className="mb-8 flex items-center gap-4 border-b border-cyan-500/10 pb-6">
          <div className="h-8 w-1 bg-cyan-400 shadow-[0_0_15px_#00ffff]" />
          <h2 className="text-2xl font-black text-white tracking-widest font-orbitron">Packet Stream</h2>
        </div>

        <div className="soft-scrollbar overflow-x-auto">
          <table className="w-full min-w-[400px] border-collapse">
            <thead>
              <tr className="text-left border-b border-white/5">
                <th className="pb-4 px-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 font-orbitron">Packet UID</th>
                <th className="pb-4 px-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 font-orbitron">Deployment</th>
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
      </article>
    </section>
  )
}
