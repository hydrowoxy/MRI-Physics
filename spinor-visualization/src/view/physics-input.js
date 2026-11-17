// Presentation conversions between phase/field controls and physics values.

import { normalizeDegrees, radiansToDegrees, degreesToRadians } from '../engine/math/angles.js';
import { sphericalToCartesian } from '../engine/math/coordinates.js';
export const spinorComponentPhaseDegrees = c => normalizeDegrees(radiansToDegrees(Math.atan2(c.im, c.re)));
export const fieldVectorFromAngles = (m, theta, phi) => sphericalToCartesian(m, degreesToRadians(theta), degreesToRadians(phi));
