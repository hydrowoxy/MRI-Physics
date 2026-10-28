import { vector } from '../math/rotations.js';

export class Population {
  constructor(spinors = [], coordinates = []) {
    if (spinors.length !== coordinates.length && coordinates.length !== 0) {
      throw new RangeError('each spinor must have a matching coordinate');
    }
    this.spinors = spinors;
    this.coordinates = coordinates.length
      ? coordinates
      : spinors.map(() => vector());
  }

  add(spinor, coordinate = vector()) {
    this.spinors.push(spinor);
    this.coordinates.push(coordinate);
    return this;
  }
}
