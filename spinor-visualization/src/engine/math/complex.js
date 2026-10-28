export function complex(re, im = 0) {
  return { re, im };
}

export function complexAdd(a, b) {
  return { re: a.re + b.re, im: a.im + b.im };
}

export function complexMul(a, b) {
  return {
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re,
  };
}

export function complexScale(a, scale) {
  return { re: a.re * scale, im: a.im * scale };
}

export function complexMagnitude(a) {
  return Math.hypot(a.re, a.im);
}

export function complexPhaseRadians(a) {
  return Math.atan2(a.im, a.re);
}

export function complementaryMagnitude(magnitude) {
  return Math.sqrt(Math.max(0, 1 - magnitude * magnitude));
}

export function normalizedAmplitudePair(m0, m1, changed = null) {
  if (changed === 'm0') return [m0, complementaryMagnitude(m0)];
  if (changed === 'm1') return [complementaryMagnitude(m1), m1];

  const norm = Math.hypot(m0, m1) || 1;
  return [m0 / norm, m1 / norm];
}

export function spinorComponentMagnitude(component) {
  return complexMagnitude(component);
}

export function normalizeSpinor(spinor) {
  const norm = Math.hypot(
    spinorComponentMagnitude(spinor[0]),
    spinorComponentMagnitude(spinor[1])
  ) || 1;
  return spinor.map((component) => complex(
    component.re / norm,
    component.im / norm
  ));
}
