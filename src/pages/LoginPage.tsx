import { useState, type SyntheticEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import CircuitBackground from "../components/ui/CircuitBackground";
import { toast } from "sonner";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: SyntheticEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Authentication successful. Welcome, Architect.");
        localStorage.setItem("admin_auth", Date.now().toString());
        navigate({ to: "/hackathon" });
      } else {
        toast.error(data.message || "Access Denied: Invalid Credentials.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Connection error. System offline.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white font-orbitron relative overflow-hidden flex flex-col items-center justify-center p-4">
      <CircuitBackground opacity={0.5} />
      
      {/* Ambient glow effects */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 px-3 py-1 border border-cyan-500/30 bg-cyan-500/5 rounded-full mb-6 mx-auto">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400">Security Gate // Node_Login</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">
            ADMIN <span className="text-cyan-400">AUTH</span>
          </h1>
          <p className="text-slate-500 text-xs font-bold tracking-widest uppercase">
            Verify credentials to proceed
          </p>
        </div>

        <div className="glass-card p-8 border-white/10 relative overflow-hidden">
          {/* Scanline effect */}
          <div className="absolute inset-0 pointer-events-none bg-linear-to-b from-transparent via-cyan-500/5 to-transparent h-20 w-full animate-scanline"></div>
          
          <form onSubmit={handleLogin} className="space-y-6 relative z-10">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                Gmail Node
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 px-4 py-3 text-sm focus:border-cyan-500 outline-none transition-colors font-mono"
                placeholder="architect@gmail.com"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                Access Password
              </label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 px-4 py-3 text-sm focus:border-cyan-500 outline-none transition-colors font-mono"
                placeholder="••••••••••••"
              />
            </div>

            <button
              disabled={isLoading}
              type="submit"
              className={`w-full group relative py-4 ${
                isLoading ? "bg-slate-800" : "bg-cyan-500 hover:bg-cyan-400"
              } text-black font-black uppercase tracking-widest text-sm transition-all duration-300 overflow-hidden`}
            >
              <span className="relative z-10">
                {isLoading ? "Verifying..." : "Initialize Link"}
              </span>
              {!isLoading && (
                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 opacity-20"></div>
              )}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-slate-600 text-[10px] font-mono tracking-widest uppercase">
          Protocol: OAuth_2.0_Encrypted // Local_Node_Verify
        </p>
      </div>
    </div>
  );
}
