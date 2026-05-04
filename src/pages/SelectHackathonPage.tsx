import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";

import {
  auth,
  googleProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "../lib/firebase";
import type { User } from "../lib/firebase";
import Loader from "../components/ui/Loader";
import CircuitBackground from "../components/ui/CircuitBackground";

type Hackathon = {
  id: string;
  title: string;
  tagline: string;
  date: string;
  organizer: string;
  creatorId?: string;
  startDate?: string;
  endDate?: string;
  banner?: string;
};

function getHackathonStatus(h: Hackathon): {
  label: string;
  color: string;
  dot: string;
} {
  const now = new Date();
  if (h.startDate && h.endDate) {
    const start = new Date(h.startDate);
    const end = new Date(h.endDate);
    if (now < start)
      return {
        label: "Upcoming",
        color: "text-amber-400 border-amber-400/30 bg-amber-400/10",
        dot: "bg-amber-400",
      };
    if (now >= start && now <= end)
      return {
        label: "Live",
        color: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
        dot: "bg-emerald-400 animate-pulse",
      };
    return {
      label: "Ended",
      color: "text-slate-500 border-slate-700 bg-slate-800/50",
      dot: "bg-slate-500",
    };
  }
  if (h.startDate && !h.endDate) {
    const start = new Date(h.startDate);
    if (now < start)
      return {
        label: "Upcoming",
        color: "text-amber-400 border-amber-400/30 bg-amber-400/10",
        dot: "bg-amber-400",
      };
    return {
      label: "Live",
      color: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
      dot: "bg-emerald-400 animate-pulse",
    };
  }
  return {
    label: "Draft",
    color: "text-slate-500 border-slate-700 bg-slate-800/50",
    dot: "bg-slate-500",
  };
}

function formatDateRange(
  startDate?: string,
  endDate?: string,
  displayDate?: string,
): string {
  if (startDate) {
    const start = new Date(startDate);
    const fmt = (d: Date) =>
      d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    if (endDate) return `${fmt(start)} → ${fmt(new Date(endDate))}`;
    return `From ${fmt(start)}`;
  }
  return displayDate || "—";
}

export function SelectHackathonPage() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [newHackathon, setNewHackathon] = useState({
    id: "",
    title: "",
    tagline: "",
    startDate: "",
    endDate: "",
    prize: "",
    displayDate: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchHackathons = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/hackathons`,
        );
        const data = await response.json();
        // Safety check: Ensure data is an array before setting state
        if (Array.isArray(data)) {
          setHackathons(data);
        } else {
          console.error("Expected array from API, got:", data);
          setHackathons([]);
        }
      } catch (error) {
        console.error("Failed to fetch hackathons:", error);
        setHackathons([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHackathons();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newHackathon.startDate && newHackathon.endDate) {
      if (new Date(newHackathon.endDate) <= new Date(newHackathon.startDate)) {
        alert("End date/time must be after start date/time.");
        return;
      }
    }

    let currentUser = user;
    if (!currentUser) {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        currentUser = result.user;
      } catch (error) {
        console.error("Failed to sign in:", error);
        alert("Authentication required to create a hackathon.");
        return;
      }
    }

    // Build a display date string from the real dates
    const displayDate = newHackathon.startDate
      ? new Date(newHackathon.startDate).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "";

    try {
      const idToken = await currentUser.getIdToken();
      const headers: HeadersInit = { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${idToken}`
      };
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/hackathons`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            id: newHackathon.title.toLowerCase().replace(/\s+/g, "-"),
            title: newHackathon.title,
            tagline: newHackathon.tagline,
            date: displayDate,
            startDate: newHackathon.startDate
              ? new Date(newHackathon.startDate).toISOString()
              : undefined,
            endDate: newHackathon.endDate
              ? new Date(newHackathon.endDate).toISOString()
              : undefined,
            prize: newHackathon.prize,
            displayDate: newHackathon.displayDate,
            organizer:
              currentUser.displayName || currentUser.email || "Organizer",
            creatorId: currentUser.uid,
            creatorEmail: currentUser.email,
            phases: [
              {
                id: "phase_0_agreement",
                name: "Rules and Regulations",
                description: "Please read the following rules and regulations carefully before proceeding...",
                isMandatory: true,
                fields: [
                  {
                    id: "agree_checkbox",
                    label: "I have read and agree to the rules and regulations",
                    type: "checkbox",
                    required: true,
                  },
                ],
              },
              {
                id: "phase_1_registration",
                name: "Registration",
                description: "Provide your primary identity details. This information will be used for the hackathon registry.",
                isMandatory: true,
                fields: [
                  { id: "name", label: "Full Name", type: "text", required: true },
                  { id: "email", label: "Email Address", type: "email", required: true },
                  { id: "phone", label: "Phone Number", type: "tel", required: true },
                  { id: "year", label: "Current Year", type: "select", options: ["1st Year", "2nd Year", "3rd Year", "4th Year", "Other"], required: true },
                  { id: "branch", label: "Branch / Department", type: "text", required: true },
                  { id: "gender", label: "Gender", type: "select", options: ["Male", "Female", "Other", "Prefer not to say"], required: true },
                  { id: "collegeName", label: "College / University Name", type: "text", required: true },
                ]
              },
              {
                id: "phase_2_team_formation",
                name: "Team Formation",
                description: "Form or join a team to participate in the hackathon.",
                isMandatory: true,
                fields: [
                  { id: "teamName", label: "Official Team Name", type: "text", required: true },
                  { id: "role", label: "Your Role / Specialization", type: "select", options: ["Leader", "Frontend", "Backend", "Fullstack", "UI/UX Designer", "AI/ML Engineer"], required: true },
                  { id: "teamSize", label: "Team Size", type: "number", required: true },
                ]
              },
              {
                id: "phase_3_submissions",
                name: "Project Submission",
                description: "Submit your final project details, repository links, and demo videos.",
                isMandatory: true,
                fields: [
                  { id: "projectName", label: "Project Name", type: "text", required: true },
                  { id: "projectDescription", label: "Brief Description", type: "textarea", required: true },
                  { id: "repoLink", label: "GitHub Repository URL", type: "url", required: true },
                  { id: "demoLink", label: "Demo Video/Deployment Link", type: "url", required: true }
                ]
              },
            ],
          }),
        },
      );
      if (response.ok) {
        const created = await response.json();
        setHackathons([created, ...hackathons]);
        setShowCreateModal(false);
        setNewHackathon({
          id: "",
          title: "",
          tagline: "",
          startDate: "",
          endDate: "",
          prize: "",
          displayDate: "",
        });

        // Navigate directly to the new hackathon management node
        navigate({ to: '/h/$hackathonId', params: { hackathonId: created.id } });
      }
    } catch (error) {
      console.error("Failed to create hackathon:", error);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-white font-orbitron px-4 py-6 sm:p-8 relative overflow-hidden">
      {/* Unified Circuit Background */}
      <CircuitBackground opacity={0.8} />

      <div className="max-w-6xl mx-auto relative z-10">
        <header className="mb-8 sm:mb-16 flex flex-col sm:flex-row sm:items-end sm:justify-between border-b border-white/10 pb-6 sm:pb-8 gap-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-cyan-400 mb-2">
              Central Command
            </p>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tighter">
              SELECT <span className="text-cyan-400">NODE</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="neon-btn-cyan w-full sm:w-auto"
            >
              + INITIALIZE NEW HACKATHON
            </button>
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader text="Fetching Active Nodes..." />
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {hackathons.map((h) => {
              const status = getHackathonStatus(h);
              return (
                <Link
                  key={h.id}
                  to="/h/$hackathonId"
                  params={{ hackathonId: h.id }}
                  className="glass-card group flex flex-col border-white/10 hover:border-cyan-500/40 transition-all duration-500 relative overflow-hidden h-full"
                >
                  {/* Banner Image / Background */}
                  <div className="h-32 relative overflow-hidden bg-slate-900 border-b border-white/10">
                    {h.banner ? (
                      h.banner.trim().toLowerCase().startsWith('linear-gradient') ? (
                        <div 
                          className="w-full h-full opacity-60 group-hover:opacity-40 transition-all duration-700 group-hover:scale-110"
                          style={{ backgroundImage: h.banner.trim() }}
                        />
                      ) : (
                        <img
                          src={h.banner}
                          className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-all duration-700 group-hover:scale-110"
                          alt=""
                          loading="eager"
                        />
                      )
                    ) : (
                      <div className="absolute inset-0 bg-linear-to-br from-cyan-500/10 to-blue-500/10 opacity-30" />
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/40 to-transparent" />

                    {/* Status Badge - Positioned over banner */}
                    <div className="absolute top-4 left-4 z-10">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 border text-[9px] font-bold tracking-widest uppercase backdrop-blur-md ${status.color}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${status.dot}`}
                        />
                        {status.label}
                      </span>
                    </div>

                    <div className="absolute bottom-4 left-4 z-10">
                      <span className="text-[10px] font-mono text-cyan-400/80 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                        NODE_{h.id.substring(0, 6).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex-grow flex flex-col">
                    <h2 className="text-xl font-black group-hover:text-cyan-400 transition-colors mb-2 leading-tight uppercase tracking-tight">
                      {h.title}
                    </h2>
                    <p className="text-[11px] text-slate-400 font-medium leading-relaxed mb-6 italic line-clamp-2">
                      "{h.tagline}"
                    </p>

                    <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[8px] font-bold text-slate-600 uppercase tracking-[0.2em] block">
                          Execute Window
                        </span>
                        <span className="text-[10px] font-mono text-slate-300">
                          {formatDateRange(h.startDate, h.endDate, h.date)}
                        </span>
                      </div>

                      <div className="h-8 w-8 rounded-sm bg-cyan-400/10 flex items-center justify-center group-hover:bg-cyan-400 transition-all">
                        <svg
                          className="w-4 h-4 text-cyan-400 group-hover:text-black"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {hackathons.length === 0 && !loading && (
          <div className="glass-card p-20 flex flex-col items-center justify-center border-dashed border-white/10 text-center">
            <div className="h-16 w-16 bg-slate-900 border border-white/5 flex items-center justify-center mb-6">
              <svg
                className="w-8 h-8 text-slate-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">
              No Active Hackathon Nodes
            </h3>
            <p className="text-slate-500 text-sm max-w-sm mb-8">
              System is idle. Initialize a new hackathon node to begin
              management protocols.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="neon-btn-cyan"
            >
              INITIALIZE NODE
            </button>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-card w-full sm:max-w-xl p-5 sm:p-8 border-cyan-500/30 max-h-[92vh] overflow-y-auto rounded-none sm:rounded">
            <div className="flex items-center justify-between mb-8 border-b border-cyan-500/10 pb-4">
              <h2 className="text-2xl font-black tracking-widest">
                INITIALIZE <span className="text-cyan-400">NODE</span>
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-500 hover:text-white"
              >
                CLOSE
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Node Title
                </label>
                <input
                  required
                  type="text"
                  value={newHackathon.title}
                  onChange={(e) =>
                    setNewHackathon({ ...newHackathon, title: e.target.value })
                  }
                  className="admin-input"
                  placeholder="e.g. CodeCraft 2026"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Neural Tagline
                </label>
                <input
                  required
                  type="text"
                  value={newHackathon.tagline}
                  onChange={(e) =>
                    setNewHackathon({
                      ...newHackathon,
                      tagline: e.target.value,
                    })
                  }
                  className="admin-input"
                  placeholder="Build the future..."
                />
              </div>

              {/* Real datetime fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                    Start Date & Time{" "}
                    <span className="text-cyan-400/50 normal-case">
                      — Real UTC
                    </span>
                  </label>
                  <input
                    required
                    type="datetime-local"
                    value={newHackathon.startDate}
                    onChange={(e) =>
                      setNewHackathon({
                        ...newHackathon,
                        startDate: e.target.value,
                      })
                    }
                    className="w-full bg-slate-900 border border-white/10 p-3 text-sm focus:border-cyan-400 outline-none transition-colors text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                    End Date & Time{" "}
                    <span className="text-cyan-400/50 normal-case">
                      — Real UTC
                    </span>
                  </label>
                  <input
                    required
                    type="datetime-local"
                    value={newHackathon.endDate}
                    min={newHackathon.startDate}
                    onChange={(e) =>
                      setNewHackathon({
                        ...newHackathon,
                        endDate: e.target.value,
                      })
                    }
                    className="w-full bg-slate-900 border border-white/10 p-3 text-sm focus:border-cyan-400 outline-none transition-colors text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Display Date (e.g., "May 15-17")
                  </p>
                  <input
                    type="text"
                    value={newHackathon.displayDate}
                    onChange={(e) =>
                      setNewHackathon({
                        ...newHackathon,
                        displayDate: e.target.value,
                      })
                    }
                    className="w-full bg-slate-900 border border-white/10 px-4 py-2 text-xs font-mono text-white outline-none focus:border-cyan-500/50 transition-colors"
                    placeholder="25 Apr 2026"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Prize Pool (Optional)
                  </p>
                  <input
                    type="text"
                    value={newHackathon.prize}
                    onChange={(e) =>
                      setNewHackathon({
                        ...newHackathon,
                        prize: e.target.value,
                      })
                    }
                    className="w-full bg-slate-900 border border-white/10 px-4 py-2 text-xs font-mono text-white outline-none focus:border-cyan-500/50 transition-colors"
                    placeholder="$ 3,500"
                  />
                </div>
              </div>



              <div className="pt-4 flex items-center gap-4">
                <button type="submit" className="neon-btn-cyan flex-1">
                  EXECUTE INITIALIZATION
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="neon-btn-outline"
                >
                  ABORT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
