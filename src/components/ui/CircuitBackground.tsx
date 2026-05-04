"use client";

interface CircuitBackgroundProps {
  className?: string;
  opacity?: number;
}

export default function CircuitBackground({ className = "", opacity = 0.6 }: CircuitBackgroundProps) {
  return (
    <>
      {/* Base Solid Background Layer */}
      <div 
        className={`fixed inset-0 z-[-2] bg-[#02040a] ${className}`} 
        aria-hidden="true" 
      />

      {/* Global Flowing Circuit Layer (Matching Landing Page) */}
      <div 
        className="fixed inset-0 z-[-1] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='800'%3E%3Cg stroke='rgba(0, 245, 255, 0.12)' stroke-width='1.5' fill='none'%3E%3Cpath d='M 0 100 L 150 100 L 200 150 L 800 150'/%3E%3Cpath d='M 300 0 L 300 250 L 350 300 L 350 800'/%3E%3Cpath d='M 0 600 L 250 600 L 300 550 L 800 550'/%3E%3Cpath d='M 650 0 L 650 200 L 600 250 L 600 800'/%3E%3Cpath d='M 400 0 L 400 80 L 450 130 L 800 130' stroke='rgba(139, 92, 246, 0.1)'/%3E%3Cpath d='M 0 700 L 80 700 L 130 750 L 800 750' stroke='rgba(0, 245, 255, 0.1)'/%3E%3Cpath d='M 750 0 L 750 600 L 700 650 L 700 800' stroke='rgba(139, 92, 246, 0.1)'/%3E%3C/g%3E%3Cg fill='rgba(0, 245, 255, 0.2)'%3E%3Ccircle cx='150' cy='100' r='4'/%3E%3Ccircle cx='300' cy='250' r='4'/%3E%3Ccircle cx='250' cy='600' r='4'/%3E%3Ccircle cx='650' cy='200' r='4'/%3E%3Ccircle cx='400' cy='80' r='2'/%3E%3Ccircle cx='80' cy='700' r='2'/%3E%3Ccircle cx='750' cy='600' r='2'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '800px 800px',
          animation: 'flowCircuit 45s linear infinite, circuitPulse 4s ease-in-out infinite',
          opacity: opacity
        }}
        aria-hidden="true"
      />
    </>
  );
}
