// Angle conversion and degree wrapping.

const DEGREE = Math.PI / 180;

export function degreesToRadians(degrees) {
  return degrees * DEGREE;
}

export function normalizeDegrees(degrees) {
  return ((degrees % 360) + 360) % 360;
}

export function radiansToDegrees(radians) {
  return radians / DEGREE;
}
