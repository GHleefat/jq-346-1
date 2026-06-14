import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SCALE, COLORS } from '../../utils/constants';
import { useSimulationStore } from '../../store/useSimulationStore';

export function Earth() {
  const meshRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const { impact } = useSimulationStore();

  const earthTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    const gradient = ctx.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, '#1e3a5f');
    gradient.addColorStop(0.3, '#1e90ff');
    gradient.addColorStop(0.5, '#4169e1');
    gradient.addColorStop(0.7, '#1e90ff');
    gradient.addColorStop(1, '#1e3a5f');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1024, 512);
    
    ctx.fillStyle = '#228b22';
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 512;
      const size = 30 + Math.random() * 100;
      ctx.beginPath();
      ctx.ellipse(x, y, size, size * 0.6, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.fillStyle = '#2e8b57';
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 512;
      const size = 20 + Math.random() * 60;
      ctx.beginPath();
      ctx.ellipse(x, y, size, size * 0.5, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, 1024, 80);
    ctx.fillRect(0, 432, 1024, 80);
    
    return new THREE.CanvasTexture(canvas);
  }, []);

  const cloudsTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0)';
    ctx.fillRect(0, 0, 1024, 512);
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 512;
      const size = 20 + Math.random() * 80;
      ctx.beginPath();
      ctx.ellipse(x, y, size, size * 0.4, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    
    return new THREE.CanvasTexture(canvas);
  }, []);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.05;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.08;
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[SCALE.EARTH_RADIUS, 64, 64]} />
        <meshStandardMaterial
          map={earthTexture}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[SCALE.EARTH_RADIUS + 0.02, 64, 64]} />
        <meshStandardMaterial
          map={cloudsTexture}
          transparent
          opacity={0.4}
          depthWrite={false}
        />
      </mesh>
      
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[SCALE.EARTH_RADIUS + SCALE.ATMOSPHERE_HEIGHT, 64, 64]} />
        <meshBasicMaterial
          color={COLORS.ATMOSPHERE_BLUE}
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </mesh>
      
      <mesh>
        <sphereGeometry args={[SCALE.EARTH_RADIUS + SCALE.ATMOSPHERE_HEIGHT + 0.05, 64, 64]} />
        <meshBasicMaterial
          color={COLORS.ATMOSPHERE_BLUE}
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </mesh>
      
      {impact.occurred && (
        <Crater position={impact.position} diameter={Math.min(impact.craterDiameter / 1000, 1)} />
      )}
    </group>
  );
}

function Crater({ position, diameter }: { position: THREE.Vector3; diameter: number }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useMemo(() => {
    if (groupRef.current) {
      groupRef.current.lookAt(position.clone().normalize().multiplyScalar(10));
    }
  }, [position]);

  return (
    <group ref={groupRef} position={position.clone().normalize().multiplyScalar(SCALE.EARTH_RADIUS + 0.01)}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[diameter, 64]} />
        <meshBasicMaterial
          color="#4a4a4a"
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.01]}>
        <ringGeometry args={[diameter * 0.8, diameter * 1.2, 64]} />
        <meshBasicMaterial
          color="#6a6a6a"
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
