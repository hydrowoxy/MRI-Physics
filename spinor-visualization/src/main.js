import { Clock } from './clock.js';
import { Basis3D } from './basis3d.js';
import { renderChangeOfBasisMath } from './basis-math-display.js';
import {
  changeOfBasis,
  spinExpectationVectorFromDefaultBasis,
  timeEvolveSpinorInField,
} from './physics/index.js';
import {
  complementaryMagnitude,
  degreesToRadians,
  normalizedAmplitudePair,
  normalizeDegrees,
  normalizeSpinor as normalizeSpinorRule,
  spinorComponentMagnitude,
  spinorComponentPhaseDegrees,
  spinorFromPolarComponents,
} from './math/index.js';

const clocksContainer = document.getElementById('clocks');
const threeContainer = document.getElementById('three');

const basisView = new Basis3D(threeContainer);

const basisPalette = ['#2563eb', '#dc2626', '#16a34a', '#d97706', '#7c3aed', '#0f766e'];

let bases = [];

const initialMag0 = 0.8, initialPhase0 = 0.2;
const initialMag1 = complementaryMagnitude(initialMag0);
const initialPhase1 = -0.4;
let spinor = spinorFromPolarComponents(initialMag0, initialPhase0, initialMag1, initialPhase1);

let playing = false;

const basisListEl = document.getElementById('basisList');

function updateBasisMath(basis, coords){
  if (!basis.mathEl) return;
  basis.mathEl.textContent = renderChangeOfBasisMath({
    spinor,
    theta: basis.theta,
    phi: basis.phi,
    result: coords,
  });
}

function syncExpectationVisualization(){
  const v = spinExpectationVectorFromDefaultBasis(spinor);
  basisView.setExpectationVector(v.x, v.y, v.z);
}

function updateClocks(){
  bases.forEach(b => {
    const coords = changeOfBasis(spinor, b.theta, b.phi);
    b.clockA.setComplex(coords[0]);
    b.clockB.setComplex(coords[1]);
    updateBasisMath(b, coords);
  });
  basisView.setBases(bases);
  syncFieldVisualization();
  syncExpectationVisualization();
}

function normalizeSpinor(){
  spinor = normalizeSpinorRule(spinor);
}

function createSnapState(){
  return { target: null };
}

function snapSliderValue(rawValue, targets, threshold, state){
  if (state.target !== null) {
    if (Math.abs(rawValue - state.target) <= threshold) {
      return state.target;
    }
    state.target = null;
  }

  let bestTarget = null;
  let bestDist = Infinity;
  targets.forEach((t) => {
    const d = Math.abs(rawValue - t);
    if (d <= threshold && d < bestDist) {
      bestDist = d;
      bestTarget = t;
    }
  });

  if (bestTarget !== null) {
    state.target = bestTarget;
    return bestTarget;
  }
  return rawValue;
}

const fieldThetaSnapState = createSnapState();
const fieldPhiSnapState = createSnapState();

function updateFieldLabels(){
  const bMag = Number(document.getElementById('bMag').value || 1);
  const theta = Number(document.getElementById('bTheta').value || 90);
  const phi = Number(document.getElementById('bPhi').value || 0);
  const bMagLabel = document.getElementById('bMagLabel');
  const thetaLabel = document.getElementById('bThetaLabel');
  const phiLabel = document.getElementById('bPhiLabel');
  if (bMagLabel) bMagLabel.textContent = `Magnetic field |B| ${bMag.toFixed(1)}`;
  if (thetaLabel) thetaLabel.textContent = `Field θ ${theta.toFixed(0)}°`;
  if (phiLabel) phiLabel.textContent = `Field φ ${phi.toFixed(0)}°`;
}

