import test from 'node:test';
import assert from 'node:assert/strict';
import { changeOfBasis, returnFromBasis, normalizeSpinor, evolveSpinorInField } from '../src/engine/index.js';

import { fieldVectorFromAngles } from '../src/view/physics-input.js';
import { Clock } from '../src/view/clock.js';
import { renderChangeOfBasisMath } from '../src/view/basis-math-display.js';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-11, `${a} != ${b}`);
const same=(a,b)=>a.forEach((c,i)=>{near(c.re,b[i].re);near(c.im,b[i].im);});

// The handwritten equations give f=0, g=1 for the drawing's input, despite its reversed final sketch.
test('paint-math 90 degree example follows the written equations',()=>{
  const state=[{re:0,im:Math.SQRT1_2},{re:Math.SQRT1_2,im:0}];
  const result=changeOfBasis(state,90,90);
  same(result,[{re:0,im:0},{re:1,im:0}]);
  const text=renderChangeOfBasisMath({spinor:state,theta:90,phi:90,result});
  assert.ok(text.includes('f = a cos(theta/2) + b e^(-i phi) sin(theta/2)'));
  assert.ok(text.includes('g = -a e^(i phi) sin(theta/2) + b cos(theta/2)'));
  assert.ok(text.includes('g = 1.00 + 0.00i'));
});

// Compare basis output with independently expanded real/imaginary equations used on main.
test('basis amplitudes agree with main equations across angles and phases',()=>{
  for(let i=0;i<60;i++) {
    const [a,b]=normalizeSpinor([{re:Math.sin(i+1),im:Math.cos(i*0.7)},{re:Math.cos(i+2),im:Math.sin(i*0.3)}]);
    const theta=(i*37)%181,phi=(i*71)%360;
    const c=Math.cos(theta*Math.PI/360),s=Math.sin(theta*Math.PI/360);
    const cp=Math.cos(phi*Math.PI/180),sp=Math.sin(phi*Math.PI/180);
    const expected=[
      {re:a.re*c+(b.re*cp+b.im*sp)*s,im:a.im*c+(b.im*cp-b.re*sp)*s},
      {re:-(a.re*cp-a.im*sp)*s+b.re*c,im:-(a.im*cp+a.re*sp)*s+b.im*c},
    ];
    same(changeOfBasis([a,b],theta,phi),expected);
  }
});

// Main evolves in the field eigenbasis; gamma=-1 reproduces its original unitless phase convention.
test('direct magnetic propagator agrees with main field-basis evolution including complex phases',()=>{
  const state=normalizeSpinor([{re:0.3,im:0.4},{re:-0.2,im:0.7}]);
  for(const gamma of [-1,1,2.6752218708e8]) for(const theta of [0,37,90,180]) for(const phi of [0,90,213]) {
    const magnitude=1.7,dt=0.43/Math.abs(gamma);
    const inField=changeOfBasis(state,theta,phi);
    // Main's phases are (-omega dt/2, +omega dt/2); physical omega is -gamma B.
    const phase=gamma*magnitude*dt/2;
    const phases=[phase,-phase];
    const phased=inField.map((a,i)=>({re:a.re*Math.cos(phases[i])-a.im*Math.sin(phases[i]),im:a.re*Math.sin(phases[i])+a.im*Math.cos(phases[i])}));
    same(evolveSpinorInField(state,fieldVectorFromAngles(magnitude,theta,phi),dt,gamma),returnFromBasis(phased,theta,phi));
  }
});

function drawClock(value) {
  const calls={arcs:[],lines:[],text:[]};
  const ctx={clearRect(){},beginPath(){},stroke(){},fill(){},moveTo(){},
    arc(...args){calls.arcs.push(args);},lineTo(...args){calls.lines.push(args);},fillText(...args){calls.text.push(args);}};
  const clock=Object.create(Clock.prototype);
  Object.assign(clock,{ctx,canvas:{width:200,height:200},dpr:1,value});
  clock.draw();return calls;
}

// Test the actual canvas drawing path: amplitude radius and counterclockwise complex phase.
test('clock radii and hands represent amplitudes, including zero and tiny values',()=>{
  for(const [value,x,y,radius] of [
    [{re:1,im:0},178,100,88],
    [{re:0,im:1},100,22,88],
    [{re:-1,im:0},22,100,88],
    [{re:0,im:-1},100,178,88],
    [{re:0.5,im:0},135.2,100,44],
    [{re:0.01,im:0},100.704,100,0.88],
  ]) {
    const calls=drawClock(value);
    near(calls.arcs[1][2],radius);
    near(calls.lines[0][0],x);near(calls.lines[0][1],y);
    assert.ok(calls.text[0][0].startsWith('|z|='));
  }
  assert.equal(drawClock({re:0,im:0}).lines.length,0);
});
