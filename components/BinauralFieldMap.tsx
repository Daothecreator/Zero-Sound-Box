"use client";
import React, { useRef, useState } from 'react';
import { Crosshair } from 'lucide-react';

interface BinauralFieldMapProps {
  partials: any[];
  onChange: (index: number, x: number, y: number) => void;
}

export default function BinauralFieldMap({ partials, onChange }: BinauralFieldMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<number | null>(null);

  const handlePointerDown = (e: React.PointerEvent, idx: number) => {
    e.stopPropagation();
    setDragging(idx);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragging === null || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // map relative to center, scaled so radius = 1 is the boundary
    let x = (e.clientX - rect.left - centerX) / (rect.width / 2);
    let y = (e.clientY - rect.top - centerY) / (rect.height / 2);
    
    // clamp to unit circle
    const dist = Math.sqrt(x*x + y*y);
    if (dist > 1) {
      x /= dist;
      y /= dist;
    }
    
    onChange(dragging, x, y);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragging !== null) {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      setDragging(null);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div 
        className="relative w-full max-w-[240px] aspect-square rounded-full border border-blue-500/30 bg-black/40 overflow-hidden shadow-inner flex-shrink-0 touch-none"
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-3/4 h-3/4 rounded-full border border-blue-400/10"></div>
          <div className="w-1/2 h-1/2 rounded-full border border-blue-400/10 absolute"></div>
          <div className="absolute w-full h-[1px] bg-blue-400/10"></div>
          <div className="absolute h-full w-[1px] bg-blue-400/10"></div>
          <Crosshair className="w-3 h-3 text-blue-500/30 absolute" />
        </div>
        
        {partials.map((p, idx) => {
          const x = p.posX || 0;
          const y = p.posY || 0;
          const left = `${(x + 1) * 50}%`;
          const top = `${(y + 1) * 50}%`;
          
          return (
            <div
              key={idx}
              className={`absolute w-7 h-7 -ml-3.5 -mt-3.5 rounded-full flex items-center justify-center cursor-pointer transition-transform ${dragging === idx ? 'scale-125 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] z-10' : 'bg-blue-500/40 hover:bg-blue-400/80 border border-blue-300/30 z-0'}`}
              style={{ left, top }}
              onPointerDown={(e) => handlePointerDown(e, idx)}
            >
              <span className="text-[10px] text-white font-mono font-bold">{idx + 1}</span>
            </div>
          )
        })}
      </div>
      <p className="text-[10px] text-white/30 uppercase tracking-widest font-mono text-center">
        Drag sources to position in 3D space
      </p>
    </div>
  )
}
