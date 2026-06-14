import * as THREE from 'three';
import { PHYSICS_CONSTANTS, SCALE } from './constants';

export function calculateMass(diameter: number): number {
  const radius = diameter / 2;
  const volume = (4 / 3) * Math.PI * Math.pow(radius, 3);
  return PHYSICS_CONSTANTS.ASTEROID_DENSITY * volume;
}

export function calculateKineticEnergy(mass: number, velocity: number): number {
  return 0.5 * mass * velocity * velocity;
}

export function calculateTNTEquivalent(energy: number): number {
  return energy / PHYSICS_CONSTANTS.TNT_PER_TON;
}

export function calculateCraterDiameter(energy: number, asteroidDiameter: number): number {
  const energyInMegatons = energy / 4.184e15;
  return 1000 * Math.pow(energyInMegatons, 0.33) * (1 + asteroidDiameter / 100);
}

export function calculateGravity(
  asteroidPos: THREE.Vector3,
  earthPos: THREE.Vector3,
  asteroidMass: number
): THREE.Vector3 {
  const direction = earthPos.clone().sub(asteroidPos);
  const distance = direction.length();
  const distanceMeters = distance / SCALE.WORLD_SCALE;
  
  const forceMagnitude =
    (PHYSICS_CONSTANTS.GRAVITY_CONSTANT * PHYSICS_CONSTANTS.EARTH_MASS * asteroidMass) /
    (distanceMeters * distanceMeters);
  
  const acceleration = forceMagnitude / asteroidMass;
  const accelerationScaled = acceleration * SCALE.WORLD_SCALE;
  
  return direction.normalize().multiplyScalar(accelerationScaled);
}

export function calculateAirDensity(altitude: number): number {
  let altitudeMeters = altitude / SCALE.WORLD_SCALE;
  if (altitudeMeters < 0) altitudeMeters = 0;
  return (
    PHYSICS_CONSTANTS.SEA_LEVEL_AIR_DENSITY *
    Math.exp(-altitudeMeters / PHYSICS_CONSTANTS.SCALE_HEIGHT)
  );
}

export function calculateDrag(
  velocity: THREE.Vector3,
  airDensity: number,
  asteroidDiameter: number,
  asteroidMass: number
): THREE.Vector3 {
  const speed = velocity.length();
  if (speed === 0) return new THREE.Vector3(0, 0, 0);
  
  const radius = asteroidDiameter / 2;
  const crossSectionalArea = Math.PI * radius * radius;
  
  const dragMagnitude =
    0.5 *
    airDensity *
    speed *
    speed *
    PHYSICS_CONSTANTS.DRAG_COEFFICIENT *
    crossSectionalArea;
  
  const acceleration = dragMagnitude / asteroidMass;
  const accelerationScaled = acceleration * SCALE.WORLD_SCALE;
  
  return velocity.clone().normalize().multiplyScalar(-accelerationScaled);
}

export function calculateBurnIntensity(
  velocity: THREE.Vector3,
  airDensity: number
): number {
  const speed = velocity.length() / SCALE.WORLD_SCALE;
  
  if (speed < PHYSICS_CONSTANTS.BURN_VELOCITY_THRESHOLD) return 0;
  
  const intensity = Math.min(1, (speed / 30000) * Math.pow(airDensity / 0.5, 0.3));
  return intensity;
}

export function getAltitude(position: THREE.Vector3, earthPos: THREE.Vector3): number {
  const distance = position.distanceTo(earthPos);
  return distance - SCALE.EARTH_RADIUS;
}

export function isInAtmosphere(altitude: number): boolean {
  return altitude < SCALE.ATMOSPHERE_HEIGHT && altitude > 0;
}

export function checkCollision(
  asteroidPos: THREE.Vector3,
  earthPos: THREE.Vector3
): boolean {
  const distance = asteroidPos.distanceTo(earthPos);
  return distance <= SCALE.EARTH_RADIUS;
}

export function calculateVelocityVector(
  angleDegrees: number,
  speed: number,
  asteroidPos: THREE.Vector3,
  earthPos: THREE.Vector3
): THREE.Vector3 {
  const toEarth = earthPos.clone().sub(asteroidPos).normalize();
  
  const up = new THREE.Vector3(0, 1, 0);
  const right = new THREE.Vector3().crossVectors(toEarth, up).normalize();
  if (right.lengthSq() < 0.001) {
    right.set(1, 0, 0);
  }
  right.normalize();
  
  const horizontal = new THREE.Vector3().crossVectors(right, toEarth).normalize();
  
  if (horizontal.y > 0) {
    horizontal.negate();
  }
  
  const angleRad = (angleDegrees * Math.PI) / 180;
  const speedMetersPerSecond = speed * 1000;
  const speedScaled = speedMetersPerSecond * SCALE.WORLD_SCALE;
  
  const velocity = new THREE.Vector3()
    .addScaledVector(toEarth, Math.sin(angleRad))
    .addScaledVector(horizontal, Math.cos(angleRad))
    .normalize()
    .multiplyScalar(speedScaled);
  
  return velocity;
}

export function formatNumber(num: number): string {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + '万亿';
  if (num >= 1e8) return (num / 1e8).toFixed(2) + '亿';
  if (num >= 1e4) return (num / 1e4).toFixed(2) + '万';
  return num.toFixed(2);
}

export function formatEnergy(energy: number): string {
  if (energy >= 1e18) return (energy / 1e18).toFixed(2) + ' EJ';
  if (energy >= 1e15) return (energy / 1e15).toFixed(2) + ' PJ';
  if (energy >= 1e12) return (energy / 1e12).toFixed(2) + ' TJ';
  if (energy >= 1e9) return (energy / 1e9).toFixed(2) + ' GJ';
  return energy.toFixed(2) + ' MJ';
}

export function formatTNT(tons: number): string {
  if (tons >= 1e9) return (tons / 1e9).toFixed(2) + ' 吉吨';
  if (tons >= 1e6) return (tons / 1e6).toFixed(2) + ' 兆吨';
  if (tons >= 1e3) return (tons / 1e3).toFixed(2) + ' 千吨';
  return tons.toFixed(2) + ' 吨';
}
