import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { useSimulationStore } from '../../store/useSimulationStore';
import { COLORS } from '../../utils/constants';

export function Trail() {
  const { trail, time } = useSimulationStore();

  const { points, colors } = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const colors: [number, number, number][] = [];

    trail.forEach((point) => {
      points.push(point.position.clone());

      const intensity = point.intensity;
      const age = time - point.timestamp;
      const fade = Math.max(0, 1 - age / 3);

      const color = new THREE.Color();
      if (intensity < 0.3) {
        color.set(COLORS.BURN_ORANGE);
      } else if (intensity < 0.7) {
        color.set(COLORS.BURN_YELLOW);
      } else {
        color.set('#ffffff');
      }

      colors.push([
        color.r * intensity * fade,
        color.g * intensity * fade,
        color.b * intensity * fade,
      ]);
    });

    return { points, colors };
  }, [trail, time]);

  if (trail.length < 2) return null;

  return (
    <>
      <Line
        points={points}
        color={undefined}
        vertexColors={colors}
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        lineWidth={3}
      />
      <Line
        points={points}
        color={undefined}
        vertexColors={colors}
        transparent
        opacity={0.3}
        blending={THREE.AdditiveBlending}
        lineWidth={8}
      />
    </>
  );
}
