import { complex, complexAdd, complexMul, complexScale } from '../math/complex.js';
import { normalizeVector, vectorMagnitude } from '../math/rotations.js';

export function evolveSpinorInField(
  components,
  field,
  deltaTime,
  gyromagneticRatio = 1
) {
  const fieldMagnitude = vectorMagnitude(field);
  if (fieldMagnitude === 0 || deltaTime === 0) {
    return [
      complex(components[0].re, components[0].im),
      complex(components[1].re, components[1].im),
    ];
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
      complexMul(complexAdd(diagonal, zTerm), components[0]),
      complexMul(offDiagonal, components[1])
    ),
    complexAdd(
      complexMul(lowerOffDiagonal, components[0]),
      complexMul(complexAdd(diagonal, complexScale(zTerm, -1)), components[1])
    ),
  ];
}
