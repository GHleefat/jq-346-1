import { useMemo } from 'react';
import * as THREE from 'three';
import { useSimulationStore } from '../../store/useSimulationStore';
import { SCALE } from '../../utils/constants';
import {
  calculateGravity,
  calculateAirDensity,
  calculateDrag,
  getAltitude,
  isInAtmosphere,
  checkCollision,
} from '../../utils/physics';

export function Trajectory() {
  const { asteroid, status, showTrajectory } = useSimulationStore();

  const trajectoryPoints = useMemo(() => {
    if (!showTrajectory || status === 'flying' || status === 'impact' || status === 'finished') {
      return [];
    }

    const points: THREE.Vector3[] = [];
    const EARTH_POSITION = new THREE.Vector3(0, 0, 0);
    const timeScale = 200;
    const dt = 0.016;
    const scaledDt = dt * timeScale;
    const maxSteps = 500;

    let position = asteroid.position.clone();
    let velocity = asteroid.velocityVector.clone();

    points.push(position.clone());

    for (let i = 0; i < maxSteps; i++) {
      const altitude = getAltitude(position, EARTH_POSITION);
      const inAtmosphere = isInAtmosphere(altitude);

      const gravity = calculateGravity(position, EARTH_POSITION, asteroid.mass);
      let acceleration = gravity.clone();

      if (inAtmosphere) {
        const airDensity = calculateAirDensity(altitude);
        const drag = calculateDrag(
          velocity,
          airDensity,
          asteroid.size,
          asteroid.mass
        );
        acceleration.add(drag);
      }

      velocity = velocity.clone().add(acceleration.multiplyScalar(scaledDt));
      position = position.clone().add(velocity.clone().multiplyScalar(scaledDt));

      if (i % 5 === 0) {
        points.push(position.clone());
      }

      if (checkCollision(position, EARTH_POSITION) || position.length() > 50) {
        points.push(position.clone().normalize().multiplyScalar(Math.min(position.length(), SCALE.EARTH_RADIUS + 0.1)));
        break;
      }
    }

    return points;
  }, [asteroid.position, asteroid.velocityVector, asteroid.mass, asteroid.size, status, showTrajectory]);

  if (trajectoryPoints.length < 2) {
    return null;
  }

  const positions = new Float32Array(trajectoryPoints.length * 3);
  trajectoryPoints.forEach((point, i) => {
    positions[i * 3] = point.x;
    positions[i * 3 + 1] = point.y;
    positions[i * 3 + 2] = point.z;
  });

  return (
    <group>
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={trajectoryPoints.length}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <lineDashedMaterial
          color="#00ff88"
          transparent
          opacity={0.5}
          dashSize={0.2}
          gapSize={0.1}
        />
      </line>
      {trajectoryPoints.map((point, i) => {
        if (i % 3 !== 0) return null;
        return (
          <mesh key={i} position={point}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshBasicMaterial color="#00ff88" transparent opacity={0.6} />
          </mesh>
        );
      })}
    </group>
  );
}
