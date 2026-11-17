// Browser composition root connecting simulation, controller, controls and viewer.

import { Spinor, Simulation, spinorFromPolarComponents } from './engine/index.js';
import { SimulationController } from './application/controller.js';
import { SpinorViewer } from './view/spinor-viewer.js';
import { complementaryMagnitude } from './view/amplitude-controls.js';
import { fieldVectorFromAngles } from './view/physics-input.js';
import { createFieldControls } from './view/field-controls.js';

const simulation = new Simulation({
  spins:[{state:new Spinor(...spinorFromPolarComponents(0.8,0.2,complementaryMagnitude(0.8),-0.4))}],
  stepPs:1,
});
let controller;
const viewer = new SpinorViewer({
  clocksContainer:document.getElementById('clocks'),
  basisListEl:document.getElementById('basisList'),
  threeContainer:document.getElementById('three'),
  onSpinorChange:components=>controller.setSpinState(components),
});
const fieldControls = createFieldControls({
  onChange:({magnitude,theta,phi})=>controller.setField(fieldVectorFromAngles(magnitude,theta,phi)),
});
const field = fieldControls.value();
controller = new SimulationController({simulation,viewer,playbackRate:Number(document.getElementById('playbackRate').value),field:fieldVectorFromAngles(field.magnitude,field.theta,field.phi)});
viewer.addBasis(0,0,'Default');
document.getElementById('addBasis').addEventListener('click',()=>viewer.addBasis());
document.getElementById('clear').addEventListener('click',()=>viewer.clearExtraBases());
document.getElementById('togglePlay').addEventListener('click',event=>{
  controller.setPlaying(!controller.playing);
  event.target.textContent=controller.playing?'Pause':'Play';
});
document.getElementById('playbackRate').addEventListener('change',event=>controller.setPlaybackRate(Number(event.target.value)));
document.addEventListener('visibilitychange',()=>controller.setSuspended(document.hidden));
controller.setSuspended(document.hidden);
function frame(now) {
  controller.frame(now);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
