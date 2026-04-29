import {
  Link,
  Outlet,
  useRouterState,
  useParams,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  auth,
  onAuthStateChanged,
  signInWithPopup,
  googleProvider,
} from "../lib/firebase";
import type { User } from "../lib/firebase";
import Loader from "./ui/Loader";

// ✅ DEFINE DECORATIVE CONSTANTS OUTSIDE COMPONENT
// This is the optimal fix for both 'impure function' and 'cascading render' warnings.
// It ensures values are generated once at module load, not during React lifecycles.
const BACKGROUND_PARTICLES = [...Array(30)].map(() => ({
  left: `${Math.random() * 100}%`,
  delay: `${Math.random() * 15}s`,
  duration: `${10 + Math.random() * 10}s`,
  opacity: Math.random() * 0.4 + 0.1,
}));

const BACKGROUND_CIRCUITS = [...Array(12)].map(() => ({
  left: `${Math.random() * 100}%`,
  delay: `${Math.random() * 8}s`,
  duration: `${6 + Math.random() * 4}s`,
}));

interface Hackathon {
  id: string;
  title: string;
  creatorId?: string;
  phases?: { id: string }[];
}

interface RegistrationResponse {
  _id: string;
  responses: Record<string, { teamName?: string; [key: string]: unknown } | undefined>;
}

// ── Nav Icon Components ─────────────────────────────────────────────
function DashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
    </svg>
  );
}
function RegIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}
function TeamIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}
function SubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  );
}
function PhaseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
    </svg>
  );
}
function OrgIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  );
}
function SettingsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.42 1.42M5.93 18.07l-1.42 1.42M19.07 19.07l-1.42-1.42M5.93 5.93l-1.42-1.42M22 12h-2M4 12H2M12 22v-2M12 4V2"/>
    </svg>
  );
}
function ExitIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}
function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

interface NavItem {
  to: string;
  params: { hackathonId: string };
  label: string;
  badge: string;
  icon: React.ReactNode;
}

const SidebarContent = ({
  hackathon,
  navItems,
}: {
  hackathon: Hackathon | null;
  navItems: NavItem[];
}) => (
  <>
    {/* Logo */}
    <div className="border-b border-cyan-500/20 px-5 py-6">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded bg-cyan-400/20 text-sm font-bold tracking-widest text-cyan-400 border border-cyan-400/50 shadow-[0_0_15px_rgba(0,255,255,0.2)] font-orbitron shrink-0">
          CP
        </span>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-cyan-400/80 font-orbitron">
            CodeCraft
          </p>
          <p className="text-base font-bold text-white font-orbitron">OS v3.0</p>
        </div>
      </div>
    </div>

    {/* Hackathon label */}
    {hackathon && (
      <div className="px-5 pt-4 pb-2">
        <p className="text-[9px] font-bold tracking-[0.2em] text-slate-600 font-orbitron uppercase">
          Active Node
        </p>
        <p className="text-xs font-bold text-cyan-400/80 font-orbitron uppercase truncate mt-0.5">
          {hackathon.title}
        </p>
      </div>
    )}

    <div className="px-5 pb-2 pt-3 text-[9px] font-bold tracking-[0.3em] text-slate-600 font-orbitron">
      CORE MODULES
    </div>

    <nav className="space-y-1 px-3 flex-1">
      {navItems.map((item) => (
        <Link
          key={item.to}
          to={item.to as string}
          params={item.params as Record<string, string>}
          activeOptions={{ exact: true }}
          className="group flex items-center justify-between px-3 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-400 transition-all border border-transparent font-orbitron rounded-sm"
          activeProps={{
            className:
              "border-cyan-500/30 bg-cyan-500/10 text-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.08)] rounded-sm",
          }}
        >
          <span className="flex items-center gap-3">
            <span className="text-slate-500 group-hover:text-cyan-400 transition-colors shrink-0">
              {item.icon}
            </span>
            {item.label}
          </span>
          <span className="text-[9px] opacity-40 group-hover:opacity-100 font-mono">
            {item.badge}
          </span>
        </Link>
      ))}
    </nav>

    <div className="mt-auto border-t border-cyan-500/20 p-4">
      <Link
        to="/"
        className="w-full neon-btn-outline flex items-center justify-center gap-2 !py-2.5"
      >
        <ExitIcon />
        Exit Node
      </Link>
    </div>
  </>
);

