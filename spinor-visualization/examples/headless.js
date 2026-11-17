import { Simulation, Spinor, createMagneticField, magneticInteraction } from '../src/engine/index.js';
const simulation = new Simulation({
  spins: [{state: new Spinor({re:Math.SQRT1_2,im:0},{re:Math.SQRT1_2,im:0})}],
  stepUs: 1,
  interactions: [magneticInteraction(createMagneticField({b0:{x:0,y:0,z:1}}))],
});
simulation.step(1000);
console.log(JSON.stringify(simulation.snapshot(),null,2));
