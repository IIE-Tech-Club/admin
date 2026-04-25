import { useEffect, useState } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import Loader from '../components/ui/Loader'

export function TeamDetailsPage() {
  const { hackathonId, teamName } = useParams({ from: '/h/$hackathonId/teams/$teamName' })
  const decodedTeamName = decodeURIComponent(teamName)
  const [registrations, setRegistrations] = useState<any[]>([])
  const [hackathon, setHackathon] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all registrations to filter by team
        const regRes = await fetch(`${import.meta.env.VITE_API_URL}/registrations/${hackathonId}`)
        const allRegs = await regRes.json()
        
        // Filter by team name
        const filtered = allRegs.filter((reg: any) => {
            const responses = reg.responses || {}
            let nameInReg = ''
            
            // Check all phases for teamName
            Object.values(responses).forEach((data: any) => {
                if (typeof data === 'object' && data?.teamName) {
                    nameInReg = data.teamName
                }
            })
            
            return nameInReg === decodedTeamName
        })
        
        setRegistrations(filtered)

        // Fetch hackathon for phase labels
        const hRes = await fetch(`${import.meta.env.VITE_API_URL}/hackathons/${hackathonId}`)
        const hData = await hRes.json()
        setHackathon(hData)
      } catch (error) {
        console.error('Failed to fetch team details:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [hackathonId, decodedTeamName])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader text="Accessing Squad Manifest..." />
      </div>
    )
  }

  if (registrations.length === 0) {
    return (
      <div className="text-center p-20">
        <h2 className="text-2xl font-black text-rose-500 font-orbitron mb-4">SQUAD NOT LOCATED</h2>
        <Link to="/h/$hackathonId/teams" params={{ hackathonId }} className="neon-btn-cyan !px-8">BACK TO SQUAD INTEL</Link>
      </div>
    )
  }


  return (
    <section className="space-y-8 pb-20">
      <header>
        <Link 
          to="/h/$hackathonId/teams"
          params={{ hackathonId }}
          className="text-[10px] font-black text-slate-500 hover:text-cyan-400 font-orbitron uppercase tracking-widest transition-colors flex items-center gap-2 mb-4"
        >
          ← BACK TO TACTICAL UNITS
        </Link>
        <div className="flex items-center gap-4">
           <div className="h-10 w-1 bg-cyan-400 shadow-[0_0_15px_#00ffff]" />
           <div>
              <p className="text-[10px] font-black text-cyan-400 font-orbitron uppercase tracking-widest mb-1">Squad Manifest [ {decodedTeamName.toUpperCase()} ]</p>
              <h1 className="text-4xl font-black text-white font-orbitron tracking-tight uppercase">{decodedTeamName}</h1>
           </div>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Sidebar: Squad Overview */}
        <aside className="lg:col-span-1 space-y-6">
          <article className="glass-card p-6 border-cyan-500/20">
            <h3 className="text-xs font-black text-white font-orbitron uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Squad Composition</h3>
            <div className="space-y-6">
              <div>
                <p className="text-[9px] font-black text-slate-500 font-orbitron uppercase tracking-widest mb-1">Deployment Strength</p>
                <p className="text-xl font-black text-white font-orbitron">{registrations.length} OPERATIVES</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-500 font-orbitron uppercase tracking-widest mb-1">Sync Status</p>
                <div className="flex items-center gap-2 text-emerald-400">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_#10b981]" />
                    <p className="text-[10px] font-bold uppercase font-mono">LINK_ACTIVE</p>
                </div>
              </div>
            </div>
          </article>

          <article className="glass-card p-6 border-white/10">
            <h3 className="text-xs font-black text-white font-orbitron uppercase tracking-widest mb-4">Operative Directory</h3>
            <div className="space-y-3">
               {registrations.map((reg) => (
                 <Link 
                    key={reg._id}
                    to="/h/$hackathonId/registrations/$registrationId"
                    params={{ hackathonId, registrationId: reg._id }}
                    className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 hover:border-cyan-500/30 transition-all group"
                 >
                    <div className="h-8 w-8 bg-slate-950 border border-white/10 flex items-center justify-center text-[10px] text-white/40 font-mono group-hover:text-cyan-400 transition-colors">
                        {reg.user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-white truncate font-orbitron uppercase">{reg.user?.name || 'Unknown Entity'}</p>
                        <p className="text-[9px] text-slate-500 truncate font-mono">{reg.user?.email}</p>
                    </div>
                    <div className="text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                    </div>
                 </Link>
               ))}
            </div>
          </article>
        </aside>

        {/* Main Content: Formation & Submissions */}
        <div className="lg:col-span-2 space-y-6">
          <article className="glass-card p-8 border-cyan-500/20">
            <h3 className="text-xl font-black text-white font-orbitron tracking-widest mb-8 flex items-center gap-4">
              <span className="text-cyan-400 text-2xl font-mono">/</span> Formation Manifest
            </h3>

            <div className="space-y-6">
                {(() => {
                  const formationPhase = hackathon?.phases?.find((p: any) => p.id === 'phase_2_team_formation');
                  if (!formationPhase) return <p className="text-xs font-mono text-slate-500 italic uppercase">System phase [phase_2_team_formation] not detected.</p>;

                  const phaseResponses = registrations.map(r => r.responses?.[formationPhase.id]).filter(Boolean);
                  if (phaseResponses.length === 0) return <p className="text-[10px] font-mono text-slate-600 uppercase">No formation telemetry recorded.</p>;

                  return (
                    <div className="grid gap-4">
                        {formationPhase.fields?.map((field: any) => {
                          const values = phaseResponses.map(pr => pr[field.id]).filter(v => v !== undefined && v !== '');
                          const uniqueValues = Array.from(new Set(values));
                          if (uniqueValues.length === 0) return null;
                          return (
                            <div key={field.id} className="p-4 bg-slate-900/40 border border-white/5">
                                <p className="text-[9px] font-black text-slate-500 font-orbitron uppercase tracking-widest mb-2">{field.label}</p>
                                <p className="text-sm text-white font-mono">{String(uniqueValues[0])}</p>
                            </div>
                          )
                        })}
                    </div>
                  );
                })()}
            </div>
          </article>

          <article className="glass-card p-8 border-cyan-500/10">
            <div className="mb-8 flex items-center gap-4 border-b border-cyan-500/10 pb-6">
              <div className="h-8 w-1 bg-cyan-400 shadow-[0_0_15px_#00ffff]" />
              <h2 className="text-2xl font-black text-white tracking-widest font-orbitron">Packet Stream</h2>
            </div>

            <div className="soft-scrollbar overflow-x-auto">
              <table className="w-full min-w-[600px] border-collapse">
                <thead>
                  <tr className="text-left border-b border-white/5">
                    <th className="pb-4 px-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 font-orbitron">Packet UID</th>
                    <th className="pb-4 px-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 font-orbitron">Operative</th>
                    <th className="pb-4 px-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 font-orbitron">Deployment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {registrations.filter(r => r.responses?.['phase_3_submissions']).length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-10 text-center text-[10px] font-bold uppercase tracking-widest text-slate-600 font-orbitron">
                        No packets detected in stream
                      </td>
                    </tr>
                  ) : (
                    registrations.filter(r => r.responses?.['phase_3_submissions']).map((row) => (
                      <tr key={row._id} className="group hover:bg-cyan-500/[0.02] transition-colors relative">
                        <td className="py-6 px-4">
                          <span className="text-xs font-black text-cyan-400 font-orbitron tracking-widest uppercase">
                            {row._id.substring(row._id.length - 8).toUpperCase()}
                          </span>
                        </td>
                        <td className="py-6 px-4">
                          <p className="text-xs font-black text-white uppercase tracking-widest font-orbitron">{row.user?.name}</p>
                          <Link 
                            to="/h/$hackathonId/submission/$registrationId" 
                            params={{ hackathonId, registrationId: row._id }}
                            className="absolute inset-0 z-10"
                          />
                        </td>
                        <td className="py-6 px-4">
                           <span className="text-[10px] font-black text-white bg-slate-900 border border-slate-800 px-3 py-1 font-orbitron">
                              {decodedTeamName.toUpperCase()}
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
      </div>
    </section>
  )
}
