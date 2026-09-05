"use client";

import React, { useRef, useEffect, useState } from 'react';
import { audioEngine, AudioConfig } from '@/lib/audio';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  tx: number;
  ty: number;
  band: number;
  phase: number;
  size: number;
  orbitalAngle: number;
  orbitalSpeed: number;
  orbitalRadius: number;
}

interface Props {
  isPlaying: boolean;
  config: AudioConfig;
  activeMode: string;
}

const BANDS = [
  { freq: 0.125, color: '#6b7280' }, // INF
  { freq: 1.25,  color: '#8b5cf6' }, // DELTA
  { freq: 5.08,  color: '#06b6d4' }, // THETA
  { freq: 10.55, color: '#22c55e' }, // ALPHA
  { freq: 20.51, color: '#eab308' }, // BETA
  { freq: 40.0,  color: '#f97316' }, // GAMMA
  { freq: 90.12, color: '#ef4444' }  // OMEGA
];

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

const hexToRgbaStr = (hex: string, alpha: number) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return `rgba(255, 255, 255, ${alpha})`;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

class SpatialHashGrid {
  bounds: [number, number];
  dimensions: [number, number];
  cells: Map<string, number[]>;

  constructor(bounds: [number, number], dimensions: [number, number]) {
    this.bounds = bounds;
    this.dimensions = dimensions;
    this.cells = new Map();
  }

  _getKey(x: number, y: number) {
    const i = Math.floor(x / this.dimensions[0]);
    const j = Math.floor(y / this.dimensions[1]);
    return `${i},${j}`;
  }

  insert(idx: number, particle: Particle) {
    const key = this._getKey(particle.x, particle.y);
    if (!this.cells.has(key)) {
      this.cells.set(key, []);
    }
    this.cells.get(key)!.push(idx);
  }

  getNearby(particle: Particle) {
    const x = particle.x;
    const y = particle.y;
    const i = Math.floor(x / this.dimensions[0]);
    const j = Math.floor(y / this.dimensions[1]);
    
    const clients: number[] = [];
    for (let xOffset = -1; xOffset <= 1; xOffset++) {
      for (let yOffset = -1; yOffset <= 1; yOffset++) {
        const key = `${i + xOffset},${j + yOffset}`;
        if (this.cells.has(key)) {
          clients.push(...this.cells.get(key)!);
        }
      }
    }
    return clients;
  }
}

