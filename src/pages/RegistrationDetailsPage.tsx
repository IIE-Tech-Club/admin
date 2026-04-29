import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from '@tanstack/react-router'
import { auth } from '../lib/firebase'
import Loader from '../components/ui/Loader'

interface Registration {
  _id: string
  registrationDate: string
  status: string
  responses: Record<string, unknown>
  user?: {
    name?: string
    email?: string
    photoURL?: string
  }
}

interface Hackathon {
  id: string
  title: string
  phases: {
    id: string
    name: string
    type: string
    fields?: { id: string; label: string; type: string }[]
  }[]
}

export function RegistrationDetailsPage() {
  const { hackathonId, registrationId } = useParams({
    from: "/h/$hackathonId/registrations/$registrationId",
  });
  const navigate = useNavigate();
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch registration details
        const regRes = await fetch(`${import.meta.env.VITE_API_URL}/registrations/detail/${registrationId}`)
        const regData = await regRes.json()
        setRegistration(regData)

        // Fetch hackathon for phase labels
        const hRes = await fetch(`${import.meta.env.VITE_API_URL}/hackathons/${hackathonId}`)
        const hData = await hRes.json()
        setHackathon(hData)
      } catch (error) {
        console.error('Failed to fetch details:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [hackathonId, registrationId])

  const handleDelete = async () => {
    if (!window.confirm("CRITICAL: You are about to purge this entity from the registry. This action is irreversible. Proceed?")) return;
    
    setDeleting(true)
    try {
      const user = auth.currentUser
      if (!user) throw new Error("Authentication node not found.")
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/registrations/${registrationId}?creatorId=${user.uid}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        navigate({ to: `/h/${hackathonId}/registrations` })
      } else {
        const err = await response.json()
        alert(`Deletion Protocol Failed: ${err.message}`)
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Internal System Failure";
      alert(`System Error: ${msg}`);
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader text="Accessing Neural Records..." />
      </div>
    )
  }

  if (!registration) {
    return (
      <div className="text-center p-20">
        <h2 className="text-2xl font-black text-rose-500 font-orbitron mb-4">ENTITY NOT FOUND</h2>
        <Link to="/h/$hackathonId/registrations" params={{ hackathonId }} className="neon-btn-cyan !px-8">BACK TO REGISTRY</Link>
      </div>
    )
  }

  // Helper to extract nice labels
  const getParticipantName = () => {
    if (registration.user?.name) return registration.user.name;
    let name = 'Unknown Entity';
    Object.values(registration.responses || {}).forEach((data) => {
        if (typeof data === 'object' && data !== null) {
            const d = data as Record<string, unknown>;
            if (d.name) name = String(d.name);
        }
    });
    return name;
  }

  // Helper to extract team name
  const getTeamName = () => {
    let teamName = '';
    Object.values(registration.responses || {}).forEach((data) => {
        if (typeof data === 'object' && data !== null) {
            const d = data as Record<string, unknown>;
            if (d.teamName) teamName = String(d.teamName);
        }
    });
    return teamName;
  }

  const teamName = getTeamName();

  return (
    <section className="space-y-5 pb-16">
      <header>
        <Link
          to="/h/$hackathonId/registrations"
          params={{ hackathonId }}
          className="text-[10px] font-black text-slate-500 hover:text-cyan-400 font-orbitron uppercase tracking-widest transition-colors flex items-center gap-2 mb-4"
        >
          ← BACK TO MANIFEST
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 sm:h-10 w-1 bg-cyan-400 shadow-[0_0_15px_#00ffff] shrink-0" />
            <div>
              <p className="text-[10px] font-black text-cyan-400 font-orbitron uppercase tracking-widest mb-1">Identity File [ {registration._id.substring(registration._id.length - 8).toUpperCase()} ]</p>
              <h1 className="text-2xl sm:text-4xl font-black text-white font-orbitron tracking-tight uppercase truncate">{getParticipantName()}</h1>
            </div>
          </div>
          <div className="sm:text-right">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Enrollment Status</p>
            <p className="text-lg font-black text-cyan-400 font-orbitron">{registration.status?.toUpperCase() || 'PENDING'}</p>
          </div>
        </div>
      </header>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Identity Sidebar */}
        <aside className="md:col-span-1 space-y-6">
          <article className="glass-card p-6 border-cyan-500/20">
            <h3 className="text-xs font-black text-white font-orbitron uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Core Identity</h3>
            
            <div className="space-y-6">
              <div>
                <p className="text-[9px] font-black text-slate-500 font-orbitron uppercase tracking-widest mb-1">Email Address</p>
                <p className="text-xs font-mono text-white break-all">{registration.user?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-500 font-orbitron uppercase tracking-widest mb-1">Check-in Sequence</p>
                <p className="text-xs font-mono text-white">{new Date(registration.registrationDate).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-500 font-orbitron uppercase tracking-widest mb-1">System ID</p>
                <p className="text-[10px] font-mono text-slate-400">{registration._id}</p>
              </div>
            </div>
          </article>

          {teamName && (
            <article className="glass-card p-6 border-cyan-500/30 bg-cyan-500/5">
                <h3 className="text-[10px] font-black text-cyan-400 font-orbitron uppercase tracking-widest mb-4">Squad Linkage</h3>
                <p className="text-[9px] font-bold text-slate-500 uppercase mb-2">Assigned Unit:</p>
                <Link 
                    to="/h/$hackathonId/teams/$teamName"
                    params={{ hackathonId, teamName }}
                    className="flex items-center justify-between p-3 bg-slate-950 border border-cyan-500/20 hover:border-cyan-400 transition-all group"
                >
                    <span className="text-xs font-black text-white font-orbitron uppercase tracking-wider">{teamName}</span>
                    <span className="text-cyan-400">→</span>
                </Link>
            </article>
          )}

          <div className="pt-6 border-t border-white/5">
            <button 
                onClick={handleDelete}
                disabled={deleting}
                className="w-full border border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 text-[10px] font-black font-orbitron py-3 tracking-[0.2em] transition-all disabled:opacity-30 uppercase"
            >
                {deleting ? "PURGING..." : "Purge Enrollment"}
            </button>
            <p className="text-[8px] text-slate-600 font-mono mt-2 text-center uppercase tracking-widest">Caution: Action is irreversible</p>
          </div>
        </aside>

        {/* Intelligence Data */}
        <div className="md:col-span-2 space-y-6">
          <article className="glass-card p-8 border-cyan-500/20">
            <h3 className="text-xl font-black text-white font-orbitron tracking-widest mb-8 flex items-center gap-4">
              <span className="text-cyan-400 text-2xl font-mono">/</span> Registration Manifest
            </h3>

            <div className="space-y-8">
                {(() => {
                  const registrationPhase = hackathon?.phases?.find((p) => p.id === 'phase_1_registration');
                  if (!registrationPhase) return <p className="text-xs font-mono text-slate-500 italic">Phase [phase_1_registration] not located in database.</p>;
                  
                  const phaseResponse = registration.responses?.[registrationPhase.id];
                  if (!phaseResponse) return (
                    <div className="opacity-30 p-6 border border-white/5 grayscale">
                        <p className="text-[10px] font-black text-slate-500 font-orbitron uppercase tracking-widest">Phase: {registrationPhase.name} [PENDING]</p>
                    </div>
                  );

                  return (
                    <div className="p-6 bg-slate-900/40 border border-cyan-500/10 hover:border-cyan-500/30 transition-all group">
                      <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                        <h4 className="text-xs font-black text-white font-orbitron uppercase tracking-widest flex items-center gap-3">
                          <span className="h-2 w-2 bg-cyan-400 shadow-[0_0_8px_#00ffff]" />
                          {registrationPhase.name}
                        </h4>
                        <div className="flex items-center gap-2">
                            <span className="text-[8px] font-mono text-slate-500 uppercase">Status:</span>
                            <span className="text-[9px] font-mono text-cyan-400 bg-cyan-400/5 px-2 py-0.5 border border-cyan-400/20">MANIFEST_VERIFIED</span>
                        </div>
                      </div>
                      
                      <div className="grid gap-6 md:grid-cols-2">
                        {registrationPhase.fields?.map((field) => {
                          const val = typeof phaseResponse === 'object' && phaseResponse !== null 
                            ? (phaseResponse as Record<string, unknown>)[field.id] 
                            : phaseResponse;
                          
                          return (
                            <div key={field.id} className={field.type === 'file' ? 'col-span-2' : ''}>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="h-1 w-1 bg-slate-700" />
                                <p className="text-[9px] font-black text-slate-500 font-orbitron uppercase tracking-widest">{field.label}</p>
                              </div>
                              {field.type === 'file' ? (
                                <div className="flex items-center gap-4 p-4 bg-slate-950 border border-white/5 group-hover:border-cyan-500/20 transition-colors">
                                    <div className="h-12 w-12 bg-cyan-500/5 border border-cyan-500/10 flex items-center justify-center text-cyan-400 text-xl">
                                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-black text-white font-orbitron uppercase tracking-widest mb-1">DATA_OBJECT_ATTACHMENT</p>
                                        <p className="text-[9px] font-mono text-slate-500 truncate opacity-60">{String(val || 'NO_PATH_LOCATED')}</p>
                                    </div>
                                    {!!val && (
                                      <a 
                                        href={String(val)} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="border border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-400 hover:text-black px-4 py-2 text-[9px] font-black font-orbitron tracking-widest transition-all uppercase"
                                      >
                                        EXTRACT DATA
                                      </a>
                                    )}
                                </div>
                              ) : (
                                <div className="relative">
                                  <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-cyan-500/30" />
                                  <p className="text-sm text-white/90 font-medium leading-relaxed bg-white/5 px-4 py-3 font-mono border border-white/5">
                                    {val === true ? 'TRUE // VERIFIED' : val === false ? 'FALSE // REJECTED' : String(val || 'NULL_ENTRY')}
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {(!registrationPhase.fields || registrationPhase.fields.length === 0) && (
                          <div className="col-span-2 py-4 text-[10px] text-slate-600 font-mono italic flex items-center gap-2">
                             <span className="text-cyan-500/50">▶</span> Sequence parameters satisfied. No additional telemetry recorded.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
