import { complex, complexAdd, complexMul, complexScale } from '../math/complex.js';
import { normalizeVector, vectorMagnitude } from '../math/rotations.js';

export function precessSpinor(spinor, field, deltaTime, gyromagneticRatio = 1) {
  const fieldMagnitude = vectorMagnitude(field);
  if (fieldMagnitude === 0 || deltaTime === 0) {
    return [complex(spinor[0].re, spinor[0].im), complex(spinor[1].re, spinor[1].im)];
  }

  const axis = normalizeVector(field);
  const halfAngle = gyromagneticRatio * fieldMagnitude * deltaTime / 2;
  const cosine = Math.cos(halfAngle);
  const sine = Math.sin(halfAngle);
  const diagonal = complex(cosine, 0);
  const offDiagonal = complex(
    axis.y * sine,
    -axis.x * sine
  );
  const lowerOffDiagonal = complex(
    axis.y * sine,
    -axis.x * sine
  );
  const zTerm = complexScale(complex(0, 1), -axis.z * sine);

  return [
    complexAdd(
      complexMul(complexAdd(diagonal, zTerm), spinor[0]),
      complexMul(offDiagonal, spinor[1])
    ),
    complexAdd(
      complexMul(lowerOffDiagonal, spinor[0]),
      complexMul(complexAdd(diagonal, complexScale(zTerm, -1)), spinor[1])
    ),
  ];
}
