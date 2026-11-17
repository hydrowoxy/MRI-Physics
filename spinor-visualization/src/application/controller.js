// Simulation commands and detached snapshots for a render(snapshot) consumer.

import { createMagneticField, magneticInteraction, DEFAULT_SPECIES, validateSpecies } from '../engine/index.js';
import { Playback } from './playback.js';
export class SimulationController {
  #simulation;
  #viewer;
  #field;
  #gamma;
  #playback;
  constructor({simulation, viewer, field={x:0,y:0,z:0}, species=DEFAULT_SPECIES, gamma=species.gyromagneticRatio, playbackRate=1}) {
    this.#simulation = simulation;
    this.#viewer = viewer;
    validateSpecies(species);
    if (!Number.isFinite(gamma)) throw new TypeError('finite gamma required');
    this.#gamma = gamma;
    this.#playback = new Playback(simulation, {rate:playbackRate});
    this.setField(field);
  }
  get playing() { return this.#playback.playing; }
  render() {
    this.#viewer.render({simulation:this.#simulation.snapshot(), field:{...this.#field}});
  }
  setField(field) {
    const fieldAt = createMagneticField({b0:field});
    // Validate immediately, including when paused.
    fieldAt({x:0,y:0,z:0},0);
    this.#simulation.setInteractions([magneticInteraction(fieldAt,this.#gamma)]);
    this.#field = {...field};
    this.render();
  }
  setSpinState(components, index=0) { this.#simulation.setSpinState(index,components); this.render(); }
  setPlaybackRate(rate) { this.#playback.setRate(rate); }
  setPlaying(value) { this.#playback.setPlaying(value); }
  setSuspended(value) { this.#playback.setSuspended(value); }
  frame(nowMs) { if (this.#playback.frame(nowMs)) this.render(); }
  step(count=1) { this.#simulation.step(count); this.render(); }
  reset() { this.#simulation.reset(); this.#playback.reset(); this.render(); }
}
