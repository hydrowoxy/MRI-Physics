import {
  changeOfBasis,
} from './engine/index.js';
import {
  complementaryMagnitude,
} from './engine/math/complex.js';
import { spinorFromPolarComponents } from './engine/math/rotations.js';
import { createBasisControls } from './view/basis-controls.js';
import { renderChangeOfBasisMath } from './view/basis-math-display.js';
import { Basis3D } from './view/basis3d.js';
import { createFieldControls } from './view/field-controls.js';
import { fieldVectorFromAngles } from './engine/math/rotations.js';
import { Spinor } from './engine/physics/spinor.js';
import { evolveSpinorInField } from './engine/physics/precession.js';
import { getSpinExpectationVector } from './engine/physics/measurement.js';
import { magneticFieldAt } from './engine/physics/magnetic-field.js';

const clocksContainer = document.getElementById('clocks');
const basisListEl = document.getElementById('basisList');
const basisView = new Basis3D(document.getElementById('three'));
const basisPalette = ['#2563eb', '#dc2626', '#16a34a', '#d97706', '#7c3aed', '#0f766e'];

let bases = [];
let playing = false;
const spinor = new Spinor(
  ...spinorFromPolarComponents(0.8, 0.2, complementaryMagnitude(0.8), -0.4)
);

const fieldControls = createFieldControls({
  onChange: ({ theta, phi, magnitude }) => {
    basisView.setFieldDirection(theta, phi, magnitude);
  },
});

function renderBasis(basis) {
  const coords = changeOfBasis(spinor.components, basis.theta, basis.phi);
  basis.clockA.setComplex(coords[0]);
  basis.clockB.setComplex(coords[1]);
  basis.mathEl.textContent = renderChangeOfBasisMath({
    spinor: spinor.components,
    theta: basis.theta,
    phi: basis.phi,
    result: coords,
  });
}

function syncViews() {
  bases.forEach(renderBasis);
  basisView.setBases(bases);

  const field = fieldControls.value();
  const expectation = getSpinExpectationVector(spinor.components);
  basisView.setFieldDirection(field.theta, field.phi, field.magnitude);
  basisView.setExpectationVector(expectation.x, expectation.y, expectation.z);
  bases[0]?.syncSpinControls?.(spinor.components);
}

function addBasis(theta = 0, phi = 0, name = 'Basis') {
  const id = bases.length;
  const basis = createBasisControls({
    id,
    name,
    color: basisPalette[id % basisPalette.length],
    theta,
    phi,
    spinor: spinor.components,
    clocksContainer,
    basisListEl,
    onBasisChange: syncViews,
    onSpinorChange: (nextSpinor) => {
      spinor.setComponents(nextSpinor);
      syncViews();
    },
    onRemove: (removedBasis) => {
      bases = bases.filter((basis) => basis !== removedBasis);
      syncViews();
    },
  });

  bases.push(basis);
  syncViews();
}

function clearExtraBases() {
  bases.filter((basis) => !basis.isDefault).forEach((basis) => {
    basis.clockA.el.remove();
    basis.clockB.el.remove();
    basis.card.remove();
  });
  bases = bases.filter((basis) => basis.isDefault);
  syncViews();
}

function tick(dt, time) {
  const field = fieldControls.value();
  const fieldVector = magneticFieldAt({
    b0: fieldVectorFromAngles(field.magnitude, field.theta, field.phi),
    coordinate: { x: 0, y: 0, z: 0 },
    time,
  });
  spinor.setComponents(evolveSpinorInField(
    spinor.components,
    fieldVector,
    dt
  ));
  syncViews();
}

let lastTime = performance.now();
function loop(now) {
  const dt = (now - lastTime) / 1000;
  lastTime = now;
  if (playing) tick(dt, now / 1000);
  requestAnimationFrame(loop);
}

document.getElementById('addBasis').addEventListener('click', () => addBasis(90, 0, 'Basis'));
document.getElementById('clear').addEventListener('click', clearExtraBases);
document.getElementById('togglePlay').addEventListener('click', (event) => {
  playing = !playing;
  event.target.textContent = playing ? 'Pause' : 'Play';
});

addBasis(0, 0, 'Default');
requestAnimationFrame(loop);
