import { complexAdd, complexMul, complexScale } from '../math/complex.js';
import { degreesToRadians } from '../math/rotations.js';
import { getSpinExpectationVector } from './measurement.js';

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
  return [
    changeOfBasisF(spinor[0], spinor[1], thetaDeg, phiDeg),
    changeOfBasisG(spinor[0], spinor[1], thetaDeg, phiDeg),
  ];
}

export function returnFromBasis(spinor, thetaDeg, phiDeg) {
  return changeOfBasis(spinor, -thetaDeg, phiDeg);
}

export function basisDirection(thetaDeg, phiDeg) {
  return getSpinExpectationVector(
    returnFromBasis([{ re: 1, im: 0 }, { re: 0, im: 0 }], thetaDeg, phiDeg)
  );
}
