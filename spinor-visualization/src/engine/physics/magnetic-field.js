// Magnetic field evaluation with longitudinal MRI gradients: delta Bz = G dot r.

import { addVectors, vector } from '../math/vector3.js';
function checked(v) {
  if (!v || ![v.x,v.y,v.z].every(Number.isFinite)) throw new TypeError('finite field/position vector required');
  return v;
}
export function magneticFieldAt({b0=vector(), b1=vector(), gradients=vector(), coordinate=vector(), time=0, waveform=null}={}) {
  if (!Number.isFinite(time)) throw new TypeError('finite time required');
  checked(gradients); checked(coordinate);
  const rf = waveform === null ? b1 : waveform(time, {...coordinate});
  return addVectors(addVectors(checked(b0), checked(rf)), vector(0,0,
    gradients.x*coordinate.x + gradients.y*coordinate.y + gradients.z*coordinate.z));
}
export function createMagneticField(config={}) {
  const copy = {...config};
  for (const key of ['b0','b1','gradients']) if (copy[key]) copy[key] = {...checked(copy[key])};
  return (coordinate, time=0) => magneticFieldAt({...copy, coordinate, time});
}
