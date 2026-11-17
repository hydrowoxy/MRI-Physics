// Encapsulated normalized two-component quantum state with detached accessors.

import { complex } from '../math/complex.js';
import { assertNormalizedSpinor } from './state.js';
import { applyOperator } from './operators/index.js';
export class Spinor {
  #components;
  constructor(alpha = complex(1), beta = complex(0)) { this.setComponents([alpha, beta]); }
  get components() { return this.#components.map(c => ({...c})); }
  get alpha() { return {...this.#components[0]}; }
  get beta() { return {...this.#components[1]}; }
  setComponents(components) {
    assertNormalizedSpinor(components);
    this.#components = components.map(c => ({...c}));
    return this;
  }
  // Commits only operators whose output is a valid normalized state.
  apply(operator) { return this.setComponents(applyOperator(operator, this.#components)); }
  clone() { return new Spinor(...this.components); }
}
export function spinorFromComponents(alpha, beta) { return new Spinor(alpha, beta); }
