import { spinExpectation } from '../engine/physics/measurement.js';

export function spinExpectationVectorFromDefaultBasis(state) {
  return spinExpectation(state);
}
