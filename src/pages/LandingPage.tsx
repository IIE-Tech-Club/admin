import { Link } from "@tanstack/react-router";
import CircuitBackground from "../components/ui/CircuitBackground";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-white font-orbitron relative overflow-hidden flex flex-col items-center justify-center">
      {/* Background with circuit lines */}
      <CircuitBackground opacity={0.5} />
      
      {/* Ambient glow effects */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl px-6 text-center">
        <div className="mb-6 inline-block">
          <div className="flex items-center gap-2 px-3 py-1 border border-cyan-500/30 bg-cyan-500/5 rounded-full mb-8 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400">System Online // v2.0.0</span>
          </div>
        </div>

        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter mb-6 leading-none">
          CODE<span className="text-cyan-400">CRAFT</span>
          <br />
          <span className="text-white/20">ADMIN</span>
        </h1>

        <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
          The ultimate control center for managing next-generation hackathons. 
          Monitor registrations, organize teams, and oversee live submissions with real-time precision.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link
            to="/login"
            className="group relative px-10 py-4 bg-cyan-500 text-black font-black uppercase tracking-widest text-sm hover:bg-cyan-400 transition-all duration-300 overflow-hidden shadow-[0_0_20px_rgba(34,211,238,0.3)]"
          >
            <span className="relative z-10">Access Control Center</span>
            <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 opacity-20"></div>
          </Link>
          
          <div className="flex items-center gap-4 text-slate-500">
            <div className="w-12 h-px bg-slate-800"></div>
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase">Auth Required</span>
            <div className="w-12 h-px bg-slate-800"></div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-10 left-10 text-slate-600 font-mono text-[10px] hidden sm:block">
        SECURE_UPLINK_ESTABLISHED
      </div>
      <div className="absolute bottom-10 right-10 text-slate-600 font-mono text-[10px] hidden sm:block">
        TERMINAL_READY
      </div>
    </div>
  );
}
