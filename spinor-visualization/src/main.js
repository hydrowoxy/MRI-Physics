import { Clock } from './clock.js?v=13';
import { Basis3D } from './basis3d.js?v=13';
import { complex, cMul, cAdd, basisRotationMatrix, su2FromAxisAngle } from './operators.js?v=13';

const clocksContainer = document.getElementById('clocks');
const threeContainer = document.getElementById('three');

const basisView = new Basis3D(threeContainer);

const basisPalette = ['#2563eb', '#dc2626', '#16a34a', '#d97706', '#7c3aed', '#0f766e'];

let bases = [];

// initial spinor (in computational basis |up> = [1,0], |down> = [0,1])
// start with a nontrivial normalized spinor
const initialMag0 = 0.8, initialPhase0 = 0.2;
const initialMag1 = Math.sqrt(Math.max(0, 1 - initialMag0*initialMag0));
const initialPhase1 = -0.4;
let spinor = [ complex(initialMag0 * Math.cos(initialPhase0), initialMag0 * Math.sin(initialPhase0)), complex(initialMag1 * Math.cos(initialPhase1), initialMag1 * Math.sin(initialPhase1)) ];

let playing = false;

const basisListEl = document.getElementById('basisList');

function conj(a){ return { re: a.re, im: -a.im }; }
function matDag(U){
  return [[conj(U[0][0]), conj(U[1][0])],[conj(U[0][1]), conj(U[1][1])]];
}
function matApply(U, v){
  const a = cAdd(cMul(U[0][0], v[0]), cMul(U[0][1], v[1]));
  const b = cAdd(cMul(U[1][0], v[0]), cMul(U[1][1], v[1]));
  return [a,b];
}

function updateClocks(){
  bases.forEach(b => {
    const U = basisRotationMatrix(b.theta, b.phi);
    const Ud = matDag(U);
    const coords = matApply(Ud, spinor);
    b.clockA.setComplex(coords[0]);
    b.clockB.setComplex(coords[1]);
  });
  basisView.setBases(bases);
  syncFieldVisualization();
}

function normalizeSpinor(){
  const m0 = Math.hypot(spinor[0].re, spinor[0].im);
  const m1 = Math.hypot(spinor[1].re, spinor[1].im);
  const norm = Math.sqrt(m0*m0 + m1*m1) || 1;
  spinor = [ { re: spinor[0].re / norm, im: spinor[0].im / norm }, { re: spinor[1].re / norm, im: spinor[1].im / norm } ];
}

