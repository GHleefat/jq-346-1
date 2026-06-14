import { create } from 'zustand';
import * as THREE from 'three';
import {
  calculateMass,
  calculateKineticEnergy,
  calculateTNTEquivalent,
  calculateCraterDiameter,
  calculateGravity,
  calculateAirDensity,
  calculateDrag,
  calculateBurnIntensity,
  getAltitude,
  isInAtmosphere,
  checkCollision,
  calculateVelocityVector,
} from '../utils/physics';
import { SCALE, DEFAULT_PARAMS, SIMULATION_CONSTANTS } from '../utils/constants';
import type {
  SimulationState,
  SimulationStatus,
  AsteroidParams,
  ParticleData,
} from '../types';

const EARTH_POSITION = new THREE.Vector3(0, 0, 0);

function getInitialAsteroidPosition(): THREE.Vector3 {
  return new THREE.Vector3(0.5, 0, 4);
}

function createInitialState(): Omit<SimulationState, 'setAsteroidParams' | 'setAsteroidPosition' | 'launch' | 'reset' | 'updateSimulation' | 'setStatus' | 'setShowTrajectory'> {
  const initialPosition = getInitialAsteroidPosition();
  const mass = calculateMass(DEFAULT_PARAMS.SIZE);
  const velocityVector = calculateVelocityVector(
    DEFAULT_PARAMS.ANGLE,
    DEFAULT_PARAMS.VELOCITY,
    initialPosition,
    EARTH_POSITION
  );

  return {
    asteroid: {
      size: DEFAULT_PARAMS.SIZE,
      velocity: DEFAULT_PARAMS.VELOCITY,
      angle: DEFAULT_PARAMS.ANGLE,
      position: initialPosition,
      velocityVector,
      mass,
      isLaunched: false,
      isBurning: false,
      burnIntensity: 0,
    },
    status: 'idle',
    time: 0,
    impact: {
      occurred: false,
      energy: 0,
      craterDiameter: 0,
      tntEquivalent: 0,
      position: new THREE.Vector3(),
    },
    trail: [],
    particles: [],
    impactParticles: [],
    showTrajectory: true,
  };
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
  ...createInitialState(),

  setAsteroidParams: (params: Partial<AsteroidParams>) => {
    const state = get();
    if (state.status === 'flying' || state.status === 'impact') return;

    set((state) => {
      const newParams = { ...state.asteroid, ...params };
      const newMass = calculateMass(newParams.size);
      const newVelocityVector = calculateVelocityVector(
        newParams.angle,
        newParams.velocity,
        newParams.position,
        EARTH_POSITION
      );

      return {
        asteroid: {
          ...newParams,
          mass: newMass,
          velocityVector: newVelocityVector,
        },
      };
    });
  },

  setAsteroidPosition: (position: THREE.Vector3) => {
    const state = get();
    if (state.status !== 'idle' && state.status !== 'dragging') return;

    set((state) => {
      const distance = position.length();
      const minDistance = SCALE.EARTH_RADIUS + 1;
      const maxDistance = 15;
      
      const direction = position.clone().normalize();
      const clampedDistance = Math.max(minDistance, Math.min(maxDistance, distance));
      const clampedPosition = direction.multiplyScalar(clampedDistance);

      const newVelocityVector = calculateVelocityVector(
        state.asteroid.angle,
        state.asteroid.velocity,
        clampedPosition,
        EARTH_POSITION
      );

      return {
        asteroid: {
          ...state.asteroid,
          position: clampedPosition,
          velocityVector: newVelocityVector,
        },
      };
    });
  },

  setStatus: (status: SimulationStatus) => {
    set({ status });
  },

  setShowTrajectory: (show: boolean) => {
    set({ showTrajectory: show });
  },

  launch: () => {
    const state = get();
    if (state.status !== 'idle' && state.status !== 'dragging') return;

    set({
      status: 'flying',
      asteroid: {
        ...state.asteroid,
        isLaunched: true,
      },
    });
  },

  reset: () => {
    set(createInitialState());
  },

  updateSimulation: (delta: number) => {
    const state = get();
    if (state.status !== 'flying') return;

    const { asteroid, time } = state;
    const dt = Math.min(delta, 0.1);
    const timeScale = 200;
    const scaledDt = dt * timeScale;

    const altitude = getAltitude(asteroid.position, EARTH_POSITION);
    const inAtmosphere = isInAtmosphere(altitude);

    const gravity = calculateGravity(asteroid.position, EARTH_POSITION, asteroid.mass);

    let acceleration = gravity.clone();
    let burnIntensity = 0;

    if (inAtmosphere) {
      const airDensity = calculateAirDensity(altitude);
      const drag = calculateDrag(
        asteroid.velocityVector,
        airDensity,
        asteroid.size,
        asteroid.mass
      );
      acceleration.add(drag);

      burnIntensity = calculateBurnIntensity(asteroid.velocityVector, airDensity);
    }

    const newVelocityVector = asteroid.velocityVector
      .clone()
      .add(acceleration.multiplyScalar(scaledDt));

    const newPosition = asteroid.position
      .clone()
      .add(newVelocityVector.clone().multiplyScalar(scaledDt));

    if (checkCollision(newPosition, EARTH_POSITION)) {
      const impactPosition = newPosition.clone().normalize().multiplyScalar(SCALE.EARTH_RADIUS);
      const impactSpeed = newVelocityVector.length() / SCALE.WORLD_SCALE;
      const energy = calculateKineticEnergy(asteroid.mass, impactSpeed);
      const tntEquivalent = calculateTNTEquivalent(energy);
      const craterDiameter = calculateCraterDiameter(energy, asteroid.size);

      const impactParticles: ParticleData[] = [];
      for (let i = 0; i < SIMULATION_CONSTANTS.IMPACT_PARTICLE_COUNT; i++) {
        const direction = new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          Math.random(),
          (Math.random() - 0.5) * 2
        ).normalize();
        
        const color = new THREE.Color().setHSL(0.05 + Math.random() * 0.1, 1, 0.5 + Math.random() * 0.5);
        const speed = 0.5 + Math.random() * 2;
        const life = 2 + Math.random() * 3;
        
        impactParticles.push({
          position: impactPosition.clone(),
          velocity: direction.multiplyScalar(speed),
          color,
          size: 0.1 + Math.random() * 0.3,
          life,
          maxLife: life,
        });
      }

      set({
        status: 'impact',
        asteroid: {
          ...asteroid,
          position: impactPosition,
          velocityVector: new THREE.Vector3(),
          isBurning: false,
          burnIntensity: 0,
        },
        impact: {
          occurred: true,
          energy,
          craterDiameter,
          tntEquivalent,
          position: impactPosition,
        },
        impactParticles,
      });

      setTimeout(() => {
        set({ status: 'finished' });
      }, 3000);

      return;
    }

    const newTrail = [...state.trail];
    if (burnIntensity > 0.1) {
      newTrail.push({
        position: newPosition.clone(),
        intensity: burnIntensity,
        timestamp: time,
      });
      if (newTrail.length > SIMULATION_CONSTANTS.MAX_TRAIL_LENGTH) {
        newTrail.shift();
      }
    }

    const newParticles = [...state.particles];
    if (burnIntensity > 0.1) {
      const particlesToAdd = Math.floor(burnIntensity * SIMULATION_CONSTANTS.BURN_PARTICLE_RATE * dt);
      for (let i = 0; i < particlesToAdd && newParticles.length < SIMULATION_CONSTANTS.MAX_PARTICLES; i++) {
        const offset = new THREE.Vector3(
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1
        );
        
        const color = new THREE.Color().setHSL(0.08 + Math.random() * 0.05, 1, 0.6);
        const life = 0.5 + Math.random() * 1;
        
        newParticles.push({
          position: newPosition.clone().add(offset),
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 0.2,
            (Math.random() - 0.5) * 0.2,
            (Math.random() - 0.5) * 0.2
          ),
          color,
          size: 0.05 + Math.random() * 0.1,
          life,
          maxLife: life,
        });
      }
    }

    const updatedParticles = newParticles
      .map((p) => ({
        ...p,
        position: p.position.clone().add(p.velocity.clone().multiplyScalar(dt)),
        life: p.life - dt,
        velocity: p.velocity.clone().multiplyScalar(0.98),
      }))
      .filter((p) => p.life > 0);

    set({
      time: time + dt,
      asteroid: {
        ...asteroid,
        position: newPosition,
        velocityVector: newVelocityVector,
        isBurning: burnIntensity > 0.1,
        burnIntensity,
      },
      trail: newTrail,
      particles: updatedParticles,
    });
  },
}));
