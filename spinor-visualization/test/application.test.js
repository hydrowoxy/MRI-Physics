import test from 'node:test';
import assert from 'node:assert/strict';
import { Simulation, Spinor } from '../src/engine/index.js';
import { Playback } from '../src/application/playback.js';
import { SimulationController } from '../src/application/controller.js';
import { snapshotModel } from '../src/view/snapshot-model.js';
// Check that playback retains sub-step time without advancing through pauses or hidden intervals.
test('playback keeps fractional budget and excludes paused/hidden time',()=>{
  const s=new Simulation({stepUs:1000}),p=new Playback(s);
  p.setPlaying(true); p.frame(0); p.frame(0.5); assert.equal(s.timeUs,0);
  p.frame(1.25); assert.equal(s.timeUs,1000);
  p.setPlaying(false);p.frame(10000);p.setPlaying(true);p.frame(20000);p.frame(20000.75);
  assert.equal(s.timeUs,2000);
  p.setSuspended(true);p.frame(30000);p.setSuspended(false);p.frame(40000);p.frame(40001);
  assert.equal(s.timeUs,3000);
  assert.throws(()=>p.frame(0));
});
// Check identical evolution through both entry points and isolation of viewer snapshots.
test('headless and controller-driven simulations agree with a snapshot-only consumer',()=>{
  const state=new Spinor({re:Math.SQRT1_2,im:0},{re:Math.SQRT1_2,im:0});
  const a=new Simulation({spins:[{state}]}),b=new Simulation({spins:[{state}]});
  const snapshots=[];
  const ca=new SimulationController({simulation:a,viewer:{render:s=>snapshots.push(s)},field:{x:1,y:2,z:3}});
  const cb=new SimulationController({simulation:b,viewer:{render:()=>{}},field:{x:1,y:2,z:3}});
  ca.setPlaying(true);ca.frame(0);ca.frame(10);cb.step(10);
  assert.deepEqual(a.snapshot(),b.snapshot());
  const snapshot=snapshots.at(-1),before=structuredClone(snapshot);
  const model=snapshotModel(snapshot,[{id:0,theta:0,phi:0,color:'red'}]);
  model.components[0].re=99;
  assert.deepEqual(snapshot,before);
  snapshot.simulation.spins[0].components[0].re=77;
  assert.notEqual(a.snapshot().spins[0].components[0].re,77);
  ca.reset();assert.equal(a.timeUs,0);ca.frame(1000);assert.equal(a.timeUs,0);
});
