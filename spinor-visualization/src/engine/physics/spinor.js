import {
  complex,
  spinorComponentMagnitude,
} from '../math/complex.js';
import { spinorComponentPhaseDegrees } from '../math/rotations.js';

export class Spinor {
  constructor(alpha = complex(1, 0), beta = complex(0, 0)) {
    this.setComponents([alpha, beta]);
  }

  get components() {
    return [this.alpha, this.beta];
  }

  get alphaMagnitude() {
    return spinorComponentMagnitude(this.alpha);
  }

  get betaMagnitude() {
    return spinorComponentMagnitude(this.beta);
  }

  get alphaPhaseDegrees() {
    return spinorComponentPhaseDegrees(this.alpha);
  }

  get betaPhaseDegrees() {
    return spinorComponentPhaseDegrees(this.beta);
  }

  setComponents(components) {
    if (!Array.isArray(components) || components.length !== 2) {
      throw new TypeError('a spinor requires exactly two complex components');
    }
    this.alpha = complex(components[0].re, components[0].im);
    this.beta = complex(components[1].re, components[1].im);
    return this;
  }

  clone() {
    return new Spinor(this.alpha, this.beta);
  }
}

export function spinorFromComponents(alpha, beta) {
  return new Spinor(alpha, beta);
}
