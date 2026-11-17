// Cartesian and spherical coordinate conversion; angles are radians.

import { vector, vectorMagnitude } from './vector3.js';
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
