/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useFrame } from '@react-three/fiber';
import { useControls } from 'leva';
import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { fragmentShader, vertexShader } from '../shaders/particleShaders';

const PARTICLE_COUNT = 50000;

export default function Particles({ audioPulse = 0, imageData = null }: { audioPulse?: number, imageData?: any }) {
  const meshRef = useRef<THREE.Points>(null);
  const geoRef = useRef<THREE.BufferGeometry>(null);

  const { dispersion, size, mouseRadius, flowSpeed, flowAmplitude, contrast } = useControls({
    dispersion: { value: 10, min: 2, max: 30, step: 0.1 },
    size: { value: 0.05, min: 0.01, max: 0.2, step: 0.01 },
    mouseRadius: { value: 5, min: 1, max: 15, step: 0.1 },
    flowSpeed: { value: 0.2, min: 0, max: 1, step: 0.01 },
    flowAmplitude: { value: 0.5, min: 0, max: 2, step: 0.1 },
    contrast: { value: 1.5, min: 1, max: 5, step: 0.1 },
  });

  const { positions, offsets, sizes, colors } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const off = new Float32Array(PARTICLE_COUNT * 3);
    const s = new Float32Array(PARTICLE_COUNT);
    const c = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = Math.pow(Math.random(), 0.5) * 8;

      pos[i * 3] = r * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(theta) * 0.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 2;

      off[i * 3] = Math.random() * 100;
      off[i * 3 + 1] = Math.random() * 100;
      off[i * 3 + 2] = Math.random() * 100;

      s[i] = 0.5 + Math.random() * 2.0;

      // Default warm yellow color
      c[i * 3] = 1.0;
      c[i * 3 + 1] = 0.8;
      c[i * 3 + 2] = 0.3;
    }
    return { positions: pos, offsets: off, sizes: s, colors: c };
  }, []);

  useEffect(() => {
    if (imageData && geoRef.current) {
      const posAttr = geoRef.current.getAttribute('position') as THREE.BufferAttribute;
      const colorAttr = geoRef.current.getAttribute('color') as THREE.BufferAttribute;
      
      if (posAttr && colorAttr) {
        posAttr.array.set(imageData.positions);
        colorAttr.array.set(imageData.colors);
        
        posAttr.needsUpdate = true;
        colorAttr.needsUpdate = true;
      }
    }
  }, [imageData]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uDispersion: { value: dispersion },
    uSize: { value: size },
    uMouse: { value: new THREE.Vector3(0, 0, 0) },
    uMouseRadius: { value: mouseRadius },
    uAudioPulse: { value: 0 },
    uClickPulse: { value: 0 },
    uClickPos: { value: new THREE.Vector3(0, 0, 0) },
    uFlowSpeed: { value: flowSpeed },
    uFlowAmplitude: { value: flowAmplitude },
    uContrast: { value: contrast },
  }), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    uniforms.uTime.value = state.clock.getElapsedTime();
    uniforms.uDispersion.value = dispersion;
    uniforms.uSize.value = size;
    uniforms.uMouseRadius.value = mouseRadius;
    uniforms.uAudioPulse.value = audioPulse;
    uniforms.uFlowSpeed.value = flowSpeed;
    uniforms.uFlowAmplitude.value = flowAmplitude;
    uniforms.uContrast.value = contrast;

    // Decay click pulse
    if (uniforms.uClickPulse.value > 0) {
      uniforms.uClickPulse.value += 0.02; // Expand the wave
      if (uniforms.uClickPulse.value > 2.0) {
        uniforms.uClickPulse.value = 0; // Reset
      }
    }

    // Convert screen coordinates to world coordinates for mouse interaction
    const vector = new THREE.Vector3(state.mouse.x, state.mouse.y, 0.5);
    vector.unproject(state.camera);
    const dir = vector.sub(state.camera.position).normalize();
    const distance = -state.camera.position.z / dir.z;
    const pos = state.camera.position.clone().add(dir.multiplyScalar(distance));
    
    uniforms.uMouse.value.lerp(pos, 0.1);
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    uniforms.uClickPos.value.copy(e.point);
    uniforms.uClickPulse.value = 0.01; // Start the pulse
  };

  return (
    <group>
      <points ref={meshRef} onPointerDown={handleClick}>
        <bufferGeometry ref={geoRef}>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-aOffset"
            count={offsets.length / 3}
            array={offsets}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-aSize"
            count={sizes.length}
            array={sizes}
            itemSize={1}
          />
          <bufferAttribute
            attach="attributes-color"
            count={colors.length / 3}
            array={colors}
            itemSize={3}
          />
        </bufferGeometry>
        <shaderMaterial
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
        />
      </points>
      
      {/* Visual focus point as seen in reference */}
      <mesh position={[-5, -2, 0]}>
        <ringGeometry args={[0.2, 0.25, 32]} />
        <meshBasicMaterial color="white" transparent opacity={0.2} />
      </mesh>
      <mesh position={[-5, -2, 0]}>
        <circleGeometry args={[0.08, 32]} />
        <meshBasicMaterial color="white" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}
