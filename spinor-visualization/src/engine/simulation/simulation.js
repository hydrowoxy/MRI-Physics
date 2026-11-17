// Headless fixed-step spin evolution with integer-microsecond simulation time.

import { Spinor } from '../physics/spinor.js';
import { propagator, spinHamiltonian } from '../physics/operators/index.js';
function integer(value, name, minimum=0) {
  if (!Number.isSafeInteger(value) || value < minimum) throw new RangeError(`${name} must be a safe integer >= ${minimum}`);
}
export class Simulation {
  #timeUs = 0;
  #spins;
  #initial;
  #interactions;
  #stepUs;
  constructor({spins=[{}], interactions=[], stepUs=1000}={}) {
    integer(stepUs, 'stepUs', 1);
    this.#stepUs = stepUs;
    this.#spins = spins.map(({state=new Spinor(), position={x:0,y:0,z:0}}) => {
      if (![position.x,position.y,position.z].every(Number.isFinite)) throw new TypeError('finite position required');
      return {state: state.clone(), position: {...position}};
    });
    this.#initial = this.#spins.map(s => s.state.components);
    this.setInteractions(interactions);
  }
  get timeUs() { return this.#timeUs; }
  get stepUs() { return this.#stepUs; }
  setInteractions(interactions) {
    if (!Array.isArray(interactions) || !interactions.every(i => typeof i === 'function')) throw new TypeError('interactions must be functions');
    this.#interactions = [...interactions];
  }
  setSpinState(index, components) {
    if (!this.#spins[index]) throw new RangeError('unknown spin');
    this.#spins[index].state.setComponents(components);
  }
  step(count=1) {
    integer(count, 'count');
    integer(this.#timeUs + count*this.#stepUs, 'end time');
    for (let i=0;i<count;i++) {
      const timeSeconds = (this.#timeUs + this.#stepUs/2)*1e-6;
      // Compute all next states before committing this step.
      const next = this.#spins.map(({state,position}) => {
        const total = {x:0,y:0,z:0};
        for (const interaction of this.#interactions) {
          const h = spinHamiltonian(interaction({position:{...position}, timeSeconds}));
          total.x += h.x; total.y += h.y; total.z += h.z;
        }
        return state.clone().apply(propagator(total, this.#stepUs*1e-6));
      });
      next.forEach((state,index) => { this.#spins[index].state = state; });
      this.#timeUs += this.#stepUs;
    }
    return this;
  }
  reset() {
    this.#spins.forEach((s,i) => s.state.setComponents(this.#initial[i]));
    this.#timeUs = 0;
  }
  snapshot() {
    return {timeUs:this.#timeUs, spins:this.#spins.map(s => ({components:s.state.components, position:{...s.position}}))};
  }
}
