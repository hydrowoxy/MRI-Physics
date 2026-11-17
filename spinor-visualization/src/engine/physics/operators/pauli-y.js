// Immutable pauli-y operator in the computational basis.

import { complex as c } from '../../math/complex.js';
import { freezeMatrix2 } from '../../math/matrix2.js';

export const PAULI_Y = freezeMatrix2([[c(0), c(0,-1)], [c(0,1), c(0)]]);