export function AdminLayout() {
  const { hackathonId } = useParams({ from: "/h/$hackathonId" });
  const [user, setUser] = useState<User | null>(null);
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [stats, setStats] = useState({ registrations: 0, teams: 0, submissions: 0 });

  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  // ✅ Synchronous state adjustment during render (Recommended by React 18+)
  // This avoids cascading renders and 'useEffect' performance warnings.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    if (drawerOpen) setDrawerOpen(false);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const [hRes, rRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/hackathons/${hackathonId}`),
          fetch(`${import.meta.env.VITE_API_URL}/registrations/${hackathonId}`),
        ]);

        if (hRes.ok) {
          const hData = await hRes.json();
          setHackathon(hData);
        }

        if (rRes.ok) {
          const rData = (await rRes.json()) as RegistrationResponse[];
          const teamSet = new Set<string>();
          rData.forEach((reg) => {
            const teamName =
              reg.responses?.phase_2_team_formation?.teamName ||
              reg.responses?.phase_1_registration?.teamName;
            if (teamName) teamSet.add(teamName);
          });
          const submissionCount = rData.filter(
            (reg) =>
              reg.responses &&
              (reg.responses["phase_3_submissions"] ||
                Object.keys(reg.responses).length > 2),
          ).length;
          setStats({
            registrations: rData.length,
            teams: teamSet.size || (rData.length > 0 ? 1 : 0),
            submissions: submissionCount,
          });
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, [hackathonId, setStats, setLoading]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Sign in failed:", error);
    }
  };

  const navItems: NavItem[] = [
    {
      to: "/h/$hackathonId",
      params: { hackathonId },
      label: "Dashboard",
      badge: "LIVE",
      icon: <DashIcon />,
    },
    {
      to: "/h/$hackathonId/registrations",
      params: { hackathonId },
      label: "Registrations",
      badge: String(stats.registrations),
      icon: <RegIcon />,
    },
    {
      to: "/h/$hackathonId/teams",
      params: { hackathonId },
      label: "Teams",
      badge: String(stats.teams),
      icon: <TeamIcon />,
    },
    {
      to: "/h/$hackathonId/submission",
      params: { hackathonId },
      label: "Submission",
      badge: String(stats.submissions),
      icon: <SubIcon />,
    },
    {
      to: "/h/$hackathonId/phases",
      params: { hackathonId },
      label: "Phases",
      badge: "PHZ",
      icon: <PhaseIcon />,
    },
    {
      to: "/h/$hackathonId/organizers",
      params: { hackathonId },
      label: "Organizers",
      badge: "ORG",
      icon: <OrgIcon />,
    },
    {
      to: "/h/$hackathonId/settings",
      params: { hackathonId },
      label: "Settings",
      badge: "CFG",
      icon: <SettingsIcon />,
    },
  ];

  const pathParts = pathname.split("/").filter(Boolean);
  const lastPart = pathParts[pathParts.length - 1];
  const sectionTitle =
    !lastPart || lastPart === hackathonId
      ? "Dashboard"
      : lastPart.charAt(0).toUpperCase() + lastPart.slice(1);

  const sectionByPath: Record<string, { title: string; subtitle: string }> = {
    Dashboard: { title: "Dashboard", subtitle: "Live pulse of the hackathon floor" },
    Registrations: { title: "Registrations", subtitle: "Participant onboarding and check-in queue" },
    Teams: { title: "Teams", subtitle: "Squad health, progress, and velocity" },
    Submission: { title: "Submission", subtitle: "Judging pipeline and latest uploads" },
    Phases: { title: "Phase Architect", subtitle: "Design and configure registration phases" },
    Organizers: { title: "Organizers", subtitle: "Manage team profiles, roles, and social presence" },
    Settings: { title: "Hackathon Settings", subtitle: "Name, contact email, and identity configuration" },
  };

  const currentSection = sectionByPath[sectionTitle] ?? sectionByPath["Dashboard"];

  if (loading || authChecking) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-orbitron">
        <Loader text="Verifying Authorization..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-orbitron">
        <div className="glass-card max-w-md w-full p-8 sm:p-12 text-center border-red-500/20">
          <div className="h-16 w-16 sm:h-20 sm:w-20 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m0 0v2m0-2h2m-2 0H10m11-3V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 00-2-2H3" />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-black mb-3 tracking-tighter uppercase">
            Restricted <span className="text-red-500">Access</span>
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mb-8 leading-relaxed uppercase tracking-widest font-bold">
            Identity verification required. Execute authentication to proceed.
          </p>
          <button onClick={handleLogin} className="w-full neon-btn-cyan">
            INITIALIZE AUTHENTICATION
          </button>
          <Link to="/" className="block mt-6 text-[10px] text-slate-600 hover:text-white transition-colors uppercase tracking-[0.3em] font-black">
            Return to Node Selection
          </Link>
        </div>
      </div>
    );
  }

  if (hackathon && hackathon.creatorId && user.uid !== hackathon.creatorId) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-orbitron">
        <div className="glass-card max-w-md w-full p-8 sm:p-12 text-center border-red-500/20">
          <div className="h-16 w-16 sm:h-20 sm:w-20 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-black mb-3 tracking-tighter uppercase">
            Access <span className="text-red-500">Denied</span>
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mb-6 leading-relaxed uppercase tracking-widest font-bold">
            This node is protected. Only the designated creator may modify parameters for{" "}
            <span className="text-white">"{hackathon.title}"</span>.
          </p>
          <div className="p-3 bg-slate-900/50 border border-white/5 mb-6">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Authenticated As</p>
            <p className="text-xs text-cyan-400 font-bold truncate">{user.email}</p>
          </div>
          <Link to="/" className="w-full neon-btn-outline block text-center">
            Return to Node Selection
          </Link>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-slate-950 text-[#e0f7ff] font-grotesk">
      {/* Background Effects */}
      <div className="tech-grid" aria-hidden="true" />
      <div className="particles-container" aria-hidden="true">
        {BACKGROUND_PARTICLES.map((p, i) => (
          <div
            key={`particle-${i}`}
            className="particle"
            style={{
              left: p.left,
              animationDelay: p.delay,
              animationDuration: p.duration,
              opacity: p.opacity,
            }}
          />
        ))}
      </div>
      <div className="circuit-bg" aria-hidden="true">
        {BACKGROUND_CIRCUITS.map((c, i) => (
          <div
            key={`circuit-${i}`}
            className="circuit-line"
            style={{
              left: c.left,
              animationDelay: c.delay,
              animationDuration: c.duration,
            }}
          />
        ))}
      </div>
      <div className="scanline-overlay" aria-hidden="true" />

      {/* Mobile Drawer Overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Mobile Drawer Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 z-50 flex flex-col bg-[#040a16]/95 backdrop-blur-xl border-r border-cyan-500/20 transition-transform duration-300 ease-in-out lg:hidden ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close button */}
        <button
          onClick={() => setDrawerOpen(false)}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors p-1"
          aria-label="Close menu"
        >
          <CloseIcon />
        </button>
        <SidebarContent hackathon={hackathon} navItems={navItems} />
      </aside>

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1700px]">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 shrink-0 glass-card m-4 lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:flex lg:flex-col z-20">
          <SidebarContent hackathon={hackathon} navItems={navItems} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col relative z-10">
          {/* Header */}
          <header className="glass-card m-3 sm:m-4 mb-0 py-3 sm:py-4 px-4 sm:px-6 border-cyan-500/20 backdrop-blur-md">
            <div className="flex items-center justify-between gap-3">
              {/* Mobile hamburger */}
              <button
                onClick={() => setDrawerOpen(true)}
                className="lg:hidden p-2 text-slate-400 hover:text-cyan-400 transition-colors -ml-1 shrink-0"
                aria-label="Open menu"
              >
                <MenuIcon />
              </button>

              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-orbitron text-slate-500 flex-wrap">
                  <span className="font-bold text-cyan-400 shrink-0">ADMIN</span>
                  <span className="text-slate-700 shrink-0">|</span>
                  <span className="text-white truncate">{currentSection.title}</span>
                </p>
                <p className="mt-0.5 text-xs text-slate-500 font-medium tracking-wide hidden sm:block truncate">
                  {currentSection.subtitle}
                </p>
              </div>

              {/* Live indicator */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 border border-cyan-500/20 bg-cyan-500/5">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_rgba(0,255,255,0.8)]" />
                  <span className="text-[9px] font-bold text-cyan-400 font-orbitron uppercase tracking-widest">Live</span>
                </div>
                {/* Mobile: show hackathon name */}
                <div className="flex lg:hidden items-center">
                  {hackathon && (
                    <span className="text-[9px] text-cyan-400/60 font-orbitron uppercase tracking-widest truncate max-w-[80px]">
                      {hackathon.title}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
