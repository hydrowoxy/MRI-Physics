// Immutable identity operator in the computational basis.

import { complex as c } from '../../math/complex.js';
import { freezeMatrix2 } from '../../math/matrix2.js';

export const IDENTITY = freezeMatrix2([[c(1), c(0)], [c(0), c(1)]]);


// why 