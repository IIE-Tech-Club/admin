import { Link, Outlet, useRouterState, useParams } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { auth, onAuthStateChanged, signInWithPopup, googleProvider } from '../lib/firebase'
import type { User } from '../lib/firebase'
import Loader from './ui/Loader'

type Hackathon = {
  id: string
  title: string
  creatorId?: string
}

export function AdminLayout() {
  const { hackathonId } = useParams({ from: '/h/$hackathonId' })
  const [user, setUser] = useState<User | null>(null)
  const [hackathon, setHackathon] = useState<Hackathon | null>(null)
  const [loading, setLoading] = useState(true)
  const [authChecking, setAuthChecking] = useState(true)
  const [stats, setStats] = useState({
    registrations: 0,
    teams: 0,
    submissions: 0
  })

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setAuthChecking(false)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const [hRes, rRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/hackathons/${hackathonId}`),
          fetch(`${import.meta.env.VITE_API_URL}/registrations/${hackathonId}`)
        ])

        if (hRes.ok) {
          const hData = await hRes.json()
          setHackathon(hData)
        }

        if (rRes.ok) {
          const rData = await rRes.json()
          
          // Calculate teams
          const teamSet = new Set()
          rData.forEach((reg: any) => {
            const teamName = reg.responses?.phase_2_team_formation?.teamName || 
                             reg.responses?.phase_1_registration?.teamName
            if (teamName) teamSet.add(teamName)
          })

          // Calculate submissions
          const submissionCount = rData.filter((reg: any) => 
            reg.responses && (reg.responses['phase_3_submissions'] || Object.keys(reg.responses).length > 2)
          ).length

          setStats({
            registrations: rData.length,
            teams: teamSet.size || (rData.length > 0 ? 1 : 0), // Fallback if no team names
            submissions: submissionCount
          })
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardStats()
  }, [hackathonId])

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (error) {
      console.error('Sign in failed:', error)
    }
  }

  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  const navItems = [
    { to: '/h/$hackathonId', params: { hackathonId }, label: 'Dashboard', badge: 'LIVE' },
    { to: '/h/$hackathonId/registrations', params: { hackathonId }, label: 'Registrations', badge: String(stats.registrations) },
    { to: '/h/$hackathonId/teams', params: { hackathonId }, label: 'Teams', badge: String(stats.teams) },
    { to: '/h/$hackathonId/submission', params: { hackathonId }, label: 'Submission', badge: String(stats.submissions) },
    { to: '/h/$hackathonId/phases', params: { hackathonId }, label: 'Phases', badge: 'PHZ' },
    { to: '/h/$hackathonId/organizers', params: { hackathonId }, label: 'Organizers', badge: 'ORG' },
    { to: '/h/$hackathonId/settings', params: { hackathonId }, label: 'Settings', badge: 'CFG' },
  ] as const

  const pathParts = pathname.split('/').filter(Boolean)
  const lastPart = pathParts[pathParts.length - 1]
  const sectionTitle = (!lastPart || lastPart === hackathonId) ? 'Dashboard' : lastPart.charAt(0).toUpperCase() + lastPart.slice(1)

  const sectionByPath: Record<string, { title: string; subtitle: string }> = {
    'Dashboard': {
      title: 'Dashboard',
      subtitle: 'Live pulse of the hackathon floor',
    },
    'Registrations': {
      title: 'Registrations',
      subtitle: 'Participant onboarding and check-in queue',
    },
    'Teams': {
      title: 'Teams',
      subtitle: 'Squad health, progress, and velocity',
    },
    'Submission': {
      title: 'Submission',
      subtitle: 'Judging pipeline and latest uploads',
    },
    'Phases': {
      title: 'Phase Architect',
      subtitle: 'Design and configure registration phases',
    },
    'Organizers': {
      title: 'Organizers',
      subtitle: 'Manage team profiles, roles, and social presence',
    },
    'Settings': {
      title: 'Hackathon Settings',
      subtitle: 'Name, contact email, and identity configuration',
    },
  }

  const currentSection = sectionByPath[sectionTitle] ?? sectionByPath['Dashboard']

  if (loading || authChecking) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-orbitron">
        <Loader text="Verifying Authorization..." />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-orbitron">
        <div className="glass-card max-w-md w-full p-12 text-center border-red-500/20">
          <div className="h-20 w-20 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m0 0v2m0-2h2m-2 0H10m11-3V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 00-2-2H3" />
            </svg>
          </div>
          <h2 className="text-2xl font-black mb-4 tracking-tighter uppercase">Restricted <span className="text-red-500">Access</span></h2>
          <p className="text-slate-400 text-sm mb-10 leading-relaxed uppercase tracking-widest font-bold">Identity verification required to access this node. Execute authentication to proceed.</p>
          <button 
            onClick={handleLogin}
            className="w-full neon-btn-cyan"
          >
            INITIALIZE AUTHENTICATION
          </button>
          <Link to="/" className="block mt-6 text-[10px] text-slate-600 hover:text-white transition-colors uppercase tracking-[0.3em] font-black">
            Return to Node Selection
          </Link>
        </div>
      </div>
    )
  }

  if (hackathon && hackathon.creatorId && user.uid !== hackathon.creatorId) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-orbitron">
        <div className="glass-card max-w-md w-full p-12 text-center border-red-500/20">
          <div className="h-20 w-20 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0112 3c1.737 0 3.37.439 4.8 1.214m.2 13.607a10.003 10.003 0 01-4.8 1.214h-.008" />
            </svg>
          </div>
          <h2 className="text-2xl font-black mb-4 tracking-tighter uppercase">Access <span className="text-red-500">Denied</span></h2>
          <p className="text-slate-400 text-sm mb-10 leading-relaxed uppercase tracking-widest font-bold">This node is protected. Only the designated creator may modify parameters for <span className="text-white">"{hackathon.title}"</span>.</p>
          <div className="p-4 bg-slate-900/50 border border-white/5 rounded mb-8">
             <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Authenticated As</p>
             <p className="text-xs text-cyan-400 font-bold">{user.email}</p>
          </div>
          <Link to="/" className="w-full neon-btn-outline block text-center">
            Return to Node Selection
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-[#e0f7ff] font-grotesk">
      {/* Background Effects */}
      <div className="tech-grid" aria-hidden="true" />
      <div className="particles-container" aria-hidden="true">
        {[...Array(40)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 15}s`,
              animationDuration: `${10 + Math.random() * 10}s`,
              opacity: Math.random() * 0.5 + 0.2,
            }}
          />
        ))}
      </div>
      <div className="circuit-bg" aria-hidden="true">
        {[...Array(15)].map((_, i) => (
          <div
            key={`circuit-${i}`}
            className="circuit-line"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${6 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>
      <div className="scanline-overlay" aria-hidden="true" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1700px]">
        {/* Sidebar */}
        <aside className="hidden w-72 shrink-0 glass-card m-4 lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:flex lg:flex-col z-20">
          <div className="border-b border-cyan-500/20 px-6 py-8">
            <div className="flex items-center gap-3.5">
              <span className="flex h-12 w-12 items-center justify-center rounded bg-cyan-400/20 text-lg font-bold tracking-widest text-cyan-400 border border-cyan-400/50 shadow-[0_0_15px_rgba(0,255,255,0.2)] font-orbitron">
                CP
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-400/80 font-orbitron">
                  CodeCraft
                </p>
                <p className="text-lg font-bold text-white font-orbitron">OS v3.0</p>
              </div>
            </div>
          </div>

          <div className="px-6 py-6 text-[10px] font-bold tracking-[0.3em] text-slate-500 font-orbitron">
            CORE MODULES
          </div>

          <nav className="space-y-4 px-4">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                params={item.params as any}
                activeOptions={{ exact: true }}
                className="group flex items-center justify-between px-4 py-3 text-sm font-bold uppercase tracking-widest text-slate-400 transition-all border border-transparent font-orbitron"
                activeProps={{
                  className:
                    'border-cyan-500/30 bg-cyan-500/10 text-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.1)]',
                }}
              >
                <span className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 bg-slate-600 transition group-hover:bg-cyan-400 shadow-[0_0_5px_rgba(0,255,255,0.5)]" />
                  {item.label}
                </span>
                <span className="text-[10px] opacity-50 group-hover:opacity-100">
                  {item.badge}
                </span>
              </Link>
            ))}
          </nav>

          <div className="mt-auto border-t border-cyan-500/20 p-6">
            <Link
              to="/"
              className="w-full neon-btn-outline block text-center"
            >
              Exit Node
            </Link>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col relative z-10">
          {/* Header */}
          <header className="glass-card m-4 mb-0 py-4 px-8 border-cyan-500/20 backdrop-blur-md">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] font-orbitron text-slate-500">
                  <span className="font-bold text-cyan-400">ADMINISTRATION</span>
                  <span className="text-slate-700">|</span>
                  <span className="text-white">{currentSection.title}</span>
                </p>
                <p className="mt-1 text-xs text-slate-400 font-medium tracking-wide">
                  {currentSection.subtitle}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-2 w-32 bg-slate-800 rounded-full overflow-hidden border border-cyan-500/10 hidden sm:block">
                  <div className="h-full bg-cyan-400 status-glow" style={{ width: '65%' }} />
                </div>
                <button
                  type="button"
                  className="neon-btn-cyan !py-2 !px-4"
                >
                  <span className="h-2 w-2 rounded-full bg-black animate-pulse" />
                  Terminal
                </button>
              </div>
            </div>

            {/* Mobile Nav */}
            <div className="mt-4 border-t border-cyan-500/10 pt-4 lg:hidden">
              <nav className="soft-scrollbar flex gap-4 overflow-x-auto pb-2">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    params={item.params as any}
                    activeOptions={{ exact: true }}
                    className="flex shrink-0 items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 border border-transparent font-orbitron"
                    activeProps={{
                      className: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400',
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}