import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { useFrame, ThreeEvent, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulationStore } from '../../store/useSimulationStore';
import { SCALE, COLORS, DEFAULT_PARAMS } from '../../utils/constants';

export function Asteroid() {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  const { asteroid, status, setAsteroidPosition, setStatus, showTrajectory } = useSimulationStore();
  const [isDragging, setIsDragging] = useState(false);

  const scale = useMemo(() => {
    const minScale = 0.1;
    const maxScale = 2;
    const normalizedSize = (asteroid.size - DEFAULT_PARAMS.MIN_SIZE) / (DEFAULT_PARAMS.MAX_SIZE - DEFAULT_PARAMS.MIN_SIZE);
    return minScale + normalizedSize * (maxScale - minScale);
  }, [asteroid.size]);

  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1, 1);
    const positions = geo.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);
      const noise = 0.8 + Math.random() * 0.4;
      positions.setXYZ(i, x * noise, y * noise, z * noise);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  const glowIntensity = useMemo(() => {
    if (!asteroid.isBurning) return 0;
    return Math.min(1, asteroid.burnIntensity * 2);
  }, [asteroid.isBurning, asteroid.burnIntensity]);

  const glowColor = useMemo(() => {
    if (glowIntensity < 0.3) return new THREE.Color(COLORS.BURN_ORANGE);
    if (glowIntensity < 0.7) return new THREE.Color(COLORS.BURN_YELLOW);
    return new THREE.Color('#ffffff');
  }, [glowIntensity]);

  const velocityIndicatorEnd = useMemo(() => {
    if (status === 'flying' || status === 'impact' || status === 'finished') return null;
    const velocityDir = asteroid.velocityVector.clone().normalize();
    const length = 2;
    return asteroid.position.clone().add(velocityDir.multiplyScalar(length));
  }, [asteroid.position, asteroid.velocityVector, status]);

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (status !== 'idle' && status !== 'dragging') return;
    e.stopPropagation();
    setIsDragging(true);
    setStatus('dragging');
  };

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isDragging) return;
    
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    
    const sphereMesh = new THREE.Mesh(
      new THREE.SphereGeometry(SCALE.EARTH_RADIUS + 3, 32, 32),
      new THREE.MeshBasicMaterial()
    );
    const intersects = raycaster.intersectObject(sphereMesh);
    
    if (intersects.length > 0) {
      setAsteroidPosition(intersects[0].point);
    }
  }, [isDragging, camera, setAsteroidPosition]);

  const handlePointerUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      if (status === 'dragging') {
        setStatus('idle');
      }
    }
  }, [isDragging, status, setStatus]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointercancel', handlePointerUp);
      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
        window.removeEventListener('pointercancel', handlePointerUp);
      };
    }
  }, [isDragging, handlePointerMove, handlePointerUp]);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.y += delta * 0.7;
    }
  });

  if (status === 'impact' || status === 'finished') {
    return null;
  }

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (status === 'idle' && !isDragging) {
      useSimulationStore.getState().launch();
    }
  };

  return (
    <group position={asteroid.position}>
      {showTrajectory && velocityIndicatorEnd && (
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([0, 0, 0, velocityIndicatorEnd.x - asteroid.position.x, velocityIndicatorEnd.y - asteroid.position.y, velocityIndicatorEnd.z - asteroid.position.z])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#00ff00" transparent opacity={0.6} />
        </line>
      )}

      {asteroid.isBurning && (
        <mesh ref={glowRef} scale={scale * (1.5 + glowIntensity * 0.5)}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial
            color={glowColor}
            transparent
            opacity={glowIntensity * 0.5}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}

      <mesh
        ref={meshRef}
        scale={scale}
        onPointerDown={handlePointerDown}
        onClick={handleClick}
      >
        <primitive object={geometry} attach="geometry" />
        <meshStandardMaterial
          color={asteroid.isBurning ? glowColor : COLORS.ASTEROID_GRAY}
          roughness={0.9}
          metalness={0.1}
          emissive={asteroid.isBurning ? glowColor : '#000000'}
          emissiveIntensity={glowIntensity * 0.8}
        />
      </mesh>

      {!isDragging && status === 'idle' && (
        <mesh position={[0, scale * 1.5, 0]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshBasicMaterial color="#00ff00" />
        </mesh>
      )}
    </group>
  );
}
