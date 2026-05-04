import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

const QRScanner = ({ onScan, onClose }: QRScannerProps) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Timeout to ensure the DOM element is ready
    const timer = setTimeout(() => {
      const scanner = new Html5QrcodeScanner(
        'qr-reader',
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        /* verbose= */ false
      );

      scanner.render(
        (decodedText) => {
          onScan(decodedText);
          // Removed scanner.clear() to allow continuous scanning
        },
        () => {
          // silent error for scan failures
        }
      );

      scannerRef.current = scanner;
    }, 100);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.clear().catch(e => console.error("Failed to clear scanner", e));
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="relative glass-card border-cyan-500/30 w-full max-w-md overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.15)]">
        {/* Cyberpunk corners */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-500" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-500" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-500" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-500" />

        <div className="p-4 border-b border-cyan-500/20 flex justify-between items-center bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-cyan-400 animate-pulse rounded-full" />
            <h3 className="font-orbitron text-white text-xs tracking-[0.3em] uppercase">Visual Uplink: Scanner</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-cyan-400 transition-colors p-1 hover:bg-cyan-500/10 rounded"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="p-6 bg-slate-950/90">
          <div id="qr-reader" className="overflow-hidden rounded border border-cyan-500/10 qr-custom-style"></div>
          
          <style>{`
            #qr-reader {
              border: none !important;
              background: transparent !important;
            }
            #qr-reader__scan_region {
              background: rgba(15, 23, 42, 0.5) !important;
              border-radius: 8px !important;
            }
            #qr-reader__dashboard {
              background: transparent !important;
              padding: 20px 0 0 0 !important;
              color: #94a3b8 !important;
              font-family: 'Orbitron', sans-serif !important;
              text-transform: uppercase !important;
              letter-spacing: 0.1em !important;
              font-size: 10px !important;
            }
            #qr-reader__dashboard button {
              background: rgba(6, 182, 212, 0.1) !important;
              border: 1px solid rgba(6, 182, 212, 0.3) !important;
              color: #22d3ee !important;
              padding: 8px 16px !important;
              border-radius: 0 !important;
              text-transform: uppercase !important;
              font-size: 10px !important;
              font-weight: bold !important;
              cursor: pointer !important;
              transition: all 0.2s !important;
            }
            #qr-reader__dashboard button:hover {
              background: rgba(6, 182, 212, 0.2) !important;
              border-color: #22d3ee !important;
            }
            #qr-reader__camera_selection {
              background: #0f172a !important;
              border: 1px solid rgba(6, 182, 212, 0.2) !important;
              color: #94a3b8 !important;
              padding: 4px !important;
              margin-bottom: 10px !important;
              outline: none !important;
            }
            #qr-reader img {
                display: none !important;
            }
            #qr-reader__status_span {
                display: none !important;
            }
          `}</style>
        </div>

        <div className="p-4 border-t border-cyan-500/10 bg-slate-900/50">
          <p className="text-[9px] text-cyan-500/60 font-orbitron text-center tracking-[0.2em] uppercase leading-relaxed">
            Position entity QR within containment field<br/>
            <span className="text-slate-600 font-mono text-[8px]">Awaiting Signal...</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
