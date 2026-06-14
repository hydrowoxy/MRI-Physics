export function degreesToRadians(degrees) {
  return degrees * Math.PI / 180;
}

export function normalizeDegrees(degrees) {
  return ((degrees % 360) + 360) % 360;
}
