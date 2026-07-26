import re

new_visualizer_code = """
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
  
  attribute float aSize;
  attribute vec3 aBasePosition;
  attribute float aPhase;
  attribute float aPhiRatio;
  
  varying float vAudioInt;
  varying vec3 vPos;
  varying float vPhiRatio;
  varying float vCoupling;
  
  const float PHI = 1.618033988749895;

  // Generic 3D noise function
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
    vPos = aBasePosition;
    vPhiRatio = aPhiRatio;
    
    vec3 pos = position;

    // Organic movement base
    float noise1 = snoise(vec3(aBasePosition.x * 0.003, aBasePosition.y * 0.003, uTime * 0.15));
    float noise2 = snoise(vec3(aBasePosition.y * 0.003, aBasePosition.z * 0.003, uTime * 0.15 + 100.0));
    float noise3 = snoise(vec3(aBasePosition.z * 0.003, aBasePosition.x * 0.003, uTime * 0.15 + 200.0));

    // Frequency modulation
    float freqEffect = uFrequency * 0.0005;

    // Golden Ratio scaling for Fractal Resonance
    if (uFractal > 0.5) {
       float scale = pow(PHI, mod(aPhiRatio * 8.0 + uTime * 0.2, 4.0)) / 2.0;
       pos = normalize(pos) * (length(aBasePosition) * scale);
    }

    // Displacement influenced by audio bass + noise
    float noiseScale = (1.0 - uZeroEntropy); // Zero entropy = zero random noise
    float dispAmt = 15.0 + (uAudioAverage * 250.0);
    
    pos.x += noise1 * dispAmt * noiseScale;
    pos.y += noise2 * dispAmt * noiseScale;
    pos.z += noise3 * dispAmt * noiseScale;
    
    // Swirl based on audio
    float angle = uTime * (0.1 + freqEffect + uAudioAverage * 0.5) + aPhase;
    
    if (uZeroEntropy > 0.5) {
        // Rigid structure swirling
        angle = uTime * 0.1 + aPhase;
    }
    
    float s = sin(angle);
    float c = cos(angle);
    float xnew = pos.x * c - pos.z * s;
    float znew = pos.x * s + pos.z * c;
    pos.x = xnew;
    pos.z = znew;

    // Cross-Frequency Coupling: Theta carrying Gamma
    if (uCrossFreq > 0.5) {
       float thetaCarrier = sin(pos.y * 0.01 + uTime * 0.5) * 0.5 + 0.5;
       float gammaMod = sin(pos.x * 0.1 + uTime * 4.0) * uAudioHigh;
       float cfcEffect = thetaCarrier * gammaMod * 60.0;
       pos.z += cfcEffect;
       vCoupling = thetaCarrier;
    } else {
       vCoupling = 0.0;
    }
    
    // Phase Velocity 4D Tensor mapping
    if (uPhaseVel > 0.5) {
       float w = sin(uTime * 0.5 + aPhase);
       float s4 = sin(w);
       float c4 = cos(w);
       
       float nx = pos.x * c4 - pos.z * s4;
       float nz = pos.x * s4 + pos.z * c4;
       pos.x = nx;
       pos.z = nz;
       
       // Cranial standing wave nodes
       float nodeDist = abs(sin(length(pos) * 0.01));
       pos *= mix(1.0, nodeDist, 0.5 * uAudioAverage);
    }
    
    // Harmonic Violations / Glitch
    if (uHarmonic > 0.5) {
       float irrationalF = 3.14159265;
       float err = sin(pos.x * irrationalF) * cos(pos.y * 2.71828);
       pos.xyz += err * 15.0 * uAudioAverage;
    }
    
    // Zero Entropy strictness
    if (uZeroEntropy > 0.5) {
       vec3 targetSphere = normalize(pos) * (length(aBasePosition) + 100.0 * uAudioAverage);
       float order = smoothstep(0.0, 1.0, uAudioAverage + 0.5);
       pos = mix(pos, targetSphere, order * 0.9);
    }

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    
    float dynamicSize = aSize * (1.0 + uAudioAverage * 8.0);
    if (uZeroEntropy > 0.5) {
        dynamicSize = aSize * 0.6; // Crystalline points
    }
    
    gl_PointSize = dynamicSize * (350.0 / -mvPosition.z);
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
  
  varying float vAudioInt;
  varying vec3 vPos;
  varying float vPhiRatio;
  varying float vCoupling;
  
  const float PHI = 1.618033988749895;

  vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
  }

  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    
    float alpha = pow(1.0 - (dist * 2.0), 1.8);
    
    if (uZeroEntropy > 0.5) {
       alpha = 1.0 - smoothstep(0.4, 0.5, dist);
    }

    float baseHue = mod(uFrequency / 360.0, 1.0);
    float hueOffset = vPos.x * 0.0008 + vPos.y * 0.0008 + uTime * 0.05;
    
    float finalHue = mod(baseHue + hueOffset + (uAudioAverage * 0.8), 1.0);
    
    if (uFractal > 0.5) {
       finalHue = mod(vPhiRatio * PHI + (uAudioAverage * 0.5), 1.0);
    }
    
    if (uHarmonic > 0.5) {
       finalHue += sin(vPos.z * 0.1 + uTime) * 0.2;
    }
    
    float sat = mix(0.7, 1.0, uAudioAverage);
    float val = mix(0.8, 1.0, uAudioAverage);
    
    if (uZeroEntropy > 0.5) {
       sat = 1.0;
       val = 1.0;
       finalHue = mix(finalHue, 0.6, 0.6); // Bias to blue/cyan coherence
    }

    if (uCrossFreq > 0.5) {
       val += vCoupling * uAudioAverage * 3.0; // Glow pulse on theta peaks
       sat -= vCoupling * 0.3; // Whiter on peaks
    }
    
    vec3 color = hsv2rgb(vec3(finalHue, sat, val));
    
    vec3 finalColor = mix(color, vec3(1.0), uAudioAverage * (1.0 - dist * 4.0));
    
    gl_FragColor = vec4(finalColor, alpha * (0.2 + uAudioAverage * 0.8));
  }
`;

const Particles = ({ isPlaying, frequency, config }: AudioVisualizerProps) => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const dataArray = useMemo(() => new Uint8Array(2048 / 2), []);
  const { clock } = useThree();
  
  const numParticles = 25000;
  
  const [positions, sizes, bases, phases, phiRatios] = useMemo(() => {
    const pos = new Float32Array(numParticles * 3);
    const sz = new Float32Array(numParticles);
    const b = new Float32Array(numParticles * 3);
    const ph = new Float32Array(numParticles);
    const pr = new Float32Array(numParticles);
    
    const PHI = 1.618033988749895;
    
    for(let i = 0; i < numParticles; i++) {
      const radiusDistribution = Math.pow(Math.random(), 2);
      const r = 20 + radiusDistribution * 450;
      
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      
      pos[i*3] = x;
      pos[i*3+1] = y;
      pos[i*3+2] = z;
      
      b[i*3] = x;
      b[i*3+1] = y;
      b[i*3+2] = z;
      
      sz[i] = Math.random() * 2.5 + 0.5;
      ph[i] = Math.random() * Math.PI * 2;
      pr[i] = (i % 8) / PHI; 
    }
    return [pos, sz, b, ph, pr];
  }, [numParticles]);

  useFrame((state) => {
    if (!materialRef.current || !pointsRef.current) return;
    
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
    
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    
    materialRef.current.uniforms.uAudioAverage.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uAudioAverage.value,
      avgAudio,
      0.15
    );
    
    materialRef.current.uniforms.uAudioHigh.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uAudioHigh.value,
      highAudio,
      0.2
    );
    
    materialRef.current.uniforms.uFrequency.value = frequency;
    
    materialRef.current.uniforms.uFractal.value = config.fractalResonance ? 1.0 : 0.0;
    materialRef.current.uniforms.uCrossFreq.value = config.crossFrequencyCoupling ? 1.0 : 0.0;
    materialRef.current.uniforms.uPhaseVel.value = config.phaseVelocity4D ? 1.0 : 0.0;
    materialRef.current.uniforms.uHarmonic.value = config.harmonicViolations ? 1.0 : 0.0;
    materialRef.current.uniforms.uZeroEntropy.value = config.zeroEntropySpectrum ? 1.0 : 0.0;
    
    let rotY = state.clock.elapsedTime * 0.04;
    let rotZ = state.clock.elapsedTime * 0.015;
    
    if (config.zeroEntropySpectrum) {
      rotY = state.clock.elapsedTime * 0.02; // Slower coherent rotation
      rotZ = state.clock.elapsedTime * 0.005;
    }
    
    if (config.phaseVelocity4D) {
      rotY += Math.sin(state.clock.elapsedTime * 0.1) * 0.5;
    }
    
    pointsRef.current.rotation.y = THREE.MathUtils.lerp(pointsRef.current.rotation.y, rotY, 0.05);
    pointsRef.current.rotation.z = THREE.MathUtils.lerp(pointsRef.current.rotation.z, rotZ, 0.05);
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={numParticles} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aBasePosition" count={numParticles} array={bases} itemSize={3} />
        <bufferAttribute attach="attributes-aSize" count={numParticles} array={sizes} itemSize={1} />
        <bufferAttribute attach="attributes-aPhase" count={numParticles} array={phases} itemSize={1} />
        <bufferAttribute attach="attributes-aPhiRatio" count={numParticles} array={phiRatios} itemSize={1} />
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
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-[-1] opacity-90">
      <Canvas camera={{ position: [0, 0, 500], fov: 60 }} gl={{ antialias: false, alpha: true }}>
        <Particles isPlaying={isPlaying} frequency={frequency} config={config} />
      </Canvas>
    </div>
  );
}
"""

with open("components/AudioVisualizer.tsx", "w") as f:
    f.write(new_visualizer_code)