function normalizeDegrees(deg){
  return ((deg % 360) + 360) % 360;
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
  basisListEl.appendChild(card);

  const basis = { theta: Number(theta), phi: Number(phi), clockA, clockB, card };
  basis.color = color;
  basis.isDefault = id === 0;
  bases.push(basis);

  // If this is the default computational basis (id===0) add spinor controls instead of theta/phi
  let updatingSliders = false;
  if(id===0){
    // remove existing controls and replace with spinor controls
    controls.innerHTML = '';
    const s0mag = document.createElement('input'); s0mag.type='range'; s0mag.min=0; s0mag.max=1; s0mag.step=0.01; s0mag.value = Math.hypot(spinor[0].re, spinor[0].im);
    const s1mag = document.createElement('input'); s1mag.type='range'; s1mag.min=0; s1mag.max=1; s1mag.step=0.01; s1mag.value = Math.hypot(spinor[1].re, spinor[1].im);
    const s0magLabel = document.createElement('div'); s0magLabel.className='label'; s0magLabel.textContent = `|c0| ${Number(s0mag.value).toFixed(2)}`;
    const s1magLabel = document.createElement('div'); s1magLabel.className='label'; s1magLabel.textContent = `|c1| ${Number(s1mag.value).toFixed(2)}`;
    const s0phase = document.createElement('input'); s0phase.type='range'; s0phase.min=0; s0phase.max=360; s0phase.step=1; s0phase.value = normalizeDegrees(Math.atan2(spinor[0].im, spinor[0].re) * 180/Math.PI);
    const s1phase = document.createElement('input'); s1phase.type='range'; s1phase.min=0; s1phase.max=360; s1phase.step=1; s1phase.value = normalizeDegrees(Math.atan2(spinor[1].im, spinor[1].re) * 180/Math.PI);
    const s0phaseLabel = document.createElement('div'); s0phaseLabel.className='label'; s0phaseLabel.textContent = `arg0 ${Number(s0phase.value).toFixed(0)}°`;
    const s1phaseLabel = document.createElement('div'); s1phaseLabel.className='label'; s1phaseLabel.textContent = `arg1 ${Number(s1phase.value).toFixed(0)}°`;
    const resetBtn = document.createElement('button'); resetBtn.textContent='Reset';

    controls.appendChild(s0magLabel); controls.appendChild(s0mag); controls.appendChild(s0phaseLabel); controls.appendChild(s0phase);
    controls.appendChild(s1magLabel); controls.appendChild(s1mag); controls.appendChild(s1phaseLabel); controls.appendChild(s1phase);
    controls.appendChild(resetBtn); controls.appendChild(removeBtn);

    function applySpinorFromSliders(from){
      if(updatingSliders) return;
      updatingSliders = true;
      // read mags and phases
      let m0 = Number(s0mag.value);
      let m1 = Number(s1mag.value);
      const p0 = normalizeDegrees(Number(s0phase.value)) * Math.PI/180;
      const p1 = normalizeDegrees(Number(s1phase.value)) * Math.PI/180;
      // enforce normalization: if user changed one, adjust the other to satisfy m0^2 + m1^2 = 1
      if(from==='m0'){
        m1 = Math.sqrt(Math.max(0, 1 - m0*m0));
        s1mag.value = m1.toFixed(2);
      } else if(from==='m1'){
        m0 = Math.sqrt(Math.max(0, 1 - m1*m1));
        s0mag.value = m0.toFixed(2);
      } else {
        // if neither specified (e.g., initialization), normalize both
        const norm = Math.sqrt(m0*m0 + m1*m1) || 1;
        m0 = m0 / norm; m1 = m1 / norm;
        s0mag.value = m0.toFixed(2); s1mag.value = m1.toFixed(2);
      }
      s0magLabel.textContent = `|c0| ${Number(s0mag.value).toFixed(2)}`;
      s1magLabel.textContent = `|c1| ${Number(s1mag.value).toFixed(2)}`;
      s0phaseLabel.textContent = `arg0 ${normalizeDegrees(Number(s0phase.value)).toFixed(0)}°`;
      s1phaseLabel.textContent = `arg1 ${normalizeDegrees(Number(s1phase.value)).toFixed(0)}°`;
      // set spinor
      spinor[0] = { re: m0*Math.cos(p0), im: m0*Math.sin(p0) };
      spinor[1] = { re: m1*Math.cos(p1), im: m1*Math.sin(p1) };
      normalizeSpinor();
      updateClocks();
      updatingSliders = false;
    }

    s0mag.addEventListener('input', ()=> applySpinorFromSliders('m0'));
    s1mag.addEventListener('input', ()=> applySpinorFromSliders('m1'));
    s0phase.addEventListener('input', ()=> applySpinorFromSliders());
    s1phase.addEventListener('input', ()=> applySpinorFromSliders());
    resetBtn.addEventListener('click', ()=>{
      // reset to initial values
      s0mag.value = Math.hypot(spinor[0].re, spinor[0].im).toFixed(2);
      s1mag.value = Math.hypot(spinor[1].re, spinor[1].im).toFixed(2);
      s0phase.value = normalizeDegrees(Math.atan2(spinor[0].im, spinor[0].re) * 180/Math.PI).toFixed(0);
      s1phase.value = normalizeDegrees(Math.atan2(spinor[1].im, spinor[1].re) * 180/Math.PI).toFixed(0);
      applySpinorFromSliders();
    });

    // expose controls for external update
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
  const fieldBasis = basisRotationMatrix(thetaDeg, phiDeg);
  const fieldBasisDag = matDag(fieldBasis);
  const coeffs = matApply(fieldBasisDag, spinor);
  const halfPhase = (bMag * dt) / 2;
  const plusPhase = { re: Math.cos(-halfPhase), im: Math.sin(-halfPhase) };
  const minusPhase = { re: Math.cos(halfPhase), im: Math.sin(halfPhase) };
  const evolvedCoeffs = [cMul(plusPhase, coeffs[0]), cMul(minusPhase, coeffs[1])];
  spinor = matApply(fieldBasis, evolvedCoeffs);
  normalizeSpinor();
  updateClocks();
  const def = bases[0];
  if(def && def.spinControls){
    const { s0mag, s1mag, s0phase, s1phase, s0magLabel, s1magLabel, s0phaseLabel, s1phaseLabel } = def.spinControls;
    const m0 = Math.hypot(spinor[0].re, spinor[0].im);
    const m1 = Math.hypot(spinor[1].re, spinor[1].im);
    const p0 = normalizeDegrees(Math.atan2(spinor[0].im, spinor[0].re) * 180/Math.PI);
    const p1 = normalizeDegrees(Math.atan2(spinor[1].im, spinor[1].re) * 180/Math.PI);
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
document.getElementById('bTheta').addEventListener('input', syncFieldVisualization);
document.getElementById('bPhi').addEventListener('input', syncFieldVisualization);

// start with the computational basis (spin up/spin down)
addBasis(0,0,'Default');
syncFieldVisualization();