function addBasis(theta=0, phi=0, name='Basis'){
  const id = bases.length;
  const color = basisPalette[id % basisPalette.length];
  const labelA = (id===0) ? 'Spin Up' : `${name}${id} · comp 0`;
  const labelB = (id===0) ? 'Spin Down' : `${name}${id} · comp 1`;
  const clockA = new Clock(clocksContainer, labelA);
  const clockB = new Clock(clocksContainer, labelB);

  const card = document.createElement('div');
  card.className = 'basis-card';
  card.style.setProperty('--basis-color', color);
  card.style.borderLeft = `5px solid ${color}`;
  const title = document.createElement('div'); title.textContent = `${name} ${id}`;
  title.style.color = color;
  const controls = document.createElement('div'); controls.className = 'basis-controls';
  const thRange = document.createElement('input'); thRange.type='range'; thRange.min=0; thRange.max=180; thRange.value=theta; thRange.step=1;
  const phRange = document.createElement('input'); phRange.type='range'; phRange.min=0; phRange.max=360; phRange.value=phi; phRange.step=1;
  const thLabel = document.createElement('div'); thLabel.className='label'; thLabel.textContent=`θ ${theta}°`;
  const phLabel = document.createElement('div'); phLabel.className='label'; phLabel.textContent=`φ ${phi}°`;
  const removeBtn = document.createElement('button'); removeBtn.textContent='Remove';
  removeBtn.disabled = id === 0;
  removeBtn.title = id === 0 ? 'The original basis cannot be removed' : 'Remove this basis';

  controls.appendChild(thLabel); controls.appendChild(thRange); controls.appendChild(phLabel); controls.appendChild(phRange); controls.appendChild(removeBtn);
  card.appendChild(title); card.appendChild(controls);
  const mathEl = document.createElement('pre');
  mathEl.className = 'basis-math';
  card.appendChild(mathEl);
  basisListEl.appendChild(card);

  const basis = { theta: Number(theta), phi: Number(phi), clockA, clockB, card, mathEl };
  basis.color = color;
  basis.isDefault = id === 0;
  bases.push(basis);

  let updatingSliders = false;
  if(id===0){
    controls.innerHTML = '';
    const s0mag = document.createElement('input'); s0mag.type='range'; s0mag.min=0; s0mag.max=1; s0mag.step=0.01; s0mag.value = spinorComponentMagnitude(spinor[0]);
    const s1mag = document.createElement('input'); s1mag.type='range'; s1mag.min=0; s1mag.max=1; s1mag.step=0.01; s1mag.value = spinorComponentMagnitude(spinor[1]);
    const s0magLabel = document.createElement('div'); s0magLabel.className='label'; s0magLabel.textContent = `|c0| ${Number(s0mag.value).toFixed(2)}`;
    const s1magLabel = document.createElement('div'); s1magLabel.className='label'; s1magLabel.textContent = `|c1| ${Number(s1mag.value).toFixed(2)}`;
    const s0phase = document.createElement('input'); s0phase.type='range'; s0phase.min=0; s0phase.max=360; s0phase.step=1; s0phase.value = spinorComponentPhaseDegrees(spinor[0]);
    const s1phase = document.createElement('input'); s1phase.type='range'; s1phase.min=0; s1phase.max=360; s1phase.step=1; s1phase.value = spinorComponentPhaseDegrees(spinor[1]);
    const s0phaseLabel = document.createElement('div'); s0phaseLabel.className='label'; s0phaseLabel.textContent = `arg0 ${Number(s0phase.value).toFixed(0)}°`;
    const s1phaseLabel = document.createElement('div'); s1phaseLabel.className='label'; s1phaseLabel.textContent = `arg1 ${Number(s1phase.value).toFixed(0)}°`;
    const resetBtn = document.createElement('button'); resetBtn.textContent='Reset';

    controls.appendChild(s0magLabel); controls.appendChild(s0mag); controls.appendChild(s0phaseLabel); controls.appendChild(s0phase);
    controls.appendChild(s1magLabel); controls.appendChild(s1mag); controls.appendChild(s1phaseLabel); controls.appendChild(s1phase);
    controls.appendChild(resetBtn); controls.appendChild(removeBtn);

    const arg0SnapState = createSnapState();
    const arg1SnapState = createSnapState();

    function applySpinorFromSliders(from){
      if(updatingSliders) return;
      updatingSliders = true;

      if (from !== 'm0' && from !== 'm1') {
        const snapped0 = snapSliderValue(Number(s0phase.value), [0, 90, 180, 270, 360], 5, arg0SnapState);
        const snapped1 = snapSliderValue(Number(s1phase.value), [0, 90, 180, 270, 360], 5, arg1SnapState);
        s0phase.value = snapped0.toFixed(0);
        s1phase.value = snapped1.toFixed(0);
      }

      let m0 = Number(s0mag.value);
      let m1 = Number(s1mag.value);
      const p0 = degreesToRadians(normalizeDegrees(Number(s0phase.value)));
      const p1 = degreesToRadians(normalizeDegrees(Number(s1phase.value)));
      [m0, m1] = normalizedAmplitudePair(m0, m1, from);
      s0mag.value = m0.toFixed(2);
      s1mag.value = m1.toFixed(2);
      s0magLabel.textContent = `|c0| ${Number(s0mag.value).toFixed(2)}`;
      s1magLabel.textContent = `|c1| ${Number(s1mag.value).toFixed(2)}`;
      s0phaseLabel.textContent = `arg0 ${normalizeDegrees(Number(s0phase.value)).toFixed(0)}°`;
      s1phaseLabel.textContent = `arg1 ${normalizeDegrees(Number(s1phase.value)).toFixed(0)}°`;
      spinor = spinorFromPolarComponents(m0, p0, m1, p1);
      normalizeSpinor();
      updateClocks();
      updatingSliders = false;
    }

    s0mag.addEventListener('input', ()=> applySpinorFromSliders('m0'));
    s1mag.addEventListener('input', ()=> applySpinorFromSliders('m1'));
    s0phase.addEventListener('input', ()=> applySpinorFromSliders());
    s1phase.addEventListener('input', ()=> applySpinorFromSliders());
    resetBtn.addEventListener('click', ()=>{
      s0mag.value = spinorComponentMagnitude(spinor[0]).toFixed(2);
      s1mag.value = spinorComponentMagnitude(spinor[1]).toFixed(2);
      s0phase.value = spinorComponentPhaseDegrees(spinor[0]).toFixed(0);
      s1phase.value = spinorComponentPhaseDegrees(spinor[1]).toFixed(0);
      applySpinorFromSliders();
    });

    basis.spinControls = { s0mag, s1mag, s0phase, s1phase, s0magLabel, s1magLabel, s0phaseLabel, s1phaseLabel };
  }

  function updateFromInputs(){
    basis.theta = Number(thRange.value);
    basis.phi = Number(phRange.value);
    thLabel.textContent = `θ ${basis.theta}°`;
    phLabel.textContent = `φ ${basis.phi}°`;
    updateClocks();
  }

  thRange.addEventListener('input', updateFromInputs);
  phRange.addEventListener('input', updateFromInputs);
  removeBtn.addEventListener('click', ()=>{
    if (basis.isDefault) return;
    clockA.el.remove(); clockB.el.remove(); card.remove();
    bases = bases.filter(b=>b!==basis);
    updateClocks();
  });

  updateFromInputs();
}

