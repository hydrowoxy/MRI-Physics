import test from 'node:test';
import assert from 'node:assert/strict';
import { Spinor, Simulation, PAULI_X, PAULI_Y, PAULI_Z, applyOperator, propagator, spinHamiltonian, zeemanHamiltonian, magneticInteraction, createMagneticField, magneticFieldAt, getSpinExpectationVector, normalizeSpinor, changeOfBasis, returnFromBasis, sampleSpinAlongAxis } from '../src/engine/index.js';
const near = (a,b,tolerance=1e-10) => assert.ok(Math.abs(a-b)<tolerance, `${a} != ${b}`);
function sameState(a,b) { a.forEach((c,i) => { near(c.re,b[i].re); near(c.im,b[i].im); }); }
// Reject invalid quantum states and prevent callers from mutating stored amplitudes indirectly.
test('state validation, explicit normalization and defensive copies', () => {
  for (const v of [[[ {re:0,im:0},{re:0,im:0} ]], [[{re:2,im:0},{re:0,im:0}]], [[{re:NaN,im:0},{re:0,im:0}]]]) {
    assert.throws(() => new Spinor(...v[0]));
  }
  const s = new Spinor(...normalizeSpinor([{re:2,im:0},{re:0,im:0}]));
  s.components[0].re=0; s.alpha.re=0;
  assert.equal(s.alpha.re,1);
  assert.throws(() => s.apply([[{re:2,im:0},{re:0,im:0}],[{re:0,im:0},{re:2,im:0}]]));
  assert.equal(s.alpha.re,1);
});
// Verify known Pauli actions on spin-up, including the complex phase introduced by sigma-y.
test('Pauli action and composition', () => {
  const up = new Spinor().components;
  const down = new Spinor({re:0,im:0},{re:1,im:0}).components;
  sameState(applyOperator(PAULI_X,up),down);
  sameState(applyOperator(PAULI_Y,up),[{re:0,im:0},{re:0,im:1}]);
  sameState(applyOperator(PAULI_Z,up),up);
  sameState(applyOperator(PAULI_X,applyOperator(PAULI_X,up)),up);
});
// Fix the magnetic precession sign convention with an analytically known quarter-turn.
test('Zeeman sign: positive gamma, +z field turns +x toward -y', () => {
  const s = new Spinor({re:Math.SQRT1_2,im:0},{re:Math.SQRT1_2,im:0});
  s.apply(propagator(zeemanHamiltonian({x:0,y:0,z:1},1),Math.PI/2));
  const b = getSpinExpectationVector(s.components);
  near(b.x,0); near(b.y,-1); near(b.z,0);
});
// Check that repeated unitary steps preserve normalization and undo without losing amplitude phase.
test('constant-H reversibility, norm preservation and basis round trip', () => {
  const initial = normalizeSpinor([{re:0.3,im:0.2},{re:-0.4,im:0.7}]);
  const s = new Spinor(...initial), h=spinHamiltonian({x:2,y:-3,z:4});
  for(let i=0;i<10000;i++) s.apply(propagator(h,1e-6));
  s.apply(propagator(h,-0.01));
  sameState(s.components,initial);
  sameState(returnFromBasis(changeOfBasis(initial,73,129),73,129),initial);
});
// Verify exact elapsed time, midpoint sampling, reset behavior and independence from call grouping.
test('clock and evolution are independent of step-call grouping', () => {
  const times=[];
  const interaction=({timeSeconds}) => { times.push(timeSeconds); return {x:0,y:0,z:timeSeconds}; };
  const a=new Simulation({stepUs:1,interactions:[interaction]});
  const b=new Simulation({stepUs:1,interactions:[interaction]});
  a.step(1000); for(let i=0;i<1000;i++) b.step();
  assert.equal(a.timeUs,1000); assert.deepEqual(a.snapshot(),b.snapshot());
  near(times[0],0.5e-6);
  const snapshot=a.snapshot(); snapshot.spins[0].components[0].re=99;
  assert.notEqual(a.snapshot().spins[0].components[0].re,99);
  a.reset(); assert.equal(a.timeUs,0); assert.equal(a.snapshot().spins[0].components[0].re,1);
  assert.throws(()=>a.step(-1)); assert.throws(()=>new Simulation({stepUs:0.1}));
  assert.throws(()=>a.step(Number.MAX_SAFE_INTEGER+1));
});
// Compare combined noncommuting interactions with their total Hamiltonian for each independent spin.
test('simultaneous interactions sum before evolution and batch matches single spin', () => {
  const h1=()=>({x:2,y:0,z:0}), h2=()=>({x:0,y:3,z:0});
  const batch=new Simulation({spins:[{},{}],interactions:[h1,h2],stepUs:100});
  const single=new Simulation({interactions:[()=>({x:2,y:3,z:0})],stepUs:100});
  batch.step(100); single.step(100);
  for(const s of batch.snapshot().spins) sameState(s.components,single.snapshot().spins[0].components);
});
// Verify longitudinal gradient encoding and reproducible outcome sampling along a valid unit axis.
test('longitudinal gradient and injected measurement sampling', () => {
  assert.deepEqual(magneticFieldAt({b0:{x:0,y:0,z:2},gradients:{x:1,y:2,z:3},coordinate:{x:2,y:3,z:4}}),{x:0,y:0,z:22});
  assert.throws(()=>magneticFieldAt({b0:{x:NaN,y:0,z:0}}));
  assert.equal(sampleSpinAlongAxis(new Spinor().components,{x:0,y:0,z:1},()=>0.9),1);
  assert.throws(()=>sampleSpinAlongAxis(new Spinor().components,{x:2,y:0,z:0}));
});
// Ensure field callbacks receive the particle position and simulation midpoint time without a viewer.
test('headless field interaction samples spin position and simulation time', () => {
  const seen=[];
  const field=(position,t)=>{seen.push([position.x,t]);return {x:0,y:0,z:1};};
  const s=new Simulation({spins:[{position:{x:4,y:0,z:0}}],stepUs:2,interactions:[magneticInteraction(field)]});
  s.step(); assert.deepEqual(seen,[[4,1e-6]]);
  assert.equal(typeof createMagneticField(),'function');
});

// Ground the hydrogen default in its measured coupling and a known quarter-turn.
test('hydrogen default uses physical gamma and allows spin-half species overrides', async () => {
  const { HYDROGEN_1, DEFAULT_SPECIES, validateSpecies } = await import('../src/engine/index.js');
  assert.equal(DEFAULT_SPECIES, HYDROGEN_1);
  assert.equal(HYDROGEN_1.gyromagneticRatio, 2.6752218708e8);
  near(HYDROGEN_1.gyromagneticRatio / (2*Math.PI*1e6), 42.577478461, 1e-8);
  const h=zeemanHamiltonian({x:0,y:0,z:1});
  assert.equal(h.z,-HYDROGEN_1.gyromagneticRatio);
  const s=new Spinor({re:Math.SQRT1_2,im:0},{re:Math.SQRT1_2,im:0});
  s.apply(propagator(h,Math.PI/(2*HYDROGEN_1.gyromagneticRatio)));
  near(getSpinExpectationVector(s.components).y,-1);
  assert.equal(zeemanHamiltonian({x:0,y:0,z:1},2).z,-2);
  assert.equal(validateSpecies({spin:0.5,gyromagneticRatio:-3}).gyromagneticRatio,-3);
  assert.throws(()=>validateSpecies({spin:1,gyromagneticRatio:3}));
});
