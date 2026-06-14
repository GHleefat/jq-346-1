import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Points } from '@react-three/drei';

export function Stars() {
  const starsRef = useRef<THREE.Points>(null);
  const galaxyRef = useRef<THREE.Points>(null);

  const { positions, colors, sizes } = useMemo(() => {
    const count = 5000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 50 + Math.random() * 100;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
      
      const brightness = 0.5 + Math.random() * 0.5;
      const colorTemp = 0.8 + Math.random() * 0.4;
      colors[i3] = brightness * colorTemp;
      colors[i3 + 1] = brightness * (colorTemp * 0.9 + 0.1);
      colors[i3 + 2] = brightness * (colorTemp * 0.8 + 0.2);
      
      sizes[i] = 0.05 + Math.random() * 0.15;
    }

    return { positions, colors, sizes };
  }, []);

  const galaxyData = useMemo(() => {
    const count = 2000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const arm = Math.floor(Math.random() * 4);
      const angle = (arm * Math.PI / 2) + Math.random() * 0.5;
      const distance = 30 + Math.random() * 40;
      const height = (Math.random() - 0.5) * 5;
      
      positions[i3] = Math.cos(angle) * distance;
      positions[i3 + 1] = height;
      positions[i3 + 2] = Math.sin(angle) * distance;
      
      const hue = 0.6 + Math.random() * 0.2;
      const color = new THREE.Color().setHSL(hue, 0.5, 0.7);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
      
      sizes[i] = 0.03 + Math.random() * 0.1;
    }

    return { positions, colors, sizes };
  }, []);

  useFrame((_, delta) => {
    if (starsRef.current) {
      starsRef.current.rotation.y += delta * 0.005;
    }
    if (galaxyRef.current) {
      galaxyRef.current.rotation.y += delta * 0.01;
    }
  });

  return (
    <>
      <Points
        ref={starsRef}
        positions={positions}
        colors={colors}
        sizes={sizes}
      >
        <pointsMaterial
          vertexColors
          transparent
          opacity={0.9}
          size={0.1}
          sizeAttenuation
        />
      </Points>
      
      <Points
        ref={galaxyRef}
        positions={galaxyData.positions}
        colors={galaxyData.colors}
        sizes={galaxyData.sizes}
      >
        <pointsMaterial
          vertexColors
          transparent
          opacity={0.6}
          size={0.08}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </>
  );
}
