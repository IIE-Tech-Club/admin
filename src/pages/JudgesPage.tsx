import { useState, useEffect } from "react";
import { useParams } from "@tanstack/react-router";
import { auth } from "../lib/firebase";

interface Judge {
  email: string;
  status: string;
  name?: string;
  avatar?: string;
}

interface JudgingParameter {
  name: string;
  maxScore: number;
}

export function JudgesPage() {
  const { hackathonId } = useParams({ from: "/h/$hackathonId/judges" });
  const [judges, setJudges] = useState<Judge[]>([]);
  const [parameters, setParameters] = useState<JudgingParameter[]>([]);
  const [newJudgeEmail, setNewJudgeEmail] = useState("");
  const [newParamName, setNewParamName] = useState("");
  const [newParamMaxScore, setNewParamMaxScore] = useState(10);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchHackathonData();
  }, [hackathonId]);

  const fetchHackathonData = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/hackathons/${hackathonId}`);
      if (res.ok) {
        const data = await res.json();
        setJudges(data.judges || []);
        setParameters(data.judgingParameters || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const saveHackathonData = async (updatedJudges: Judge[], updatedParams: JudgingParameter[]) => {
    if (!auth.currentUser) return;
    setSaving(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/hackathons/${hackathonId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorId: auth.currentUser.uid,
          judges: updatedJudges,
          judgingParameters: updatedParams
        })
      });
      if (res.ok) {
        setJudges(updatedJudges);
        setParameters(updatedParams);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddJudge = () => {
    if (!newJudgeEmail) return;
    const updatedJudges = [...judges, { email: newJudgeEmail, status: "invited" }];
    saveHackathonData(updatedJudges, parameters);
    setNewJudgeEmail("");
  };

  const handleRemoveJudge = (emailToRemove: string) => {
    const updatedJudges = judges.filter(j => j.email !== emailToRemove);
    saveHackathonData(updatedJudges, parameters);
  };

  const handleAddParameter = () => {
    if (!newParamName) return;
    const updatedParams = [...parameters, { name: newParamName, maxScore: newParamMaxScore }];
    saveHackathonData(judges, updatedParams);
    setNewParamName("");
    setNewParamMaxScore(10);
  };

  const handleRemoveParameter = (nameToRemove: string) => {
    const updatedParams = parameters.filter(p => p.name !== nameToRemove);
    saveHackathonData(judges, updatedParams);
  };

  if (loading) return <div className="p-6 text-cyan-400 font-orbitron">Loading...</div>;

  return (
    <div className="space-y-8 max-w-4xl font-grotesk">
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider font-orbitron border-b border-cyan-500/20 pb-4">
          Judging Panel Configuration
        </h2>
        
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-2">Evaluators</h3>
          <div className="flex gap-4 mb-4">
            <input
              type="email"
              placeholder="Judge Email Address"
              value={newJudgeEmail}
              onChange={e => setNewJudgeEmail(e.target.value)}
              className="flex-1 bg-slate-900/50 border border-slate-700 p-2 rounded text-white"
            />
            <button onClick={handleAddJudge} disabled={saving} className="neon-btn-cyan px-4">
              Add Judge
            </button>
          </div>
          
          {judges.length > 0 ? (
            <div className="grid gap-3">
              {judges.map((j, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-slate-900/50 border border-cyan-500/20 rounded">
                  <div>
                    <span className="text-white font-medium">{j.email}</span>
                    <span className={`ml-3 text-xs uppercase tracking-widest ${j.status === 'accepted' ? 'text-green-400' : 'text-amber-400'}`}>
                      {j.status}
                    </span>
                  </div>
                  <button onClick={() => handleRemoveJudge(j.email)} className="text-red-400 hover:text-red-300 text-sm">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No judges added yet.</p>
          )}
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-4">Scoring Parameters</h3>
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Parameter Name (e.g. Innovation)"
            value={newParamName}
            onChange={e => setNewParamName(e.target.value)}
            className="flex-1 bg-slate-900/50 border border-slate-700 p-2 rounded text-white"
          />
          <input
            type="number"
            placeholder="Max Score"
            value={newParamMaxScore}
            onChange={e => setNewParamMaxScore(Number(e.target.value))}
            className="w-24 bg-slate-900/50 border border-slate-700 p-2 rounded text-white"
          />
          <button onClick={handleAddParameter} disabled={saving} className="neon-btn-cyan px-4">
            Add
          </button>
        </div>

        {parameters.length > 0 ? (
          <div className="grid gap-3">
            {parameters.map((p, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-slate-900/50 border border-cyan-500/20 rounded">
                <div>
                  <span className="text-white font-medium">{p.name}</span>
                  <span className="ml-3 text-cyan-400 text-sm font-mono">Max: {p.maxScore}</span>
                </div>
                <button onClick={() => handleRemoveParameter(p.name)} className="text-red-400 hover:text-red-300 text-sm">
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">No parameters configured. Evaluators will not be able to score until parameters are set.</p>
        )}
      </div>
    </div>
  );
}
