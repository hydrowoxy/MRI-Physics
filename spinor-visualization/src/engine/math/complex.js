/**
 * Creates a complex number.
 * @param {*} re
 * @param {*} im
 * @returns {Object} A complex number represented as an object with `re` and `im` properties.
 */
export function complex(re, im = 0) {
  return { re, im };
}

/**
 * Adds two complex numbers.
 * @param {*} a
 * @param {*} b
 * @returns {Object} The sum of the two complex numbers.
 */
export function complexAdd(a, b) {
  return { re: a.re + b.re, im: a.im + b.im };
}

/**
 * Multiplies two complex numbers.
 * @param {*} a
 * @param {*} b
 * @returns {Object} The product of the two complex numbers.
 */
export function complexMul(a, b) {
  return {
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re,
  };
}

/**
 * Scales a complex number by a real number.
 * @param {*} a
 * @param {*} scale
 * @returns {Object} The scaled complex number.
 */
export function complexScale(a, scale) {
  return { re: a.re * scale, im: a.im * scale };
}

/**
 * Calculates the magnitude of a complex number.
 * @param {*} a
 * @returns {number} The magnitude of the complex number.
 */
export function complexMagnitude(a) {
  return Math.hypot(a.re, a.im);
}

/**
 * Calculates the phase of a complex number in radians.
 * @param {*} a
 * @returns {number} The phase of the complex number in radians.
 */
export function complexPhaseRadians(a) {
  return Math.atan2(a.im, a.re);
}

/**
 * Calculates the complementary magnitude of a given magnitude.
 * @param {*} magnitude
 * @returns {number} The complementary magnitude.
 */
export function complementaryMagnitude(magnitude) {
  if (!Number.isFinite(magnitude) || magnitude < 0 || magnitude > 1) {
    throw new RangeError('magnitude must be finite and between 0 and 1');
  }
  return Math.sqrt(1 - magnitude * magnitude);
}

/**
 * Returns a normalized pair of amplitudes, ensuring that the sum of their squares is 1.
 * @param {*} m0
 * @param {*} m1
 * @param {*} changed
 * @returns {Array} An array containing the normalized amplitudes.
 */
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

/**
 * Calculates the magnitude of a spinor component.
 * @param {*} component
 * @returns {number} The magnitude of the spinor component.
 */
export function spinorComponentMagnitude(component) {
  return complexMagnitude(component);
}

/**
 * Normalizes a spinor.
 * @param {*} spinor
 * @returns {Array} A normalized spinor represented as an array of complex numbers.
 */
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
