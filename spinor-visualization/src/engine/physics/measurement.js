// Born-rule outcome sampling without a projective state update.

import { getSpinExpectationVector } from './observables.js';
export function sampleSpinAlongAxis(components, axis, random = Math.random) {
  if (Math.abs(Math.hypot(axis.x, axis.y, axis.z) - 1) > 1e-10) throw new RangeError('unit axis required');
  const b = getSpinExpectationVector(components);
  const p = Math.max(0, Math.min(1, (1 + b.x*axis.x + b.y*axis.y + b.z*axis.z)/2));
  const draw = random();
  if (!Number.isFinite(draw) || draw < 0 || draw >= 1) throw new RangeError('random must return [0,1)');
  return draw < p ? 1 : -1;
}
