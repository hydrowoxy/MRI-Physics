import { changeOfBasis, inverseChangeOfBasis } from './change-of-basis.js';
import { applyMagneticOperator } from './magnetic-operator.js';
import { normalizeSpinor } from '../math/index.js';

/*
Time evolution in an arbitrary magnetic-field direction.

1. Express the spinor in the magnetic-field basis.
2. Apply the magnetic operator there.
3. Convert back to the simulator/default basis.

psi_next =
  changeOfBasis(
    magneticOperator(inverseChangeOfBasis(psi, theta, phi), dt, |B|),
    theta,
    phi
  )
*/

export function timeEvolveSpinorInField(spinor, dt, bMag, thetaDeg, phiDeg) {
  const fieldBasisSpinor = inverseChangeOfBasis(spinor, thetaDeg, phiDeg);
  const evolvedCoeffs = applyMagneticOperator(fieldBasisSpinor, dt, bMag);
  return normalizeSpinor(changeOfBasis(evolvedCoeffs, thetaDeg, phiDeg));
}
