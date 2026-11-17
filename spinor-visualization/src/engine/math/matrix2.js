// Row-major complex 2x2 matrix application; output is not normalized.

import { complexAdd, complexMul } from './complex.js';
export function applyMatrix2(matrix, state) {
  return matrix.map(row => complexAdd(complexMul(row[0], state[0]), complexMul(row[1], state[1])));
}

// Freeze entries and rows as well as the matrix container.
export function freezeMatrix2(rows) {
  return Object.freeze(rows.map(row => Object.freeze(row.map(Object.freeze))));
}
