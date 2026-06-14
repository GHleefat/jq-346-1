import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulationStore } from '../../store/useSimulationStore';
import { SCALE, SIMULATION_CONSTANTS, COLORS } from '../../utils/constants';

export function Shockwave() {
  const { impact, status } = useSimulationStore();
  const [startTime, setStartTime] = useState<number | null>(null);
  const ringsRef = useRef<THREE.Mesh[]>([]);

  useEffect(() => {
    if (status === 'impact' && impact.occurred && startTime === null) {
      setStartTime(performance.now());
    }
    if (status === 'idle' || status === 'dragging') {
      setStartTime(null);
      ringsRef.current = [];
    }
  }, [status, impact.occurred, startTime]);

  const craterDiameterScaled = useMemo(() => {
    return Math.min(impact.craterDiameter / 1000, 3);
  }, [impact.craterDiameter]);

  useFrame(() => {
    if (startTime === null || !impact.occurred) return;

    const elapsed = (performance.now() - startTime) / 1000;
    const maxRadius = craterDiameterScaled * 3;

    ringsRef.current.forEach((ring, index) => {
      const ringDelay = index * 0.15;
      const ringElapsed = Math.max(0, elapsed - ringDelay);
      const ringDuration = 2;

      if (ringElapsed < ringDuration && ring) {
        const progress = ringElapsed / ringDuration;
        const radius = maxRadius * progress;
        const scale = 1 + progress * 0.5;
        const opacity = Math.max(0, 1 - progress);

        ring.scale.set(radius, radius, radius);
        const material = ring.material as THREE.MeshBasicMaterial;
        material.opacity = opacity * 0.6;

        if (index === 0) {
          ring.scale.setScalar(radius * 1.2);
        }
      } else if (ring) {
        const material = ring.material as THREE.MeshBasicMaterial;
        material.opacity = 0;
      }
    });
  });

  if (!impact.occurred || (status !== 'impact' && status !== 'finished')) {
    return null;
  }

  const normal = impact.position.clone().normalize();
  const up = new THREE.Vector3(0, 1, 0);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(up, normal);

  const rings = [0, 1, 2].map((index) => (
    <mesh
      key={index}
      ref={(el) => {
        if (el) ringsRef.current[index] = el;
      }}
      position={impact.position.clone().add(normal.clone().multiplyScalar(0.02 + index * 0.01))}
      quaternion={quaternion}
    >
      <ringGeometry args={[0.95, 1, 64]} />
      <meshBasicMaterial
        color={index === 0 ? COLORS.BURN_YELLOW : index === 1 ? COLORS.BURN_ORANGE : COLORS.SHOCKWAVE}
        transparent
        opacity={0}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  ));

  return <>{rings}</>;
}
