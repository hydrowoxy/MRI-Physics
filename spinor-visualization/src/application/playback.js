// Wall-clock playback pacing; only Simulation.step advances scientific time.

export class Playback {
  #simulation;
  #lastMs = null;
  #pendingUs = 0;
  #playing = false;
  #suspended = false;
  #rate;
  constructor(simulation, {rate=1}={}) {
    this.#simulation = simulation;
    this.setRate(rate);
  }
  setRate(rate) {
    if (!Number.isFinite(rate) || rate <= 0) throw new RangeError('positive playback rate required');
    this.#rate = rate;
    this.#lastMs = null;
  }
  get playing() { return this.#playing; }
  setPlaying(value) { this.#playing = Boolean(value); this.#lastMs = null; }
  setSuspended(value) { this.#suspended = Boolean(value); this.#lastMs = null; }
  reset() { this.#lastMs = null; this.#pendingUs = 0; }
  frame(nowMs) {
    if (!Number.isFinite(nowMs)) throw new TypeError('finite playback timestamp required');
    if (!this.#playing || this.#suspended) { this.#lastMs = null; return false; }
    if (this.#lastMs === null) { this.#lastMs = nowMs; return false; }
    if (nowMs < this.#lastMs) throw new RangeError('playback timestamps must be monotonic');
    this.#pendingUs += (nowMs - this.#lastMs) * 1000 * this.#rate;
    this.#lastMs = nowMs;
    const steps = Math.floor(this.#pendingUs / this.#simulation.stepUs);
    if (!steps) return false;
    this.#simulation.step(steps);
    this.#pendingUs -= steps * this.#simulation.stepUs;
    return true;
  }
}
