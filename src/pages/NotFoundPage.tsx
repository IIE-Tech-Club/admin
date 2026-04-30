import { Link } from '@tanstack/react-router'

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-[#020408] relative overflow-hidden">
      {/* Background FX */}
      <div className="scanline-overlay" />
      <div className="tech-grid" />
      
      <div className="circuit-bg">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i} 
            className="circuit-line" 
            style={{ 
              left: `${i * 20}%`, 
              animationDelay: `${(i * 1.5) % 6}s`,
              opacity: 0.3 
            }} 
          />
        ))}
      </div>

      <div className="w-full max-w-lg text-center relative z-10 animate-fade-up py-12">
        {/* 404 display */}
        <div className="mb-8 relative inline-block">
          <div className="text-[120px] md:text-[150px] font-orbitron font-black leading-none text-white opacity-90 select-none tracking-tighter">
            404
          </div>
          <div className="absolute inset-0 text-[120px] md:text-[150px] font-orbitron font-black leading-none text-[#00f5ff] blur-2xl opacity-40 select-none tracking-tighter">
            404
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 border border-[#00f5ff]/20 bg-[#00f5ff]/5 rounded-sm w-fit mx-auto mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00f5ff] animate-pulse" />
          <span className="text-[10px] font-orbitron font-bold text-[#00f5ff] tracking-[0.2em] uppercase">
            Access Denied / Not Found
          </span>
        </div>

        <h1 className="text-2xl md:text-3xl font-orbitron font-bold text-white mb-4 tracking-tight">
          SIGNAL DEGRADED
        </h1>
        
        <p className="font-grotesk text-[rgba(224,247,255,0.5)] text-sm leading-relaxed max-w-xs mx-auto mb-10">
          The requested coordinate <code className="text-[#00f5ff]/80 bg-[#00f5ff]/10 px-1.5 py-0.5 rounded text-[11px]">{window.location.pathname}</code> does not exist in the administrative core.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            to="/" 
            className="neon-btn-cyan w-full sm:w-auto"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Re-Initialize
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="neon-btn-outline w-full sm:w-auto"
          >
            Back to previous state
          </button>
        </div>

        {/* System log */}
        <div className="mt-12 text-left bg-black/40 border border-white/5 p-4 rounded-sm max-w-sm mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">Diagnostic Log</span>
            <span className="text-[9px] font-mono text-[#00f5ff]/40">ID: 0x404_CORE</span>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-mono text-[#f43f5e]/70">{`> ERROR: PATH_RESOLUTION_FAILURE`}</p>
            <p className="text-[10px] font-mono text-white/20">{`> STACK: router_v3.layer.access`}</p>
            <p className="text-[10px] font-mono text-white/20">{`> TIMESTAMP: ${new Date().toISOString()}`}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
