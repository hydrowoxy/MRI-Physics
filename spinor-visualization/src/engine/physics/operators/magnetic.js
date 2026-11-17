// Magnetic coupling: H = -gamma hbar B dot sigma / 2; B in T, gamma in rad/s/T.

import { DEFAULT_SPECIES } from '../species.js';
import { spinHamiltonian } from './hamiltonian.js';
export function zeemanHamiltonian(field, gamma = DEFAULT_SPECIES.gyromagneticRatio) {
  if (!Number.isFinite(gamma)) throw new TypeError('finite gamma required');
  return spinHamiltonian({ x: -gamma * field.x, y: -gamma * field.y, z: -gamma * field.z });
}
export function magneticInteraction(fieldAt, gamma = DEFAULT_SPECIES.gyromagneticRatio) {
  return ({position, timeSeconds}) => zeemanHamiltonian(fieldAt(position, timeSeconds), gamma);
}
