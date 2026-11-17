// Real three-dimensional vector arithmetic using { x, y, z } values.

export function vector(x = 0, y = 0, z = 0) {
  return { x, y, z };
}

export function addVectors(a, b) {
  return vector(a.x + b.x, a.y + b.y, a.z + b.z);
}

export function scaleVector(a, scale) {
  return vector(a.x * scale, a.y * scale, a.z * scale);
}

export function vectorMagnitude(a) {
  return Math.hypot(a.x, a.y, a.z);
}

export function normalizeVector(a) {
  const magnitude = vectorMagnitude(a);
  return magnitude === 0 ? vector() : scaleVector(a, 1 / magnitude);
}
