// Probabilities and dimensionless Bloch expectations derived from normalized amplitudes.

import { assertNormalizedSpinor } from './state.js';
function probability(component) {
  return component.re * component.re + component.im * component.im;
}

export function getSpinExpectationVector(components) {
  assertNormalizedSpinor(components);
  const alpha = components[0];
  const beta = components[1];
  const alphaProbability = probability(alpha);
  const betaProbability = probability(beta);
  const relative = {
    re: alpha.re * beta.re + alpha.im * beta.im,
    im: alpha.re * beta.im - alpha.im * beta.re,
  };

  return {
    x: 2 * relative.re,
    y: 2 * relative.im,
    z: alphaProbability - betaProbability,
  };
}

export function measurementProbabilities(components) {
  assertNormalizedSpinor(components);
  const alpha = components[0];
  const beta = components[1];
  return { alpha: probability(alpha), beta: probability(beta) };
}
