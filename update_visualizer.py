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

  void main() {
    vAudioInt = uAudioAverage;
    vPos = aBasePosition;
    vPhiRatio = aPhiRatio;
    
    vec3 pos = position;
    
    float thetaCarrier = sin(pos.y * 0.01 + uTime * 0.5) * 0.5 + 0.5;
    float gammaMod = sin(pos.x * 0.1 + uTime * 4.0) * uAudioHigh;
    
    float cfcEffect = 0.0;
    if (uCrossFreq > 0.5) {
       cfcEffect = thetaCarrier * gammaMod * 50.0;
       pos.z += cfcEffect;
       vCoupling = thetaCarrier;
    } else {
       vCoupling = 0.0;
    }
    
    if (uFractal > 0.5) {
       float scale = pow(PHI, mod(aPhiRatio + uTime * 0.1, 4.0));
       pos = normalize(pos) * (100.0 * scale);
    }
    
    if (uPhaseVel > 0.5) {
       float w = sin(uTime * 0.2 + aPhase);
       float s = sin(w);
       float c = cos(w);
       
       float nx = pos.x * c - pos.z * s;
       float nz = pos.x * s + pos.z * c;
       pos.x = nx;
       pos.z = nz;
       
       float nodeDist = abs(sin(pos.y * 0.05));
       pos.x *= mix(1.0, nodeDist, 0.5 * uAudioAverage);
       pos.z *= mix(1.0, nodeDist, 0.5 * uAudioAverage);
    }
    
    if (uHarmonic > 0.5) {
       float irrationalF = 3.14159265;
       float err = sin(pos.x * irrationalF) * cos(pos.y * 2.71828);
       pos.xyz += err * 10.0 * uAudioAverage;
    }
    
    if (uZeroEntropy > 0.5) {
       vec3 targetSphere = normalize(pos) * 300.0;
       float order = smoothstep(0.0, 1.0, uAudioAverage + 0.5);
       pos = mix(pos, targetSphere, order * 0.8);
    } else {
       float noise = sin(pos.x * 0.05 + uTime) * cos(pos.z * 0.05 - uTime);
       pos.y += noise * 20.0 * uAudioAverage;
    }

    pos += normalize(pos) * (uAudioAverage * 50.0);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    
    float dynamicSize = aSize;
    if (uZeroEntropy > 0.5) {
        dynamicSize = aSize * 0.5; 
    } else {
        dynamicSize = aSize * (1.0 + uAudioAverage * 5.0);
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
    
    if (uFractal > 0.5) {
       baseHue = mod(vPhiRatio * PHI, 1.0);
    }
    
    if (uHarmonic > 0.5) {
       baseHue += sin(vPos.z * 0.1 + uTime) * 0.1;
    }
    
    float sat = 0.8;
    float val = 0.9;
    
    if (uZeroEntropy > 0.5) {
       sat = 1.0;
       val = 1.0;
       baseHue = mix(baseHue, 0.6, 0.5); 
    }

    val += vCoupling * uAudioAverage * 2.0;
    
    vec3 color = hsv2rgb(vec3(baseHue, sat, val));
    vec3 finalColor = mix(color, vec3(1.0), (uAudioAverage * 0.5) * (1.0 - dist * 4.0));
    
    gl_FragColor = vec4(finalColor, alpha * (0.3 + uAudioAverage * 0.7));
  }
`;

const Particles = ({ isPlaying, frequency, config }: AudioVisualizerProps) => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const dataArray = useMemo(() => new Uint8Array(2048 / 2), []);
  const { clock } = useThree();
  
  const numParticles = 30000;
  
  const [positions, sizes, bases, phases, phiRatios] = useMemo(() => {
    const pos = new Float32Array(numParticles * 3);
    const sz = new Float32Array(numParticles);
    const b = new Float32Array(numParticles * 3);
    const ph = new Float32Array(numParticles);
    const pr = new Float32Array(numParticles);
    
    const PHI = 1.618033988749895;
    
    for(let i = 0; i < numParticles; i++) {
      const y = 1 - (i / (numParticles - 1)) * 2; 
      const radius = Math.sqrt(1 - y * y);
      const theta = PHI * Math.PI * 2 * i; 
      
      const baseX = Math.cos(theta) * radius;
      const baseZ = Math.sin(theta) * radius;
      
      const scale = 200.0 * (1.0 + Math.random() * 2.0);
      
      pos[i*3] = baseX * scale;
      pos[i*3+1] = y * scale;
      pos[i*3+2] = baseZ * scale;
      
      b[i*3] = pos[i*3];
      b[i*3+1] = pos[i*3+1];
      b[i*3+2] = pos[i*3+2];
      
      sz[i] = Math.random() * 3.0 + 1.0;
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
    
    let rotY = state.clock.elapsedTime * 0.05;
    let rotZ = state.clock.elapsedTime * 0.02;
    
    if (config.zeroEntropySpectrum) {
      rotY = 0; 
      rotZ = 0;
    }
    
    if (config.phaseVelocity4D) {
      rotY = Math.sin(state.clock.elapsedTime * 0.1) * Math.PI;
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

