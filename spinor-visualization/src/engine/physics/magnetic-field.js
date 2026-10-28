import { addVectors, vector } from '../math/rotations.js';

function component(value, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

export function magneticFieldAt({
  b0 = vector(),
  b1 = vector(),
  gradients = vector(),
  coordinate = vector(),
  time = 0,
  waveform = null,
} = {}) {
  const rf = typeof waveform === 'function' ? waveform(time, coordinate) : b1;
  return addVectors(
    addVectors(b0, rf || vector()),
    vector(
      component(gradients.x) * component(coordinate.x),
      component(gradients.y) * component(coordinate.y),
      component(gradients.z) * component(coordinate.z)
    )
  );
}

export function createMagneticField(config = {}) {
  return (coordinate, time = 0) => magneticFieldAt({
    ...config,
    coordinate,
    time,
  });
}
