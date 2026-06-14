import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Points } from '@react-three/drei';
import { useSimulationStore } from '../../store/useSimulationStore';

export function BurnParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const { particles } = useSimulationStore();

  const { positions, colors, sizes } = useMemo(() => {
    const count = particles.length;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    particles.forEach((particle, i) => {
      const i3 = i * 3;
      positions[i3] = particle.position.x;
      positions[i3 + 1] = particle.position.y;
      positions[i3 + 2] = particle.position.z;

      const alpha = particle.life / particle.maxLife;
      colors[i3] = particle.color.r * alpha;
      colors[i3 + 1] = particle.color.g * alpha;
      colors[i3 + 2] = particle.color.b * alpha;

      sizes[i] = particle.size * alpha;
    });

    return { positions, colors, sizes };
  }, [particles]);

  useFrame(() => {
    if (pointsRef.current && particles.length > 0) {
      const geometry = pointsRef.current.geometry;
      const positionAttr = geometry.attributes.position as THREE.BufferAttribute;
      const colorAttr = geometry.attributes.color as THREE.BufferAttribute;
      const sizeAttr = geometry.attributes.size as THREE.BufferAttribute;

      positionAttr.array = positions;
      positionAttr.needsUpdate = true;

      colorAttr.array = colors;
      colorAttr.needsUpdate = true;

      sizeAttr.array = sizes;
      sizeAttr.needsUpdate = true;

      geometry.setDrawRange(0, particles.length);
      geometry.computeBoundingSphere();
    }
  });

  if (particles.length === 0) return null;

  return (
    <Points
      ref={pointsRef}
      positions={positions}
      colors={colors}
      sizes={sizes}
    >
      <pointsMaterial
        vertexColors
        transparent
        opacity={0.8}
        size={0.1}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </Points>
  );
}

export function ImpactParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const { impactParticles } = useSimulationStore();

  const { positions, colors, sizes } = useMemo(() => {
    const count = impactParticles.length;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    impactParticles.forEach((particle, i) => {
      const i3 = i * 3;
      positions[i3] = particle.position.x;
      positions[i3 + 1] = particle.position.y;
      positions[i3 + 2] = particle.position.z;

      const alpha = particle.life / particle.maxLife;
      colors[i3] = particle.color.r * alpha;
      colors[i3 + 1] = particle.color.g * alpha;
      colors[i3 + 2] = particle.color.b * alpha;

      sizes[i] = particle.size * alpha;
    });

    return { positions, colors, sizes };
  }, [impactParticles]);

  useFrame(() => {
    if (pointsRef.current && impactParticles.length > 0) {
      const geometry = pointsRef.current.geometry;
      const positionAttr = geometry.attributes.position as THREE.BufferAttribute;
      const colorAttr = geometry.attributes.color as THREE.BufferAttribute;
      const sizeAttr = geometry.attributes.size as THREE.BufferAttribute;

      positionAttr.array = positions;
      positionAttr.needsUpdate = true;

      colorAttr.array = colors;
      colorAttr.needsUpdate = true;

      sizeAttr.array = sizes;
      sizeAttr.needsUpdate = true;

      geometry.setDrawRange(0, impactParticles.length);
      geometry.computeBoundingSphere();
    }
  });

  if (impactParticles.length === 0) return null;

  return (
    <Points
      ref={pointsRef}
      positions={positions}
      colors={colors}
      sizes={sizes}
    >
      <pointsMaterial
        vertexColors
        transparent
        opacity={0.9}
        size={0.2}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </Points>
  );
}
