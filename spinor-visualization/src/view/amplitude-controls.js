// Amplitude slider editing policy that preserves a normalized magnitude pair.

export function complementaryMagnitude(magnitude) {
  if (!Number.isFinite(magnitude) || magnitude < 0 || magnitude > 1) {
    throw new RangeError('magnitude must be finite and between 0 and 1');
  }
  return Math.sqrt(1 - magnitude * magnitude);
}

export function normalizedAmplitudePair(m0, m1, changed = null) {
  if (![m0, m1].every(Number.isFinite) || m0 < 0 || m1 < 0) {
    throw new RangeError('amplitudes must be finite and non-negative');
  }
  if (changed === 'm0') return [m0, complementaryMagnitude(m0)];
  if (changed === 'm1') return [complementaryMagnitude(m1), m1];

  const norm = Math.hypot(m0, m1);
  if (norm === 0) {
    throw new RangeError('at least one amplitude must be non-zero');
  }
  return [m0 / norm, m1 / norm];
}
