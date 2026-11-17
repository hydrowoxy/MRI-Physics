// Spin-half amplitude construction, validation and explicit normalization.

import { complex } from '../math/complex.js';
export function normalizeSpinor(spinor) {
  if (!Array.isArray(spinor) || spinor.length !== 2) {
    throw new TypeError('a spinor requires exactly two complex components');
  }
  if (!spinor.every((component) => (
    component
    && Number.isFinite(component.re)
    && Number.isFinite(component.im)
  ))) {
    throw new TypeError('spinor components must contain finite real and imaginary parts');
  }

  const norm = Math.hypot(
    spinor[0].re,
    spinor[0].im,
    spinor[1].re,
    spinor[1].im
  );
  if (norm === 0) {
    throw new RangeError('the zero spinor cannot be normalized');
  }

  return spinor.map((component) => complex(
    component.re / norm,
    component.im / norm
  ));
}

export function assertNormalizedSpinor(components) {
  normalizeSpinor(components); // validates shape, finiteness and nonzero norm
  const norm = Math.hypot(...components.flatMap(c => [c.re, c.im]));
  if (Math.abs(norm - 1) > 1e-10) throw new RangeError('state must have unit norm; normalize explicitly');
  return components;
}
export function spinorFromPolarComponents(m0, phase0, m1, phase1) {
  return [
    { re: m0 * Math.cos(phase0), im: m0 * Math.sin(phase0) },
    { re: m1 * Math.cos(phase1), im: m1 * Math.sin(phase1) },
  ];
}
