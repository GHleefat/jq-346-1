import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { Stars } from "./Stars";
import { Earth } from "./Earth";
import { Asteroid } from "./Asteroid";
import { Trail } from "./Trail";
import { Trajectory } from "./Trajectory";
import { BurnParticles, ImpactParticles } from "./Particles";
import { Shockwave } from "./Shockwave";
import { useSimulationStore } from "../../store/useSimulationStore";

function SimulationUpdater() {
  const { updateSimulation } = useSimulationStore();

  useFrame((_, delta) => {
    updateSimulation(delta);
  });

  return null;
}

function ImpactParticleUpdater() {
  const { impactParticles } = useSimulationStore();

  useFrame((_, delta) => {
    if (impactParticles.length === 0) return;

    const updatedParticles = impactParticles
      .map((p) => ({
        ...p,
        position: p.position
          .clone()
          .add(p.velocity.clone().multiplyScalar(delta)),
        velocity: p.velocity.clone().multiplyScalar(0.98),
        life: p.life - delta,
      }))
      .filter((p) => p.life > 0);

    if (updatedParticles.length !== impactParticles.length) {
      useSimulationStore.setState({ impactParticles: updatedParticles });
    }
  });

  return null;
}

function SceneContent() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} castShadow />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color="#4da6ff" />

      <Stars />
      <Earth />
      <Asteroid />
      <Trajectory />
      <Trail />
      <BurnParticles />
      <ImpactParticles />
      <Shockwave />

      <SimulationUpdater />
      <ImpactParticleUpdater />

      <OrbitControls
        enablePan={false}
        minDistance={5}
        maxDistance={30}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  );
}

export function Scene3D() {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 2, 12], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => {
          gl.setClearColor("#0a0a1a", 1);
        }}
      >
        <fog attach="fog" args={["#0a0a1a", 20, 50]} />
        <SceneContent />
      </Canvas>
    </div>
  );
}
