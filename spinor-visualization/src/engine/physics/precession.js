// Single-spin magnetic evolution through the Zeeman Hamiltonian and propagator.

import { DEFAULT_SPECIES } from './species.js';
import { applyOperator, propagator } from './operators/index.js';
import { zeemanHamiltonian } from './operators/magnetic.js';
export function evolveSpinorInField(components, field, deltaTime, gyromagneticRatio = DEFAULT_SPECIES.gyromagneticRatio) {
  return applyOperator(propagator(zeemanHamiltonian(field, gyromagneticRatio), deltaTime), components);
}
