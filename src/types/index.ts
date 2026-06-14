import * as THREE from 'three';

export type SimulationStatus = 'idle' | 'dragging' | 'flying' | 'impact' | 'finished';

export interface AsteroidParams {
  size: number;
  velocity: number;
  angle: number;
}

export interface AsteroidState extends AsteroidParams {
  position: THREE.Vector3;
  velocityVector: THREE.Vector3;
  isLaunched: boolean;
  isBurning: boolean;
  burnIntensity: number;
  mass: number;
}

export interface ImpactResult {
  occurred: boolean;
  energy: number;
  craterDiameter: number;
  tntEquivalent: number;
  position: THREE.Vector3;
}

export interface TrailPoint {
  position: THREE.Vector3;
  intensity: number;
  timestamp: number;
}

export interface ParticleData {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  color: THREE.Color;
  size: number;
  life: number;
  maxLife: number;
}

export interface SimulationState {
  asteroid: AsteroidState;
  status: SimulationStatus;
  time: number;
  impact: ImpactResult;
  trail: TrailPoint[];
  particles: ParticleData[];
  impactParticles: ParticleData[];
  showTrajectory: boolean;
  setAsteroidParams: (params: Partial<AsteroidParams>) => void;
  setAsteroidPosition: (position: THREE.Vector3) => void;
  launch: () => void;
  reset: () => void;
  updateSimulation: (delta: number) => void;
  setStatus: (status: SimulationStatus) => void;
  setShowTrajectory: (show: boolean) => void;
}
