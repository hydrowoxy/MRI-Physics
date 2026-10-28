import {
  complex,
  complexMagnitude,
  complexPhaseRadians,
} from '../math/complex.js';
import { normalizeDegrees } from '../math/rotations.js';

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
  const norm = Math.hypot(
    complexMagnitude(spinor[0]),
    complexMagnitude(spinor[1])
  ) || 1;
  return spinor.map((component) => complex(component.re / norm, component.im / norm));
}

export function spinorComponentMagnitude(component) {
  return complexMagnitude(component);
}

export function spinorComponentPhaseDegrees(component) {
  return normalizeDegrees(complexPhaseRadians(component) * 180 / Math.PI);
}
