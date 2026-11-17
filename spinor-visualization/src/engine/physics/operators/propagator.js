// Exact constant-H propagator; time-varying evolution is handled by simulation stepping.

import { complex as c } from '../../math/complex.js';
import { IDENTITY } from './identity.js';
import { spinHamiltonian } from './hamiltonian.js';

export function propagator(hamiltonian, seconds) {
  if (!Number.isFinite(seconds)) throw new TypeError('finite duration required');
  const {x,y,z} = spinHamiltonian(hamiltonian);
  const magnitude = Math.hypot(x,y,z);
  if (magnitude === 0) return IDENTITY;
  const angle = magnitude * seconds / 2;
  const a = Math.cos(angle), k = Math.sin(angle) / magnitude;
  return [[c(a,-z*k), c(-y*k,-x*k)], [c(y*k,-x*k), c(a,z*k)]];
}
