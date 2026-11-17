// Pure snapshot-to-presentation adapter for amplitudes, basis clocks and derived vectors.

import { changeOfBasis, getSpinExpectationVector, cartesianToSpherical, radiansToDegrees } from '../engine/index.js';
export function snapshotModel({simulation,field}, bases, spinIndex=0) {
  const spin = simulation.spins[spinIndex];
  if (!spin) throw new RangeError('selected spin is absent from snapshot');
  const direction = cartesianToSpherical(field);
  return {
    timeUs:simulation.timeUs,
    components:spin.components.map(c=>({...c})),
    expectation:getSpinExpectationVector(spin.components),
    field:{magnitude:direction.radius,theta:radiansToDegrees(direction.theta),phi:radiansToDegrees(direction.phi)},
    bases:bases.map(({id,theta,phi,color})=>({id,theta,phi,color,components:changeOfBasis(spin.components,theta,phi)})),
  };
}
