import { degreesToRadians, complexAdd, complexMul, complexScale } from '../math/index.js';
import { spinExpectationVectorFromDefaultBasis } from './spin-expectation.js';

/*
Change of basis for a spinor [a, b].

f(a, b, theta, phi) =
  a cos(theta / 2) + b exp(-i phi) sin(theta / 2)

g(a, b, theta, phi) =
  -a exp(i phi) sin(theta / 2) + b cos(theta / 2)

changeOfBasis([a, b], theta, phi) = [f(a, b, theta, phi), g(a, b, theta, phi)]
returnFromBasis uses the same rule with -theta.
*/

function changeOfBasisF(a, b, thetaDeg, phiDeg) {
  const theta = degreesToRadians(thetaDeg);
  const phi = degreesToRadians(phiDeg);
  const cosHalf = Math.cos(theta / 2);
  const sinHalf = Math.sin(theta / 2);
  const expNegIPhi = { re: Math.cos(phi), im: -Math.sin(phi) };

  return complexAdd(
    complexScale(a, cosHalf),
    complexScale(complexMul(expNegIPhi, b), sinHalf)
  );
}

function changeOfBasisG(a, b, thetaDeg, phiDeg) {
  const theta = degreesToRadians(thetaDeg);
  const phi = degreesToRadians(phiDeg);
  const cosHalf = Math.cos(theta / 2);
  const sinHalf = Math.sin(theta / 2);
  const expIPhi = { re: Math.cos(phi), im: Math.sin(phi) };

  return complexAdd(
    complexScale(complexMul(expIPhi, a), -sinHalf),
    complexScale(b, cosHalf)
  );
}

export function changeOfBasis(spinor, thetaDeg, phiDeg) {
  // Applies the two coordinate equations f and g to [a, b].
  return [
    changeOfBasisF(spinor[0], spinor[1], thetaDeg, phiDeg),
    changeOfBasisG(spinor[0], spinor[1], thetaDeg, phiDeg),
  ];
}

export function returnFromBasis(spinor, thetaDeg, phiDeg) {
  return changeOfBasis(spinor, -thetaDeg, phiDeg);
}

export function basisDirection(thetaDeg, phiDeg) {
  // Display direction is derived from the spin-up state in that basis.
  return spinExpectationVectorFromDefaultBasis(
    returnFromBasis([{ re: 1, im: 0 }, { re: 0, im: 0 }], thetaDeg, phiDeg)
  );
}
