import os

code = """
"use client";

import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { audioEngine, AudioConfig } from '@/lib/audio';

interface AudioVisualizerProps {
  isPlaying: boolean;
  frequency: number;
  config: AudioConfig;
  activeMode: string;
}

const vertexShader = `
  uniform float uTime;
  uniform float uAudioAverage;
  uniform float uAudioHigh;
  uniform float uFrequency;
  
  uniform vec4 uModeWeights; // x: complex, y: deep, z: sleep, w: focus
  
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
  varying vec4 vWeights;

  const float PI = 3.141592653589793;
  const float PHI = 1.618033988749895;

  mat3 rotateY(float angle) {
      float s = sin(angle);
      float c = cos(angle);
      return mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c);
  }
  
  mat3 rotateZ(float angle) {
      float s = sin(angle);
      float c = cos(angle);
      return mat3(c, -s, 0.0, s, c, 0.0, 0.0, 0.0, 1.0);
  }

  mat3 rotateX(float angle) {
      float s = sin(angle);
      float c = cos(angle);
      return mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c);
  }

  // SDF Platonic Radii from directional vector
  float getTetraRadius(vec3 v) {
      return 1.0 / max( max(v.x+v.y+v.z, v.x-v.y-v.z), max(-v.x+v.y-v.z, -v.x-v.y+v.z) );
  }
  
  float getOctaRadius(vec3 v) {
      return 1.0 / (abs(v.x) + abs(v.y) + abs(v.z));
  }
  
  float getCubeRadius(vec3 v) {
      return 1.0 / max(abs(v.x), max(abs(v.y), abs(v.z)));
  }

  float getDodecaRadius(vec3 v) {
      float r1 = abs(v.x) + PHI * abs(v.y);
      float r2 = abs(v.y) + PHI * abs(v.z);
      float r3 = abs(v.z) + PHI * abs(v.x);
      return 1.0 / max(max(r1, r2), r3);
  }

  // 3D Noise
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
    
    vWeights = uModeWeights / max(uModeWeights.x + uModeWeights.y + uModeWeights.z + uModeWeights.w, 0.001);
    
    // FIBONACCI SPHERE BASE
    float phi_angle = acos(1.0 - 2.0 * normIndex);
    float theta_angle = PI * 2.0 * PHI * idx;
    
    vec3 dir = vec3(
       cos(theta_angle) * sin(phi_angle),
       sin(theta_angle) * sin(phi_angle),
       cos(phi_angle)
    );
    
    // CALCULATE PLATONIC RADII
    // Normalize weights
    float rDodeca = getDodecaRadius(dir) * 1.5;
    float rOcta = getOctaRadius(dir) * 1.0;
    float rTetra = getTetraRadius(dir) * 0.8;
    float rCube = getCubeRadius(dir) * 1.2;
    
    float finalRadius = vWeights.x * rDodeca + 
                        vWeights.y * rOcta + 
                        vWeights.z * rTetra + 
                        vWeights.w * rCube;
                        
    vec3 pos = dir * (finalRadius * 160.0);
    
    // ROTATION DYNAMICS BASED ON TOPOLOGY
    // Complex rotates weirdly, Sleep rotates slowly
    float t = uTime;
    
    vec3 rotPos = pos;
    // Base slow rotation
    rotPos = rotateY(t * 0.1) * rotateZ(t * 0.05) * rotPos;
    
    // Extra rotation for complex
    rotPos = mix(rotPos, rotateX(t * 0.2) * rotateY(t * 0.3) * pos, vWeights.x);
    // Almost no rotation for sleep
    rotPos = mix(rotPos, rotateY(t * 0.02) * pos, vWeights.z);
    
    pos = rotPos;
    
    // AUDIO REACTIVITY
    // Morph points based on audio high frequencies along their normal
    float audioPulse = uAudioAverage * 50.0;
    pos += normalize(pos) * audioPulse;
    
    // Cross-Frequency Theta-Gamma Coupling glow
    vCoupling = 0.0;
    if (uCrossFreq > 0.5) {
       float theta = sin(length(pos) * 0.01 - t * 2.0);
       float gamma = sin(length(pos) * 0.2 + t * 15.0);
       float coupled = theta * gamma * uAudioHigh * 40.0;
       pos += normalize(pos) * coupled;
       vCoupling = (theta * 0.5 + 0.5) * uAudioHigh;
    }
    
    // Noise perturbation (diminished by Zero Entropy)
    float noise = snoise(pos * 0.01 + t * 0.2);
    pos += normalize(pos) * (noise * 20.0 * (1.0 - uZeroEntropy));
    
    vPos = pos;
    vColorPhase = normIndex;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    
    // DYNAMIC SIZING
    float dynamicSize = aSize;
    if (uZeroEntropy > 0.5) {
       dynamicSize = aSize * 0.8; // Sharper in zero entropy
    } else {
       dynamicSize = aSize * (1.0 + uAudioAverage * 8.0 + vCoupling * 6.0);
    }
    
    gl_PointSize = dynamicSize * (600.0 / -mvPosition.z);
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
  varying vec4 vWeights;
  
  const float PHI = 1.618033988749895;

  vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
  }

  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;
    
    // GLOW & SACRED CLARITY
    float alpha = exp(-dist * 8.0); // Outer glow
    float core = exp(-dist * 25.0); // Hot bright center
    
    // If sleep mode, softer glow
    alpha = mix(alpha, exp(-dist * 5.0) * 0.6, vWeights.z);
    // If complex mode, intense core
    core = mix(core, exp(-dist * 30.0) * 1.5, vWeights.x);
    // If focus mode (octa/cube), crisp crystalline points
    if (vWeights.w > 0.5) {
        alpha = 1.0 - smoothstep(0.4, 0.5, dist);
        core = 1.0 - smoothstep(0.1, 0.2, dist);
    }

    // BASE COLORING
    float baseHue = mod(uFrequency / 360.0, 1.0);
    
    // SHIFT COLORS BASED ON TOPOLOGY/MODE
    // Complex: Iridescent shifting
    baseHue = mix(baseHue, mod(baseHue + vPos.y * 0.002 + uTime * 0.1, 1.0), vWeights.x);
    // Deep: Deep purples and blues (shift -0.2)
    baseHue = mix(baseHue, mod(baseHue - 0.2 + vPos.x * 0.001, 1.0), vWeights.y);
    // Sleep: Warm ambers/reds (shift to 0.05-0.1)
    baseHue = mix(baseHue, 0.05 + vAudioInt * 0.1, vWeights.z);
    // Focus: Ice blue / cyan (shift to 0.5-0.6)
    baseHue = mix(baseHue, 0.55 + vPos.z * 0.001, vWeights.w);
    
    float sat = mix(0.6, 1.0, uAudioAverage);
    float val = mix(0.7, 1.0, uAudioAverage);
    
    // Pulse brightness on Theta-Gamma peaks
    if (uCrossFreq > 0.5) {
       val += vCoupling * 2.5; 
       sat -= vCoupling * 0.8; 
    }
    
    vec3 color = hsv2rgb(vec3(baseHue, sat, val));
    vec3 finalColor = mix(color, vec3(1.0), core + (uAudioAverage * 0.8));
    
    gl_FragColor = vec4(finalColor, alpha * (0.4 + uAudioAverage * 1.5 + vCoupling));
  }
`;

const Particles = ({ isPlaying, frequency, config, activeMode }: AudioVisualizerProps) => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const dataArray = useMemo(() => new Uint8Array(2048 / 2), []);
  
  const numParticles = 80000; // Increased density for Platonic clarity
  
  const [indices, sizes] = useMemo(() => {
    const idx = new Float32Array(numParticles);
    const sz = new Float32Array(numParticles);
    
    for(let i = 0; i < numParticles; i++) {
      idx[i] = i;
      // Size distribution: many small, few large for starry effect
      sz[i] = Math.pow(Math.random(), 3.0) * 4.0 + 1.0; 
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
      for (let i = 0; i < 15; i++) sumLow += dataArray[i];
      for (let i = 100; i < 150; i++) sumHigh += dataArray[i];
      avgAudio = sumLow / (15 * 255);
      highAudio = sumHigh / (50 * 255);
    }
    
    const uniforms = materialRef.current.uniforms;
    uniforms.uTime.value = state.clock.elapsedTime;
    
    uniforms.uAudioAverage.value = THREE.MathUtils.lerp(uniforms.uAudioAverage.value, avgAudio, 0.15);
    uniforms.uAudioHigh.value = THREE.MathUtils.lerp(uniforms.uAudioHigh.value, highAudio, 0.2);
    uniforms.uFrequency.value = frequency;
    
    // SMOOTH MORPHING TARGETS
    const targetWeights = [
      activeMode === 'complex' ? 1 : 0,
      activeMode === 'deep' ? 1 : 0,
      activeMode === 'sleep' ? 1 : 0,
      activeMode === 'focus' ? 1 : 0
    ];
    
    uniforms.uModeWeights.value.x = THREE.MathUtils.lerp(uniforms.uModeWeights.value.x, targetWeights[0], 0.03);
    uniforms.uModeWeights.value.y = THREE.MathUtils.lerp(uniforms.uModeWeights.value.y, targetWeights[1], 0.03);
    uniforms.uModeWeights.value.z = THREE.MathUtils.lerp(uniforms.uModeWeights.value.z, targetWeights[2], 0.03);
    uniforms.uModeWeights.value.w = THREE.MathUtils.lerp(uniforms.uModeWeights.value.w, targetWeights[3], 0.03);
    
    uniforms.uFractal.value = THREE.MathUtils.lerp(uniforms.uFractal.value, config.fractalResonance ? 1 : 0, 0.05);
    uniforms.uCrossFreq.value = THREE.MathUtils.lerp(uniforms.uCrossFreq.value, config.crossFrequencyCoupling ? 1 : 0, 0.05);
    uniforms.uPhaseVel.value = THREE.MathUtils.lerp(uniforms.uPhaseVel.value, config.phaseVelocity4D ? 1 : 0, 0.05);
    uniforms.uHarmonic.value = THREE.MathUtils.lerp(uniforms.uHarmonic.value, config.harmonicViolations ? 1 : 0, 0.05);
    uniforms.uZeroEntropy.value = THREE.MathUtils.lerp(uniforms.uZeroEntropy.value, config.zeroEntropySpectrum ? 1 : 0, 0.05);
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
          uModeWeights: { value: new THREE.Vector4(1, 0, 0, 0) },
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

export default function AudioVisualizer({ isPlaying, frequency, config, activeMode }: AudioVisualizerProps) {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none bg-black">
      <Canvas camera={{ position: [0, 0, 450], fov: 60 }} gl={{ antialias: true, alpha: false }}>
        <Particles isPlaying={isPlaying} frequency={frequency} config={config} activeMode={activeMode} />
      </Canvas>
    </div>
  );
}
"""

with open("components/AudioVisualizer.tsx", "w") as f:
    f.write(code)