function clearAll(){
  const defaults = bases.filter(b => b.isDefault);
  const extras = bases.filter(b => !b.isDefault);
  extras.forEach(b=>{ b.clockA.el.remove(); b.clockB.el.remove(); if(b.card) b.card.remove(); });
  bases = defaults;
  updateClocks();
}

function step(dt){
  const bMag = parseFloat(document.getElementById('bMag').value || 1);
  const thetaDeg = parseFloat(document.getElementById('bTheta').value || 90);
  const phiDeg = parseFloat(document.getElementById('bPhi').value || 0);
  spinor = timeEvolveSpinorInField(spinor, dt, bMag, thetaDeg, phiDeg);
  updateClocks();
  const def = bases[0];
  if(def && def.spinControls){
    const { s0mag, s1mag, s0phase, s1phase, s0magLabel, s1magLabel, s0phaseLabel, s1phaseLabel } = def.spinControls;
    const m0 = spinorComponentMagnitude(spinor[0]);
    const m1 = spinorComponentMagnitude(spinor[1]);
    const p0 = spinorComponentPhaseDegrees(spinor[0]);
    const p1 = spinorComponentPhaseDegrees(spinor[1]);
    s0mag.value = m0.toFixed(2);
    s1mag.value = m1.toFixed(2);
    s0phase.value = p0.toFixed(0);
    s1phase.value = p1.toFixed(0);
    s0magLabel.textContent = `|c0| ${Number(s0mag.value).toFixed(2)}`;
    s1magLabel.textContent = `|c1| ${Number(s1mag.value).toFixed(2)}`;
    s0phaseLabel.textContent = `arg0 ${normalizeDegrees(Number(s0phase.value)).toFixed(0)}°`;
    s1phaseLabel.textContent = `arg1 ${normalizeDegrees(Number(s1phase.value)).toFixed(0)}°`;
  }
}

function syncFieldVisualization(){
  const bMag = parseFloat(document.getElementById('bMag').value || 1);
  const theta = parseFloat(document.getElementById('bTheta').value || 90);
  const phi = parseFloat(document.getElementById('bPhi').value || 0);
  updateFieldLabels();
  basisView.setFieldDirection(theta, phi, bMag);
}

let lastTime = performance.now();
function loop(now){
  const dt = (now - lastTime)/1000; lastTime = now;
  if(playing) step(dt);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

document.getElementById('addBasis').addEventListener('click', ()=> addBasis(90,0,'Basis'));
document.getElementById('clear').addEventListener('click', ()=> { clearAll(); });
document.getElementById('togglePlay').addEventListener('click', (e)=>{ playing = !playing; e.target.textContent = playing? 'Pause':'Play'; });
document.getElementById('bMag').addEventListener('input', syncFieldVisualization);
document.getElementById('bTheta').addEventListener('input', (event)=>{
  const slider = event.target;
  const snapped = snapSliderValue(Number(slider.value), [0, 90, 180], 5, fieldThetaSnapState);
  slider.value = snapped.toFixed(0);
  syncFieldVisualization();
});
document.getElementById('bPhi').addEventListener('input', (event)=>{
  const slider = event.target;
  const snapped = snapSliderValue(Number(slider.value), [0, 90, 180, 270, 360], 5, fieldPhiSnapState);
  slider.value = snapped.toFixed(0);
  syncFieldVisualization();
});

addBasis(0,0,'Default');
syncFieldVisualization();
syncExpectationVisualization();
window.__spinorDebug = {
  getSpinor: () => spinor.map((z) => ({ re: z.re, im: z.im })),
  getExpectation: () => {
    const v = spinExpectationVectorFromDefaultBasis(spinor);
    return { x: v.x, y: v.y, z: v.z };
  },
  getFieldValues: () => ({
    bMag: document.getElementById('bMag').value,
    bTheta: document.getElementById('bTheta').value,
    bPhi: document.getElementById('bPhi').value,
  }),
};
