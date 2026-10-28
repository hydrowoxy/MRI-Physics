const DEGREE = Math.PI / 180;

export function degreesToRadians(degrees) {
  return degrees * DEGREE;
}

export function radiansToDegrees(radians) {
  return radians / DEGREE;
}

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

export function cartesianToSpherical(a) {
  const radius = vectorMagnitude(a);
  if (radius === 0) return { radius: 0, theta: 0, phi: 0 };
  return {
    radius,
    theta: Math.acos(Math.min(1, Math.max(-1, a.z / radius))),
    phi: Math.atan2(a.y, a.x),
  };
}

export function sphericalToCartesian(radius, theta, phi) {
  const sinTheta = Math.sin(theta);
  return vector(
    radius * sinTheta * Math.cos(phi),
    radius * sinTheta * Math.sin(phi),
    radius * Math.cos(theta)
  );
}

export function fieldVectorFromAngles(magnitude, thetaDeg, phiDeg) {
  return sphericalToCartesian(
    magnitude,
    degreesToRadians(thetaDeg),
    degreesToRadians(phiDeg)
  );
}
