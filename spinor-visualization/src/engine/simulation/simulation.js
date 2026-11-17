// Headless fixed-step spin evolution with integer-picosecond simulation time.

import { Spinor } from '../physics/spinor.js';
import { propagator, spinHamiltonian } from '../physics/operators/index.js';
function integer(value, name, minimum=0) {
  if (!Number.isSafeInteger(value) || value < minimum) throw new RangeError(`${name} must be a safe integer >= ${minimum}`);
}
export class Simulation {
  #timePs = 0n;
  #spins;
  #initial;
  #interactions;
  #stepPs;
  constructor({spins=[{}], interactions=[], stepUs=1000, stepPs=undefined}={}) {
    if (stepPs === undefined) {
      integer(stepUs, 'stepUs', 1);
      stepPs = stepUs * 1e6;
    }
    integer(stepPs, 'stepPs', 1);
    this.#stepPs = stepPs;
    this.#spins = spins.map(({state=new Spinor(), position={x:0,y:0,z:0}}) => {
      if (![position.x,position.y,position.z].every(Number.isFinite)) throw new TypeError('finite position required');
      return {state: state.clone(), position: {...position}};
    });
    this.#initial = this.#spins.map(s => s.state.components);
    this.setInteractions(interactions);
  }
  get timePs() { return this.#timePs; }
  get timeUs() { return Number(this.#timePs) / 1e6; }
  get stepUs() { return this.#stepPs / 1e6; }
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

    for (let i=0;i<count;i++) {
      const timeSeconds = Number(this.#timePs)*1e-12 + this.#stepPs*0.5e-12;
      // Compute all next states before committing this step.
      const next = this.#spins.map(({state,position}) => {
        const total = {x:0,y:0,z:0};
        for (const interaction of this.#interactions) {
          const h = spinHamiltonian(interaction({position:{...position}, timeSeconds}));
          total.x += h.x; total.y += h.y; total.z += h.z;
        }
        return state.clone().apply(propagator(total, this.#stepPs*1e-12));
      });
      next.forEach((state,index) => { this.#spins[index].state = state; });
      this.#timePs += BigInt(this.#stepPs);
    }
    return this;
  }
  reset() {
    this.#spins.forEach((s,i) => s.state.setComponents(this.#initial[i]));
    this.#timePs = 0n;
  }
  snapshot() {
    return {timeUs:this.timeUs, timePs:this.#timePs.toString(), spins:this.#spins.map(s => ({components:s.state.components, position:{...s.position}}))};
  }
}
