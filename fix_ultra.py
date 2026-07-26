import re

code = """
"use client";

import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { audioEngine, AudioConfig } from '@/lib/audio';

interface AudioVisualizerProps {
  isPlaying: boolean;
  frequency: number;
  config: AudioConfig;
}

const vertexShader = `
  uniform float uTime;
  uniform float uAudioAverage;
  uniform float uAudioHigh;
  uniform float uFrequency;
  
  uniform float uFractal;
  uniform float uCrossFreq;
  uniform float uPhaseVel;
  uniform float uHarmonic;
  uniform float uZeroEntropy;
  uniform float uTotalParticles;
  
  attribute float aIndex;
  attribute float aSize;
  
  varying float vAudioInt;
  varying vec3 vPos;
  varying float vCoupling;
  varying float vColorPhase;

  const float PI = 3.141592653589793;
  const float PHI = 1.618033988749895;

  // Rotation matrix around Y
  mat3 rotateY(float angle) {
      float s = sin(angle);
      float c = cos(angle);
      return mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c);
  }
  
  // Rotation matrix around Z
  mat3 rotateZ(float angle) {
      float s = sin(angle);
      float c = cos(angle);
      return mat3(c, -s, 0.0, s, c, 0.0, 0.0, 0.0, 1.0);
  }

  // Rotation matrix around X
  mat3 rotateX(float angle) {
      float s = sin(angle);
      float c = cos(angle);
      return mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c);
  }

  // Generic 3D noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec3 v) {
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 = v - i + dot(i, C.xxx) ;
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute( permute( permute(
               i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
             + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
  }

  void main() {
    vAudioInt = uAudioAverage;
    float idx = aIndex;
    float normIndex = idx / uTotalParticles;
    
    // BASE GEOMETRY: Parametric Fibonacci Sphere
    float phi = acos(1.0 - 2.0 * normIndex);
    float theta = PI * 2.0 * PHI * idx;
    
    float r = 200.0;
    vec3 basePos = vec3(
       r * cos(theta) * sin(phi),
       r * sin(theta) * sin(phi),
       r * cos(phi)
    );
    
    // --- MODE 1: ZERO ENTROPY (Crystalline Lattice) ---
    // Instead of a sphere, form a perfect 3D grid
    float gridSize = ceil(pow(uTotalParticles, 1.0/3.0));
    float gx = mod(idx, gridSize);
    float gy = mod(floor(idx / gridSize), gridSize);
    float gz = floor(idx / (gridSize * gridSize));
    vec3 gridPos = (vec3(gx, gy, gz) - (gridSize/2.0)) * (400.0 / gridSize);
    
    vec3 pos = mix(basePos, gridPos, uZeroEntropy);
    
    // --- MODE 2: FRACTAL RESONANCE (Nested Phi Spirals / Microcolumns) ---
    if (uFractal > 0.5) {
       float layer = mod(idx, 5.0); // 5 nested layers
       float localIndex = floor(idx / 5.0);
       float layerScale = pow(PHI, layer - 2.0);
       
       float f_phi = acos(1.0 - 2.0 * (localIndex / (uTotalParticles/5.0)));
       float f_theta = PI * 2.0 * PHI * localIndex + (uTime * 0.2 * layerScale); // Layers rotate differently
       
       vec3 fractalPos = vec3(
          cos(f_theta) * sin(f_phi),
          sin(f_theta) * sin(f_phi),
          cos(f_phi)
       ) * (150.0 * layerScale);
       
       pos = mix(pos, fractalPos, uFractal);
    }
    
    // --- MODE 3: PHASE VELOCITY 4D (Clifford Torus Projection) ---
    if (uPhaseVel > 0.5) {
       // Map index to a 2D torus plane
       float u = mod(idx, 200.0) / 200.0 * PI * 2.0;
       float v = floor(idx / 200.0) / (uTotalParticles / 200.0) * PI * 2.0;
       
       // Add 4D rotation via Time
       float wTime = uTime * 0.5;
       u += wTime;
       v += wTime * PHI;
       
       // Clifford Torus mapped to 3D via stereographic projection
       float R = 150.0;
       float r4 = 1.0;
       
       // 4D coords
       float x4 = cos(u);
       float y4 = sin(u);
       float z4 = cos(v);
       float w4 = sin(v);
       
       // Stereographic projection to 3D
       float dist = 1.0 - w4; // Avoid division by zero
       if(dist < 0.01) dist = 0.01;
       
       vec3 torusPos = vec3(x4, y4, z4) * (R / dist);
       
       // Cranial Standing Wave Modulation
       float nodeDist = abs(sin(length(torusPos) * 0.02 - uTime));
       torusPos *= mix(1.0, nodeDist, 0.3 * uAudioAverage);
       
       pos = mix(pos, torusPos, uPhaseVel);
    }
    
    // --- MODE 4: HARMONIC VIOLATIONS (Strange Attractors / Intermodulation) ---
    if (uHarmonic > 0.5) {
       // Irrationally folded geometry
       float irrationalF = PI;
       float e = 2.7182818;
       
       vec3 foldPos = pos;
       foldPos.x += sin(pos.y * irrationalF * 0.01 + uTime) * 50.0;
       foldPos.y += cos(pos.z * e * 0.01 - uTime) * 50.0;
       foldPos.z += sin(pos.x * PHI * 0.01 + uTime * e) * 50.0;
       
       pos = mix(pos, foldPos, uHarmonic);
    }
    
    // --- MODE 5: CROSS-FREQUENCY COUPLING (Theta-Gamma Resonance) ---
    vCoupling = 0.0;
    if (uCrossFreq > 0.5) {
       // Theta wave (low freq, large spatial amplitude)
       float thetaWave = sin(length(pos) * 0.01 - uTime * 2.0);
       // Gamma wave (high freq, fine detail, envelope shaped by theta)
       float gammaWave = sin(length(pos) * 0.2 + uTime * 15.0);
       
       float coupledWave = thetaWave * gammaWave * uAudioHigh * 30.0;
       pos += normalize(pos) * coupledWave;
       
       vCoupling = (thetaWave * 0.5 + 0.5) * uAudioHigh;
    }
    
    // Apply environmental noise ONLY if Zero Entropy is off
    if (uZeroEntropy < 0.5) {
       float noise = snoise(pos * 0.005 + uTime * 0.2);
       pos += normalize(pos) * (noise * 30.0 * (1.0 - uZeroEntropy));
    }
    
    // Global Audio Reactivity (Pulse)
    pos += normalize(pos) * (uAudioAverage * 50.0);
    
    // Rotate scene globally
    pos = rotateY(uTime * 0.1) * rotateZ(uTime * 0.05) * pos;

    vPos = pos;
    vColorPhase = normIndex; // Pass structural location to color

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    
    // Dynamic Size
    float dynamicSize = aSize;
    if (uZeroEntropy > 0.5) {
       dynamicSize = aSize * 0.5; // Crystalline pinpoint clarity
    } else {
       dynamicSize = aSize * (1.0 + uAudioAverage * 5.0 + vCoupling * 5.0);
    }
    
    gl_PointSize = dynamicSize * (400.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform float uFrequency;
  uniform float uAudioAverage;
  
  uniform float uZeroEntropy;
  uniform float uHarmonic;
  uniform float uFractal;
  uniform float uCrossFreq;
  uniform float uPhaseVel;
  
  varying float vAudioInt;
  varying vec3 vPos;
  varying float vCoupling;
  varying float vColorPhase;
  
  const float PHI = 1.618033988749895;

  vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
  }

  void main() {
    // Generate soft glowing particle
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;
    
    // Core glow math
    float alpha = pow(1.0 - (dist * 2.0), 2.5); // Steep falloff for glowing edge
    float core = pow(1.0 - (dist * 2.0), 6.0);  // Hot bright core
    
    if (uZeroEntropy > 0.5) {
       // Sharp, quantum-perfect points
       alpha = 1.0 - smoothstep(0.4, 0.5, dist);
       core = 1.0 - smoothstep(0.1, 0.2, dist);
    }

    // Color generation based on structural index and audio
    float baseHue = mod(uFrequency / 360.0, 1.0);
    
    if (uFractal > 0.5) {
       baseHue = mod(vColorPhase * PHI * 5.0 - uTime * 0.1, 1.0);
    }
    
    if (uPhaseVel > 0.5) {
       // Iridescent gradient based on position in tensor field
       baseHue = mod(vPos.y * 0.005 + vPos.x * 0.005 + uTime * 0.2, 1.0);
    }
    
    if (uHarmonic > 0.5) {
       // Glitch coloring (sharp transitions)
       baseHue += floor(vPos.z * 0.05) * 0.1;
    }
    
    float sat = mix(0.7, 1.0, uAudioAverage);
    float val = mix(0.7, 1.0, uAudioAverage);
    
    if (uZeroEntropy > 0.5) {
       sat = 1.0;
       val = 1.0;
       baseHue = mix(baseHue, 0.55, 0.7); // Shift towards perfect cyan/blue
    }

    // Pulse brightness on Theta-Gamma peaks
    if (uCrossFreq > 0.5) {
       val += vCoupling * 2.0; 
       sat -= vCoupling * 0.5; // Turn white at peaks
    }
    
    vec3 color = hsv2rgb(vec3(baseHue, sat, val));
    
    // Mix hot core (pure white) with colored glow
    vec3 finalColor = mix(color, vec3(1.0), core + (uAudioAverage * 0.5));
    
    gl_FragColor = vec4(finalColor, alpha * (0.3 + uAudioAverage * 1.5 + vCoupling));
  }
`;

const Particles = ({ isPlaying, frequency, config }: AudioVisualizerProps) => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const dataArray = useMemo(() => new Uint8Array(2048 / 2), []);
  
  const numParticles = 65000; // Dense high-quality field
  
  const [indices, sizes] = useMemo(() => {
    const idx = new Float32Array(numParticles);
    const sz = new Float32Array(numParticles);
    
    for(let i = 0; i < numParticles; i++) {
      idx[i] = i;
      sz[i] = Math.random() * 3.0 + 1.5; // Base sizes
    }
    return [idx, sz];
  }, [numParticles]);

  useFrame((state) => {
    if (!materialRef.current) return;
    
    let avgAudio = 0;
    let highAudio = 0;
    
    if (isPlaying) {
      audioEngine.getAnalyserData(dataArray);
      let sumLow = 0;
      let sumHigh = 0;
      
      for (let i = 0; i < 15; i++) { 
         sumLow += dataArray[i];
      }
      for (let i = 100; i < 150; i++) {
         sumHigh += dataArray[i];
      }
      avgAudio = sumLow / (15 * 255);
      highAudio = sumHigh / (50 * 255);
    }
    
    const uniforms = materialRef.current.uniforms;
    uniforms.uTime.value = state.clock.elapsedTime;
    
    uniforms.uAudioAverage.value = THREE.MathUtils.lerp(uniforms.uAudioAverage.value, avgAudio, 0.15);
    uniforms.uAudioHigh.value = THREE.MathUtils.lerp(uniforms.uAudioHigh.value, highAudio, 0.2);
    
    uniforms.uFrequency.value = frequency;
    
    // Smoothly interpolate configuration flags for morphing geometry!
    const targetFractal = config.fractalResonance ? 1.0 : 0.0;
    const targetCross = config.crossFrequencyCoupling ? 1.0 : 0.0;
    const targetPhase = config.phaseVelocity4D ? 1.0 : 0.0;
    const targetHarmonic = config.harmonicViolations ? 1.0 : 0.0;
    const targetZero = config.zeroEntropySpectrum ? 1.0 : 0.0;
    
    uniforms.uFractal.value = THREE.MathUtils.lerp(uniforms.uFractal.value, targetFractal, 0.05);
    uniforms.uCrossFreq.value = THREE.MathUtils.lerp(uniforms.uCrossFreq.value, targetCross, 0.05);
    uniforms.uPhaseVel.value = THREE.MathUtils.lerp(uniforms.uPhaseVel.value, targetPhase, 0.05);
    uniforms.uHarmonic.value = THREE.MathUtils.lerp(uniforms.uHarmonic.value, targetHarmonic, 0.05);
    uniforms.uZeroEntropy.value = THREE.MathUtils.lerp(uniforms.uZeroEntropy.value, targetZero, 0.05);
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={numParticles} array={new Float32Array(numParticles * 3)} itemSize={3} />
        <bufferAttribute attach="attributes-aIndex" count={numParticles} array={indices} itemSize={1} />
        <bufferAttribute attach="attributes-aSize" count={numParticles} array={sizes} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uAudioAverage: { value: 0 },
          uAudioHigh: { value: 0 },
          uFrequency: { value: frequency },
          uTotalParticles: { value: numParticles },
          uFractal: { value: 0 },
          uCrossFreq: { value: 0 },
          uPhaseVel: { value: 0 },
          uHarmonic: { value: 0 },
          uZeroEntropy: { value: 0 }
        }}
        transparent={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

export default function AudioVisualizer({ isPlaying, frequency, config }: AudioVisualizerProps) {
  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1] bg-black">
      <Canvas camera={{ position: [0, 0, 700], fov: 60 }} gl={{ antialias: true, alpha: false }}>
        <Particles isPlaying={isPlaying} frequency={frequency} config={config} />
      </Canvas>
    </div>
  );
}
"""

with open("components/AudioVisualizer.tsx", "w") as f:
    f.write(code)

