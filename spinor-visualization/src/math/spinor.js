import { degreesToRadians, normalizeDegrees } from './angles.js';
import { complex } from './complex.js';

export function complementaryMagnitude(magnitude) {
  return Math.sqrt(Math.max(0, 1 - magnitude * magnitude));
}

export function normalizedAmplitudePair(m0, m1, changed = null) {
  if (changed === 'm0') return [m0, complementaryMagnitude(m0)];
  if (changed === 'm1') return [complementaryMagnitude(m1), m1];

  const norm = Math.sqrt(m0 * m0 + m1 * m1) || 1;
  return [m0 / norm, m1 / norm];
}

export function spinorFromPolarComponents(m0, phase0, m1, phase1) {
  return [
    complex(m0 * Math.cos(phase0), m0 * Math.sin(phase0)),
    complex(m1 * Math.cos(phase1), m1 * Math.sin(phase1)),
  ];
}

export function normalizeSpinor(spinor) {
  const m0 = spinorComponentMagnitude(spinor[0]);
  const m1 = spinorComponentMagnitude(spinor[1]);
  const norm = Math.sqrt(m0 * m0 + m1 * m1) || 1;
  return [
    { re: spinor[0].re / norm, im: spinor[0].im / norm },
    { re: spinor[1].re / norm, im: spinor[1].im / norm },
  ];
}

export function spinorComponentMagnitude(component) {
  return Math.hypot(component.re, component.im);
}

export function spinorComponentPhaseRadians(component) {
  return Math.atan2(component.im, component.re);
}

export function spinorComponentPhaseDegrees(component) {
  return normalizeDegrees(spinorComponentPhaseRadians(component) / degreesToRadians(1));
}
