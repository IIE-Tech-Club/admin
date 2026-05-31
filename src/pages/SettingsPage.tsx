import { useState, useEffect } from "react";
import { useParams } from "@tanstack/react-router";
import { auth, onAuthStateChanged } from "../lib/firebase";
import type { User } from "../lib/firebase";
import Loader from "../components/ui/Loader";
import ReactMarkdown from "react-markdown";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type PhaseField = {
  id: string;
  label: string;
  type: "text" | "textarea" | "email" | "tel" | "url" | "number" | "date" | "file" | "checkbox" | "select" | "radio" | "content";
  required?: boolean;
  options?: string[];
};

type Phase = {
  id: string;
  name: string;
  description: string;
  isMandatory?: boolean;
  startDate?: string;
  endDate?: string;
  fields?: PhaseField[];
};

function SortableField({
  field,
  pIdx,
  fIdx,
  updateField,
  removeField,
  phase,
}: {
  field: PhaseField;
  pIdx: number;
  fIdx: number;
  updateField: (pIdx: number, fIdx: number, updates: Partial<PhaseField>) => void;
  removeField: (pIdx: number, fieldId: string) => void;
  phase: Phase;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`grid grid-cols-12 gap-3 items-start bg-slate-900/50 p-3 border border-white/5 transition-colors relative ${isDragging ? 'opacity-50 ring-1 ring-cyan-500/50 bg-cyan-900/10 z-50' : 'hover:border-white/10'}`}
    >
      {/* Drag Handle */}
      <div 
        className="col-span-1 pt-4 cursor-grab active:cursor-grabbing text-slate-600 hover:text-cyan-400 transition-colors flex items-center justify-center"
        {...attributes} 
        {...listeners}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16"/></svg>
      </div>

      <div
        className={
          field.type === "content" ? "col-span-7" : "col-span-4"
        }
      >
        <label className="block text-[9px] text-slate-500 font-orbitron uppercase mb-1">
          {field.type === "content"
            ? "Markdown Content"
            : "Label"}
        </label>
        {field.type === "content" ? (
          <div className="space-y-2">
            <textarea
              value={field.label}
              onChange={(e) =>
                updateField(pIdx, fIdx, { label: e.target.value })
              }
              className="bg-slate-900/50 border border-white/10 px-2 py-1 w-full text-xs font-mono focus:border-cyan-400 focus:bg-cyan-500/5 focus:shadow-[0_0_10px_rgba(0,255,255,0.1)] outline-none transition-all duration-300 text-white min-h-[80px]"
              placeholder="Enter guidelines or instructions..."
            />
            {field.label && (
              <div className="p-2 bg-white/5 border border-white/5 rounded-sm overflow-hidden">
                <p className="text-[7px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Rendered Content</p>
                <div className="prose prose-invert prose-xs max-w-none text-[10px] text-slate-400 font-mono scale-[0.95] origin-top-left">
                  <ReactMarkdown>{field.label}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        ) : (
          <input
            value={field.label}
            onChange={(e) =>
              updateField(pIdx, fIdx, { label: e.target.value })
            }
            className="bg-slate-900/50 border border-white/10 px-2 py-1 w-full text-xs font-mono focus:border-cyan-400 focus:bg-cyan-500/5 focus:shadow-[0_0_10px_rgba(0,255,255,0.1)] outline-none transition-all duration-300 text-white"
          />
        )}
      </div>
      <div className="col-span-3">
        <label className="block text-[9px] text-slate-500 font-orbitron uppercase mb-1">
          Type
        </label>
        <select
          value={field.type}
          disabled={
            phase.id === "phase_1_registration" &&
            (field.id === "name" || field.id === "email")
          }
          onChange={(e) =>
            updateField(pIdx, fIdx, {
              type: e.target.value as PhaseField["type"],
            })
          }
          className={`bg-slate-900 border border-white/10 px-2 py-1 w-full text-xs font-mono focus:border-cyan-400 focus:bg-slate-800 focus:shadow-[0_0_10px_rgba(0,255,255,0.1)] outline-none transition-all duration-300 text-white cursor-pointer ${
            phase.id === "phase_1_registration" &&
            (field.id === "name" || field.id === "email")
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
        >
          <option value="text">Short Text</option>
          <option value="textarea">Long Text</option>
          <option value="email">Email</option>
          <option value="tel">Phone Number</option>
          <option value="url">URL Link</option>
          <option value="number">Number</option>
          <option value="date">Date</option>
          <option value="file">File Upload</option>
          <option value="checkbox">Checkbox (Yes/No)</option>
          <option value="select">Dropdown Options</option>
          <option value="radio">Radio Options</option>
          <option value="content">Content Block (Display Only)</option>
        </select>
      </div>
      {field.type !== "content" && (
        <div className="col-span-2 pb-1">
          <label className="flex items-center gap-2 text-xs font-mono text-slate-400 cursor-pointer pt-4">
            <input
              type="checkbox"
              checked={field.required}
              disabled={
                phase.id === "phase_1_registration" &&
                (field.id === "name" || field.id === "email")
              }
              onChange={(e) =>
                updateField(pIdx, fIdx, {
                  required: e.target.checked,
                })
              }
              className="accent-cyan-400"
            />{" "}
            Req
          </label>
        </div>
      )}
      <div
        className={`${field.type === "content" ? "col-span-4" : "col-span-2"} pb-1 text-right pt-4`}
      >
        {!(
          (phase.id === "phase_1_registration" &&
            (field.id === "name" || field.id === "email")) ||
          (phase.id === "phase_2_team_formation" &&
            (field.id === "teamName" ||
              field.id === "teamSize")) ||
          (phase.id === "phase_3_submissions" &&
            (field.id === "projectName" ||
              field.id === "repoLink"))
        ) ? (
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); removeField(pIdx, field.id); }}
            className="text-rose-400/50 hover:text-rose-400 text-xs font-orbitron transition-colors"
          >
            ✕
          </button>
        ) : (
          <span className="text-[7px] font-black text-cyan-500/30 font-orbitron tracking-widest uppercase">
            CORE
          </span>
        )}
      </div>
      {(field.type === "select" || field.type === "radio") && (
        <div className="col-span-12 mt-2 ml-10">
          <label className="block text-[9px] text-slate-500 font-orbitron uppercase mb-1">
            Options (comma separated)
          </label>
          <input
            value={field.options?.join(", ") || ""}
            onChange={(e) =>
              updateField(pIdx, fIdx, {
                options: e.target.value
                  .split(",")
                  .map((s) => s.trim()),
              })
            }
            className="bg-slate-900 border border-white/10 px-2 py-1 w-full text-xs font-mono focus:border-cyan-400 focus:bg-slate-800 focus:shadow-[0_0_10px_rgba(0,255,255,0.1)] outline-none transition-all duration-300 text-white"
            placeholder="Option 1, Option 2"
          />
        </div>
      )}
    </div>
  );
}

export function SettingsPage() {
  const { hackathonId } = useParams({ from: "/h/$hackathonId" });
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Hackathon bounds (used to constrain phase dates)
  const [hackathonBounds, setHackathonBounds] = useState<{
    startDate?: string;
    endDate?: string;
  }>({});

  // Helper to format Date for datetime-local input (local time)
  const formatForInput = (dateStr: string | undefined) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [creatorId, setCreatorId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchHackathon = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/hackathons/${hackathonId}`,
          { cache: 'no-store' }
        );
        const data = await response.json();
        setCreatorId(data.creatorId || null);
        setHackathonBounds({
          startDate: data.startDate || undefined,
          endDate: data.endDate || undefined,
        });
        let currentPhases: Phase[] = data.phases || [];
        const mandatoryPhases: Phase[] = [
          {
            id: "phase_0_agreement",
            name: "Rules and Regulations",
            description:
              "Please read the following rules and regulations carefully before proceeding...",
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
            description:
              "Provide your primary identity details. This information will be used for the hackathon registry.",
            isMandatory: true,
            fields: [
              { id: "name", label: "Full Name", type: "text", required: true },
              {
                id: "email",
                label: "Email Address",
                type: "email",
                required: true,
              },
              {
                id: "phone",
                label: "Phone Number",
                type: "tel",
                required: true,
              },
              {
                id: "year",
                label: "Current Year",
                type: "select",
                options: [
                  "1st Year",
                  "2nd Year",
                  "3rd Year",
                  "4th Year",
                  "Other",
                ],
                required: true,
              },
              {
                id: "branch",
                label: "Branch / Department",
                type: "text",
                required: true,
              },
              {
                id: "gender",
                label: "Gender",
                type: "select",
                options: ["Male", "Female", "Other", "Prefer not to say"],
                required: true,
              },
              {
                id: "collegeName",
                label: "College / University Name",
                type: "text",
                required: true,
              },
              {
                id: "github",
                label: "GitHub Profile URL",
                type: "url",
                required: true,
              },
              {
                id: "linkedin",
                label: "LinkedIn Profile URL",
                type: "url",
                required: true,
              },
            ],
          },
          {
            id: "phase_2_team_formation",
            name: "Team Formation",
            description: "Form or join a team to participate in the hackathon.",
            isMandatory: true,
            fields: [
              {
                id: "teamName",
                label: "Official Team Name",
                type: "text",
                required: true,
              },
              {
                id: "role",
                label: "Your Role / Specialization",
                type: "select",
                options: [
                  "Leader",
                  "Frontend",
                  "Backend",
                  "Fullstack",
                  "UI/UX Designer",
                  "AI/ML Engineer",
                ],
                required: true,
              },
              {
                id: "teamSize",
                label: "Team Size",
                type: "number",
                required: true,
              },
            ],
          },
          {
            id: "phase_3_submissions",
            name: "Project Submission",
            description:
              "Submit your final project details, repository links, and demo videos.",
            isMandatory: true,
            fields: [
              {
                id: "projectName",
                label: "Project Name",
                type: "text",
                required: true,
              },
              {
                id: "projectDescription",
                label: "Brief Description",
                type: "textarea",
                required: true,
              },
              {
                id: "repoLink",
                label: "GitHub Repository URL",
                type: "url",
                required: true,
              },
              {
                id: "demoLink",
                label: "Demo Video/Deployment Link",
                type: "url",
                required: true,
              },
            ],
          },
        ];

        // Ensure mandatory phases exist at the top in correct order
        // We iterate backwards so that rules is always above registration if both are added
        [...mandatoryPhases].reverse().forEach((mp) => {
          const exists = currentPhases.some((p) => p.id === mp.id);
          if (!exists) {
            currentPhases = [mp, ...currentPhases];
          }
        });

        setPhases(currentPhases);
      } catch (error) {
        console.error("Failed to fetch hackathon:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHackathon();
  }, [hackathonId]);

  const handleSave = async () => {
    const err = validatePhaseDates();
    if (err) {
      alert(
        `❌ Date constraint violation:\n\n${err}\n\nPhase dates must fall within the hackathon window set in Settings.`,
      );
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/hackathons/${hackathonId}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "x-uid": user?.uid || "",
        },
        body: JSON.stringify({
          phases,
          creatorId: user?.uid,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Server protocol rejection.");
      }

      alert("Phase configuration updated successfully");
    } catch (error) {
      console.error("Failed to update phases:", error);
      alert(`Failed to update phases: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  /** Validates phase dates are within the hackathon window. Returns error string or null. */
  const validatePhaseDates = (): string | null => {
    if (!hackathonBounds.startDate && !hackathonBounds.endDate) return null;
    const hStart = hackathonBounds.startDate
      ? new Date(hackathonBounds.startDate)
      : null;
    const hEnd = hackathonBounds.endDate
      ? new Date(hackathonBounds.endDate)
      : null;

    for (const phase of phases) {
      if (phase.isMandatory) continue;
      if (phase.startDate) {
        const ps = new Date(phase.startDate);
        if (hStart && ps < hStart)
          return `Phase "${phase.name}" starts before the hackathon begins.`;
        if (hEnd && ps > hEnd)
          return `Phase "${phase.name}" starts after the hackathon ends.`;
      }
      if (phase.endDate) {
        const pe = new Date(phase.endDate);
        if (hEnd && pe > hEnd)
          return `Phase "${phase.name}" ends after the hackathon ends (${hackathonBounds.endDate?.replace("T", " ")}).`;
        if (hStart && pe < hStart)
          return `Phase "${phase.name}" ends before the hackathon begins.`;
      }
      if (
        phase.startDate &&
        phase.endDate &&
        new Date(phase.startDate) >= new Date(phase.endDate)
      ) {
        return `Phase "${phase.name}" start time must be before its end time.`;
      }
    }
    return null;
  };

  const addPhase = () => {
    setPhases([
      ...phases,
      { id: `phase_${Date.now()}`, name: "New Phase", description: "" },
    ]);
  };

  const updatePhase = (index: number, updates: Partial<Phase>) => {
    const newPhases = [...phases];
    newPhases[index] = { ...newPhases[index], ...updates };
    setPhases(newPhases);
  };

  const removePhase = (index: number) => {
    setPhases(phases.filter((_, i) => i !== index));
  };

  const movePhaseUp = (index: number) => {
    if (index === 0) return;
    setPhases((prev) => {
      const newPhases = [...prev];
      [newPhases[index], newPhases[index - 1]] = [
        newPhases[index - 1],
        newPhases[index],
      ];
      return newPhases;
    });
  };

  const movePhaseDown = (index: number) => {
    if (index === phases.length - 1) return;
    setPhases((prev) => {
      const newPhases = [...prev];
      [newPhases[index], newPhases[index + 1]] = [
        newPhases[index + 1],
        newPhases[index],
      ];
      return newPhases;
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleFieldDragEnd = (event: DragEndEvent, pIdx: number) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setPhases((prevPhases) => {
        return prevPhases.map((phase, idx) => {
          if (idx === pIdx) {
            const fields = phase.fields || [];
            const oldIndex = fields.findIndex((f) => f.id === active.id);
            const newIndex = fields.findIndex((f) => f.id === over.id);
            return {
              ...phase,
              fields: arrayMove(fields, oldIndex, newIndex),
            };
          }
          return phase;
        });
      });
    }
  };

  const addField = (phaseIndex: number) => {
    setPhases((prevPhases) => {
      return prevPhases.map((phase, idx) => {
        if (idx === phaseIndex) {
          const fields = phase.fields || [];
          return {
            ...phase,
            fields: [
              ...fields,
              {
                id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                label: "New Field",
                type: "text",
                required: true,
              },
            ],
          };
        }
        return phase;
      });
    });
  };

  const updateField = (
    phaseIndex: number,
    fieldIndex: number,
    updates: Partial<PhaseField>,
  ) => {
    setPhases((prevPhases) => {
      return prevPhases.map((phase, pIdx) => {
        if (pIdx === phaseIndex) {
          const newFields = [...(phase.fields || [])];
          newFields[fieldIndex] = {
            ...newFields[fieldIndex],
            ...updates,
          };
          return {
            ...phase,
            fields: newFields,
          };
        }
        return phase;
      });
    });
  };

  const removeField = (phaseIndex: number, fieldId: string) => {
    setPhases((prevPhases) => {
      return prevPhases.map((phase, pIdx) => {
        if (pIdx === phaseIndex) {
          return {
            ...phase,
            fields: (phase.fields || []).filter((f) => f.id !== fieldId),
          };
        }
        return phase;
      });
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader text="Syncing configuration..." />
      </div>
    );
  }

  if (user?.uid !== creatorId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] font-orbitron p-8 text-center">
        <div className="h-20 w-20 bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-6 rounded-full shadow-[0_0_20px_rgba(244,63,94,0.2)]">
          <svg
            className="w-10 h-10 text-rose-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m0 0v2m0-2h2m-2 0H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-3xl font-black text-white tracking-widest uppercase mb-4">
          Architect Mode Restricted
        </h2>
        <p className="text-slate-500 max-w-md text-sm leading-relaxed mb-8">
          Modification protocols are encrypted. Only the authorized creator can
          reconfigure this hackathon's neural parameters.
        </p>
        <button
          onClick={() => window.history.back()}
          className="neon-btn-cyan !px-12"
        >
          ABORT AND RETURN
        </button>
      </div>
    );
  }

  return (
    <section className="space-y-5 pb-16 relative overflow-hidden">
      {/* Background Radial Glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 50% 10%, rgba(0,245,255,0.03) 0%, transparent 60%)",
        }}
      />

      <header
        className="glass-card p-5 sm:p-8 border-cyan-500/30 flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-end relative z-10"
      >
        <div>
          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400 font-orbitron mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00ffff] animate-pulse" />
            System Config
          </p>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight font-orbitron">
            Phase <span className="text-cyan-400 text-glow">Architect</span>
          </h1>
        </div>
        <div className="flex flex-col sm:items-end gap-2">
          {/* System Logs */}
          <div className="hidden md:flex flex-col items-end text-[8px] font-mono text-cyan-500/50 uppercase tracking-widest mb-2">
            <span>[SYS] ARCHITECT_NODE_ACTIVE</span>
            <span>[SEC] ENCRYPTION_ENABLED</span>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="neon-btn-cyan w-full sm:w-auto relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center gap-2">
              {saving ? (
                <>
                  <span className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  COMMITTING...
                </>
              ) : (
                "COMMIT PHASES"
              )}
            </span>
          </button>
        </div>
      </header>

      <div className="space-y-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
          <h2 className="text-sm font-orbitron text-cyan-400 tracking-widest uppercase">
            Phase Definitions
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
        </div>
        {phases.map((phase, pIdx) => (
          <article
            key={phase.id}
            className="glass-card p-6 border-white/10 relative group transition-all duration-300 hover:border-cyan-500/30 hover:shadow-[0_0_30px_rgba(0,255,255,0.05)]"
            style={{ animationDelay: `${pIdx * 0.1}s` }}
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500/0 group-hover:bg-cyan-500/50 transition-all duration-300 shadow-[0_0_15px_#00ffff] opacity-0 group-hover:opacity-100" />

            <div className="absolute top-4 right-4 flex items-center gap-4 opacity-50 group-hover:opacity-100 transition-opacity">
              <div className="flex gap-2">
                <button
                  onClick={() => movePhaseUp(pIdx)}
                  disabled={pIdx === 0}
                  className="text-[10px] font-black text-cyan-500 hover:text-cyan-300 hover:bg-cyan-500/10 px-2 py-1 rounded disabled:opacity-20 font-orbitron tracking-widest transition-all"
                >
                  UP ↑
                </button>
                <button
                  onClick={() => movePhaseDown(pIdx)}
                  disabled={pIdx === phases.length - 1}
                  className="text-[10px] font-black text-cyan-500 hover:text-cyan-300 hover:bg-cyan-500/10 px-2 py-1 rounded disabled:opacity-20 font-orbitron tracking-widest transition-all"
                >
                  DOWN ↓
                </button>
              </div>
              {!phase.isMandatory && (
                <button
                  onClick={() => removePhase(pIdx)}
                  className="text-[10px] font-black text-rose-500 hover:text-rose-300 hover:bg-rose-500/10 px-2 py-1 rounded font-orbitron tracking-widest transition-all"
                >
                  DELETE PHASE
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
              <div>
                <label className="block text-[10px] text-slate-500 font-orbitron uppercase mb-1">
                  Phase Name
                </label>
                <input
                  value={phase.name}
                  onChange={(e) => updatePhase(pIdx, { name: e.target.value })}
                  className="bg-slate-900/50 border border-white/10 px-3 py-2 w-full text-sm font-orbitron focus:border-cyan-400 focus:bg-cyan-500/5 focus:shadow-[0_0_15px_rgba(0,255,255,0.1)] outline-none transition-all duration-300 text-white"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] text-slate-500 font-orbitron uppercase mb-1">
                  Description{" "}
                  <span className="text-cyan-400/50 normal-case font-mono">
                    — Markdown supported
                  </span>
                </label>
                <textarea
                  value={phase.description}
                  onChange={(e) =>
                    updatePhase(pIdx, { description: e.target.value })
                  }
                  className="bg-slate-900/50 border border-white/10 px-3 py-2 w-full text-sm font-mono focus:border-cyan-400 focus:bg-cyan-500/5 focus:shadow-[0_0_15px_rgba(0,255,255,0.1)] outline-none min-h-[80px] transition-all duration-300 text-white"
                  placeholder="Supports **bold**, *italic*, [links](url), etc."
                />
                {phase.description && (
                  <div className="mt-2 p-3 bg-cyan-500/5 border border-cyan-500/10 rounded-sm">
                    <p className="text-[8px] font-black text-cyan-500/50 uppercase tracking-widest mb-2">Live Preview</p>
                    <div className="prose prose-invert prose-xs max-w-none text-[11px] text-slate-300 font-mono leading-relaxed">
                      <ReactMarkdown>{phase.description}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
              {!phase.isMandatory ||
              phase.id === "phase_1_registration" ||
              phase.id === "phase_2_team_formation" ||
              phase.id === "phase_3_submissions" ? (
                <>
                  {(hackathonBounds.startDate || hackathonBounds.endDate) && (
                    <div className="col-span-2 flex items-center gap-2 py-2 px-3 bg-amber-500/5 border border-amber-500/20 text-[10px] font-mono text-amber-400">
                      <span>⚠</span> Phase dates must be within the hackathon
                      window:
                      <span className="text-white/60">
                        {hackathonBounds.startDate &&
                          ` From ${hackathonBounds.startDate.replace("T", " ")}`}
                        {hackathonBounds.endDate &&
                          ` → Until ${hackathonBounds.endDate.replace("T", " ")}`}
                      </span>
                    </div>
                  )}
                  <div>
                    <label className="block text-[10px] text-slate-500 font-orbitron uppercase mb-1">
                      Phase Start Date
                    </label>
                    <input
                      type="datetime-local"
                      value={formatForInput(phase.startDate)}
                      min={formatForInput(hackathonBounds.startDate)}
                      max={formatForInput(hackathonBounds.endDate)}
                      onChange={(e) =>
                        updatePhase(pIdx, {
                          startDate: e.target.value
                            ? new Date(e.target.value).toISOString()
                            : undefined,
                        })
                      }
                      className="bg-slate-900/50 border border-white/10 px-3 py-2 w-full text-sm font-mono focus:border-cyan-400 focus:bg-cyan-500/5 focus:shadow-[0_0_15px_rgba(0,255,255,0.1)] outline-none transition-all duration-300 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-orbitron uppercase mb-1">
                      Phase End Date
                    </label>
                    <input
                      type="datetime-local"
                      value={formatForInput(phase.endDate)}
                      min={
                        phase.startDate
                          ? formatForInput(phase.startDate)
                          : formatForInput(hackathonBounds.startDate)
                      }
                      max={formatForInput(hackathonBounds.endDate)}
                      onChange={(e) =>
                        updatePhase(pIdx, {
                          endDate: e.target.value
                            ? new Date(e.target.value).toISOString()
                            : undefined,
                        })
                      }
                      className="bg-slate-900/50 border border-white/10 px-3 py-2 w-full text-sm font-mono focus:border-cyan-400 focus:bg-cyan-500/5 focus:shadow-[0_0_15px_rgba(0,255,255,0.1)] outline-none transition-all duration-300 text-white"
                    />
                  </div>
                </>
              ) : (
                <div className="col-span-2 flex items-center gap-2 py-2 px-3 bg-cyan-500/5 border border-cyan-500/20 text-[10px] font-mono text-cyan-400">
                  <span>ℹ</span> This phase has no date restriction — it is
                  always available while the hackathon is active.
                </div>
              )}
            </div>

            <div className="mt-6 border-t border-white/5 pt-6 relative">
              <h3 className="text-xs font-orbitron text-cyan-400 mb-4 flex justify-between items-center bg-cyan-500/5 px-4 py-2 border border-cyan-500/10 rounded-sm">
                FORM FIELDS
                <button
                  onClick={() => addField(pIdx)}
                  className="text-white hover:text-cyan-400 transition-colors flex items-center gap-2 text-[10px] tracking-widest"
                >
                  <span className="text-cyan-400">+</span> ADD FIELD
                </button>
              </h3>
              <div className="space-y-4">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCorners}
                  onDragEnd={(event) => handleFieldDragEnd(event, pIdx)}
                >
                  <SortableContext
                    items={phase.fields?.map((f) => f.id) || []}
                    strategy={verticalListSortingStrategy}
                  >
                    {phase.fields?.map((field, fIdx) => (
                      <SortableField
                        key={field.id}
                        field={field}
                        pIdx={pIdx}
                        fIdx={fIdx}
                        updateField={updateField}
                        removeField={removeField}
                        phase={phase}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
                {(!phase.fields || phase.fields.length === 0) && (
                  <p className="text-slate-500 text-xs font-mono italic">
                    No fields defined. Add a field to collect data.
                  </p>
                )}
              </div>
            </div>
          </article>
        ))}

        <button
          onClick={addPhase}
          className="w-full glass-card p-6 border-dashed border-cyan-500/20 hover:border-cyan-400 hover:text-cyan-400 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,255,255,0.1)] hover:bg-cyan-500/5 font-orbitron text-sm uppercase tracking-widest flex items-center justify-center gap-3 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          <span className="text-xl font-bold text-cyan-500 group-hover:text-cyan-400 group-hover:scale-125 transition-transform">
            +
          </span>
          <span>Add New Phase</span>
        </button>
      </div>
    </section>
  );
}
