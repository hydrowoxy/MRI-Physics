import { complex } from '../math/complex.js';

function randomUnit(random) {
  const value = random();
  return Math.min(1 - Number.EPSILON, Math.max(Number.EPSILON, value));
}

export function thermalPolarization(temperature, fieldMagnitude, gyromagneticRatio = 1) {
  if (temperature <= 0) throw new RangeError('temperature must be greater than zero');
  return Math.tanh((gyromagneticRatio * fieldMagnitude) / (2 * temperature));
}

export function sampleThermalSpinor({
  temperature,
  fieldMagnitude,
  gyromagneticRatio = 1,
  random = Math.random,
} = {}) {
  const polarization = thermalPolarization(temperature, fieldMagnitude, gyromagneticRatio);
  const alphaProbability = (1 + polarization) / 2;
  const alphaMagnitude = Math.sqrt(randomUnit(random) < alphaProbability ? 1 : 0);
  const betaMagnitude = Math.sqrt(1 - alphaMagnitude * alphaMagnitude);
  const phase = 2 * Math.PI * randomUnit(random);
  return [
    complex(alphaMagnitude, 0),
    complex(betaMagnitude * Math.cos(phase), betaMagnitude * Math.sin(phase)),
  ];
}

export function createThermalEnsemble(count, options = {}) {
  if (!Number.isInteger(count) || count < 0) {
    throw new RangeError('count must be a non-negative integer');
  }
  return Array.from({ length: count }, () => sampleThermalSpinor(options));
}