export default function QuantumDustBackground({ isPlaying, config, activeMode }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showHUD, setShowHUD] = useState(false);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    window.addEventListener('resize', resize);

    const NUM_PARTICLES = width > 520 ? 3500 : 1500;
    const particles: Particle[] = [];

    for (let i = 0; i < NUM_PARTICLES; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: 0,
        vy: 0,
        tx: Math.random() * width,
        ty: Math.random() * height,
        band: i % 7,
        phase: Math.random() * Math.PI * 2,
        size: 1.0 + Math.random() * 2.2,
        orbitalAngle: Math.random() * Math.PI * 2,
        orbitalSpeed: 0.002 + Math.random() * 0.008,
        orbitalRadius: 20 + Math.random() * 80
      });
    }

    let mouseX = -1000;
    let mouseY = -1000;
    let touchDecay = 0;

    const handlePointerMove = (e: PointerEvent | MouseEvent | TouchEvent) => {
      if ('touches' in e) {
        mouseX = (e as TouchEvent).touches[0].clientX;
        mouseY = (e as TouchEvent).touches[0].clientY;
      } else {
        mouseX = (e as MouseEvent).clientX;
        mouseY = (e as MouseEvent).clientY;
      }
      touchDecay = 1.0;
    };
    
    const handlePointerLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('mouseleave', handlePointerLeave);
    window.addEventListener('touchend', handlePointerLeave);

    // Audio state
    const bandAmps = new Array(7).fill(0);
    const targetAmplitudes = new Array(7).fill(0);

    // Lorenz Attractor Initial State
    let lx = 0.1, ly = 0, lz = 0;
    
    // Physics globals
    let t = 0;

    const render = () => {
      t += 0.016;
      ctx.clearRect(0, 0, width, height);

      const PHI = 1.618033988749895;

      // Amplitude Source
      for (let i = 0; i < 7; i++) {
        if (isPlaying && audioEngine.fftWorklet) {
           targetAmplitudes[i] = Math.min(1.0, audioEngine.latestAmplitudes[i] * 50);
        } else {
           // Simulated amplitude calculation if not playing or worklet not ready
           const f_i = BANDS[i].freq;
           const envelope = 0.6 + 0.4 * Math.sin(t * 0.3 + i);
           const noise = Math.random();
           const simulatedAmp = (
             Math.sin(2 * Math.PI * f_i * t) * 0.5 + 0.5 +
             Math.sin(2 * Math.PI * f_i * PHI * t) * 0.25 +
             noise * 0.1
           ) * envelope;
           targetAmplitudes[i] = Math.max(0, Math.min(1, simulatedAmp));
        }
      }

      for (let i = 0; i < 7; i++) {
        bandAmps[i] += (targetAmplitudes[i] - bandAmps[i]) * 0.1;
      }

      const mean_amp = bandAmps.reduce((sum, val) => sum + val, 0) / 7;

      // Gather DOM Elements for UI Repulsion (Proxy Colliders)
      const colliders = Array.from(document.querySelectorAll('button, input, select, .hud-panel')).map(el => {
        const rect = el.getBoundingClientRect();
        return {
          x: rect.left,
          y: rect.top,
          w: rect.width,
          h: rect.height,
          cx: rect.left + rect.width / 2,
          cy: rect.top + rect.height / 2
        };
      });

      // Update touch decay
      touchDecay *= 0.97;
      if (touchDecay < 0.01) touchDecay = 0;

      // Update Lorenz (3 steps per frame)
      const dt = 0.008;
      const sigma = 10;
      const rho = 28;
      const beta = 2.6666666666666665;
      
      for(let step = 0; step < 3; step++) {
        const dx = sigma * (ly - lx);
        const dy = lx * (rho - lz) - ly;
        const dz = lx * ly - beta * lz;
        lx += dx * dt;
        ly += dy * dt;
        lz += dz * dt;
      }

      const cx = width / 2;
      const cy = height / 2;
      const minWH = Math.min(width, height);
      const N = NUM_PARTICLES;

      // Update all particles
      for (let i = 0; i < N; i++) {
        const p = particles[i];
        const amp = bandAmps[p.band];
        const f_band = BANDS[p.band].freq;

        // Attractors
        if (activeMode === 'spiral') {
          const theta = t * 0.3 + i * 0.05 + p.phase;
          const a = 15 + amp * 140;
          const r = Math.min(a * Math.pow(PHI, theta / (Math.PI * 2)), minWH * 0.44);

          const base_x = cx + Math.cos(theta) * r * (0.85 + 0.15 * Math.sin(p.band));
          const base_y = cy + Math.sin(theta) * r * (0.85 + 0.15 * Math.cos(p.band));

          p.orbitalAngle += p.orbitalSpeed * (1 + amp);
          p.tx = base_x + Math.cos(p.orbitalAngle) * p.orbitalRadius * amp;
          p.ty = base_y + Math.sin(p.orbitalAngle) * p.orbitalRadius * amp;
        } else if (activeMode === 'lorenz') {
          const sc = 6 + amp * 3;
          const px = lx * sc + cx;
          const py = lz * sc * 0.6 + cy * 0.8;

          const ang = i * 2.39996 + t * 0.2;
          const dist = 10 + amp * 45 + (i % 6) * 7;
          const breath = 1 + 0.3 * Math.sin(t * 0.5 + p.band);

          p.tx = px + Math.cos(ang) * dist * breath;
          p.ty = py + Math.sin(ang + t * 0.15) * dist * breath;
        } else if (activeMode === 'crystal') {
          const cols = 9 + Math.floor(amp * 5);
          const sp = minWH / (cols + 2);
          const row = Math.floor(i / cols);
          const col = i % cols;
          const offX = (row % 2) * sp * 0.5;

          const bx = cx - (cols * sp) / 2 + col * sp + offX;
          const by = cy - ((N / cols) * sp) / 4 + row * sp * 0.866;

          const wave = Math.sin(t * f_band * 0.12 + p.phase + t * 0.3) * amp * 22;
          const wave2 = Math.cos(t * 0.7 + i * 0.01) * 8;

          p.tx = bx + wave * Math.cos(p.phase) + wave2;
          p.ty = by + wave * Math.sin(p.phase) + wave2 * 0.5;
        } else if (activeMode === 'ring') {
          const ring = p.band + 1;
          const br = ring * 38 + amp * 65;
          const pir = Math.floor(N / 7);
          const idx = Math.floor(i / 7);

          const spin = t * 0.1 * (ring % 2 === 0 ? 1 : -1) * (1 + amp * 0.5);
          const ang = (idx / pir) * (Math.PI * 2) + spin;

          const w = Math.sin(ang * ring + t * f_band * 0.06) * amp * 20;
          const r = br + w;

          p.tx = cx + Math.cos(ang) * r;
          p.ty = cy + Math.sin(ang) * r;
        } else {
          p.tx = cx + Math.cos(p.phase + t) * 100;
          p.ty = cy + Math.sin(p.phase + t) * 100;
        }

        // Physics Forces
        const k = 0.016 + mean_amp * 0.022;
        const F_spring_x = k * (p.tx - p.x);
        const F_spring_y = k * (p.ty - p.y);

        const F_drift_x = Math.sin(t * 0.4 + p.phase) * 0.15 * amp;
        const F_drift_y = Math.cos(t * 0.3 + p.band) * 0.15 * amp;

        const F_noise_x = (Math.random() - 0.5) * amp * 0.5;
        const F_noise_y = (Math.random() - 0.5) * amp * 0.5;

        let F_touch_x = 0;
        let F_touch_y = 0;
        
        if (touchDecay > 0) {
          const dxM = p.x - mouseX;
          const dyM = p.y - mouseY;
          const distM = Math.sqrt(dxM * dxM + dyM * dyM);
          
          if (distM < 140 && distM > 1) {
            const f = (1 - distM / 140) * touchDecay * 2.5;
            F_touch_x = (-dyM / distM) * f * 0.5 + (dxM / distM) * f * -0.15;
            F_touch_y = (dxM / distM) * f * 0.5 + (dyM / distM) * f * -0.15;
          }
        }

        // UI Colliders Repulsion (Respect Zones)
        let F_ui_x = 0;
        let F_ui_y = 0;
        for (const col of colliders) {
          const dxCol = col.cx - p.x;
          const dyCol = col.cy - p.y;
          const distCol = Math.max(0, Math.abs(dxCol) - col.w/2, Math.abs(dyCol) - col.h/2);
          if (distCol < 60 && distCol > 0) {
            const force = (60 - distCol) / 60;
            const nX = dxCol / distCol;
            const nY = dyCol / distCol;
            // Laminar flow / Curl away
            F_ui_x -= nX * force * 3;
            F_ui_y -= nY * force * 3;
            F_ui_x += nY * force * 1.5;
            F_ui_y -= nX * force * 1.5;
          }
        }

        const friction = 0.955;
        p.vx = (p.vx + F_spring_x + F_drift_x + F_noise_x + F_touch_x + F_ui_x) * friction;
        p.vy = (p.vy + F_spring_y + F_drift_y + F_noise_y + F_touch_y + F_ui_y) * friction;

        p.x += p.vx;
        p.y += p.vy;

        // Boundary Wrap
        if (p.x < -40) p.x = width + 40;
        if (p.x > width + 40) p.x = -40;
        if (p.y < -40) p.y = height + 40;
        if (p.y > height + 40) p.y = -40;
      }

      // Draw connections using Spatial Hash
      const connSubset = width > 520 ? 900 : 500;
      const actualSubset = showHUD ? 800 : connSubset;
      
      const grid = new SpatialHashGrid([width, height], [32, 32]);
      for (let i = 0; i < actualSubset; i++) {
        grid.insert(i, particles[i]);
      }

      ctx.lineWidth = 0.22;

      for (let i = 0; i < actualSubset; i++) {
        const p1 = particles[i];
        if (bandAmps[p1.band] < 0.3 && !showHUD) continue;
        
        const nearby = grid.getNearby(p1);
        for (const j of nearby) {
          if (j <= i) continue;
          
          const p2 = particles[j];
          if (p1.band === p2.band || showHUD) {
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const dSq = dx * dx + dy * dy;
            if (dSq < 32 * 32) {
              const d = Math.sqrt(dSq);
              const alpha = showHUD ? (1 - d/32) * 0.5 : (1 - d / 32) * bandAmps[p1.band] * 0.3;
              ctx.strokeStyle = showHUD ? 'rgba(255,255,255,0.4)' : hexToRgbaStr(BANDS[p1.band].color, alpha);
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }
      }

      // Draw particles
      for (let i = 0; i < N; i++) {
        const p = particles[i];
        const amp = bandAmps[p.band];
        
        if (!showHUD) {
          const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          const glow = 0.4 + amp * 0.6;
          
          ctx.fillStyle = BANDS[p.band].color;
          
          // Base draw
          ctx.globalAlpha = glow * (0.5 + speed * 0.07);
          const sz = p.size * (0.8 + amp * 1.2);
          
          ctx.beginPath();
          ctx.arc(p.x, p.y, sz, 0, Math.PI * 2);
          ctx.fill();

          // High amp glow
          if (amp > 0.5) {
            ctx.globalAlpha = glow * 0.1;
            ctx.beginPath();
            ctx.arc(p.x, p.y, sz * 3.5, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          // HUD render - precise points
          ctx.fillStyle = BANDS[p.band].color;
          ctx.globalAlpha = 1.0;
          ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
        }
      }
      
      ctx.globalAlpha = 1.0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('mouseleave', handlePointerLeave);
      window.removeEventListener('touchend', handlePointerLeave);
    };
  }, [isPlaying, activeMode, config, showHUD]); 

  return (
    <>
      <canvas 
        ref={canvasRef} 
        className="fixed inset-0 pointer-events-none z-[1]"
      />
      <button 
        className="fixed top-4 right-4 z-[100] px-3 py-1 bg-black/60 border border-white/20 text-white/50 text-[10px] uppercase font-mono tracking-widest hover:text-white/90 hover:bg-white/10"
        onClick={() => setShowHUD(!showHUD)}
      >
        HUD {showHUD ? 'ON' : 'OFF'}
      </button>
    </>
  );
}
