import { degreesToRadians, normalizeDegrees } from '../math/index.js';
import {
  normalizedAmplitudePair,
  normalizeSpinor,
  spinorComponentMagnitude,
  spinorComponentPhaseDegrees,
  spinorFromPolarComponents,
} from '../physics/index.js';
import { Clock } from './clock.js';
import { createSnapState, snapSliderValue } from './snap-slider.js';

function range({ min, max, step = 1, value }) {
  const input = document.createElement('input');
  input.type = 'range';
  input.min = min;
  input.max = max;
  input.step = step;
  input.value = value;
  return input;
}

function label(text) {
  const el = document.createElement('div');
  el.className = 'label';
  el.textContent = text;
  return el;
}

export function createBasisControls({
  id,
  name,
  color,
  theta,
  phi,
  spinor,
  clocksContainer,
  basisListEl,
  onBasisChange,
  onSpinorChange,
  onRemove,
}) {
  const clockA = new Clock(clocksContainer, id === 0 ? 'Spin Up' : `${name}${id} comp 0`);
  const clockB = new Clock(clocksContainer, id === 0 ? 'Spin Down' : `${name}${id} comp 1`);
  const card = document.createElement('div');
  const title = document.createElement('div');
  const controls = document.createElement('div');
  const mathEl = document.createElement('pre');
  const removeBtn = document.createElement('button');
  const basis = { theta: Number(theta), phi: Number(phi), clockA, clockB, card, mathEl, color, isDefault: id === 0 };

  card.className = 'basis-card';
  card.style.setProperty('--basis-color', color);
  card.style.borderLeft = `5px solid ${color}`;
  title.textContent = `${name} ${id}`;
  title.style.color = color;
  controls.className = 'basis-controls';
  mathEl.className = 'basis-math';
  removeBtn.textContent = 'Remove';
  removeBtn.disabled = basis.isDefault;
  removeBtn.title = basis.isDefault ? 'The original basis cannot be removed' : 'Remove this basis';

  card.append(title, controls, mathEl);
  basisListEl.appendChild(card);

  if (basis.isDefault) {
    setupSpinControls({ basis, controls, removeBtn, spinor, onSpinorChange });
  } else {
    setupBasisAngleControls({ basis, controls, removeBtn, onBasisChange });
  }

  removeBtn.addEventListener('click', () => {
    if (basis.isDefault) return;
    clockA.el.remove();
    clockB.el.remove();
    card.remove();
    onRemove(basis);
  });

  return basis;
}

function setupBasisAngleControls({ basis, controls, removeBtn, onBasisChange }) {
  const thRange = range({ min: 0, max: 180, value: basis.theta });
  const phRange = range({ min: 0, max: 360, value: basis.phi });
  const thLabel = label(`theta ${basis.theta} deg`);
  const phLabel = label(`phi ${basis.phi} deg`);

  function update() {
    basis.theta = Number(thRange.value);
    basis.phi = Number(phRange.value);
    thLabel.textContent = `theta ${basis.theta} deg`;
    phLabel.textContent = `phi ${basis.phi} deg`;
    onBasisChange();
  }

  thRange.addEventListener('input', update);
  phRange.addEventListener('input', update);
  controls.append(thLabel, thRange, phLabel, phRange, removeBtn);
}

function setupSpinControls({ basis, controls, removeBtn, spinor, onSpinorChange }) {
  let updating = false;
  const s0mag = range({ min: 0, max: 1, step: 0.01, value: spinorComponentMagnitude(spinor[0]) });
  const s1mag = range({ min: 0, max: 1, step: 0.01, value: spinorComponentMagnitude(spinor[1]) });
  const s0phase = range({ min: 0, max: 360, value: spinorComponentPhaseDegrees(spinor[0]) });
  const s1phase = range({ min: 0, max: 360, value: spinorComponentPhaseDegrees(spinor[1]) });
  const s0magLabel = label('');
  const s1magLabel = label('');
  const s0phaseLabel = label('');
  const s1phaseLabel = label('');
  const arg0Snap = createSnapState();
  const arg1Snap = createSnapState();

  basis.syncSpinControls = (nextSpinor) => {
    s0mag.value = spinorComponentMagnitude(nextSpinor[0]).toFixed(2);
    s1mag.value = spinorComponentMagnitude(nextSpinor[1]).toFixed(2);
    s0phase.value = spinorComponentPhaseDegrees(nextSpinor[0]).toFixed(0);
    s1phase.value = spinorComponentPhaseDegrees(nextSpinor[1]).toFixed(0);
    updateLabels();
  };

  function updateLabels() {
    s0magLabel.textContent = `|c0| ${Number(s0mag.value).toFixed(2)}`;
    s1magLabel.textContent = `|c1| ${Number(s1mag.value).toFixed(2)}`;
    s0phaseLabel.textContent = `arg0 ${normalizeDegrees(Number(s0phase.value)).toFixed(0)} deg`;
    s1phaseLabel.textContent = `arg1 ${normalizeDegrees(Number(s1phase.value)).toFixed(0)} deg`;
  }

  function apply(from) {
    if (updating) return;
    updating = true;
    if (from !== 'm0' && from !== 'm1') {
      s0phase.value = snapSliderValue(Number(s0phase.value), [0, 90, 180, 270, 360], 5, arg0Snap).toFixed(0);
      s1phase.value = snapSliderValue(Number(s1phase.value), [0, 90, 180, 270, 360], 5, arg1Snap).toFixed(0);
    }

    const [m0, m1] = normalizedAmplitudePair(Number(s0mag.value), Number(s1mag.value), from);
    s0mag.value = m0.toFixed(2);
    s1mag.value = m1.toFixed(2);
    updateLabels();
    onSpinorChange(normalizeSpinor(spinorFromPolarComponents(
      m0,
      degreesToRadians(normalizeDegrees(Number(s0phase.value))),
      m1,
      degreesToRadians(normalizeDegrees(Number(s1phase.value)))
    )));
    updating = false;
  }

  s0mag.addEventListener('input', () => apply('m0'));
  s1mag.addEventListener('input', () => apply('m1'));
  s0phase.addEventListener('input', () => apply());
  s1phase.addEventListener('input', () => apply());
  controls.append(s0magLabel, s0mag, s0phaseLabel, s0phase, s1magLabel, s1mag, s1phaseLabel, s1phase, removeBtn);
  basis.syncSpinControls(spinor);
}
