// Amplitude-clock presentation from snapshots, with callbacks for edit requests.

import { createBasisControls } from './basis-controls.js';
import { renderChangeOfBasisMath } from './basis-math-display.js';
import { Basis3D } from './basis3d.js';
import { snapshotModel } from './snapshot-model.js';
const palette = ['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0f766e'];
export class SpinorViewer {
  #bases = [];
  #nextId = 0;
  #snapshot;
  #basisView;
  #containers;
  #onSpinorChange;
  constructor({clocksContainer,basisListEl,threeContainer,onSpinorChange}) {
    this.#containers = {clocksContainer,basisListEl};
    this.#basisView = new Basis3D(threeContainer);
    this.#onSpinorChange = onSpinorChange;
  }
  render(snapshot) {
    this.#snapshot = structuredClone(snapshot);
    const model = snapshotModel(this.#snapshot,this.#bases);
    this.#bases.forEach((basis,index)=>{
      const coords = model.bases[index].components;
      basis.clockA.setComplex(coords[0]);
      basis.clockB.setComplex(coords[1]);
      basis.mathEl.textContent = renderChangeOfBasisMath({spinor:model.components,theta:basis.theta,phi:basis.phi,result:coords});
      basis.syncSpinControls?.(model.components);
    });
    this.#basisView.setBases(model.bases);
    this.#basisView.setFieldDirection(model.field.theta,model.field.phi,model.field.magnitude);
    const {x,y,z} = model.expectation;
    this.#basisView.setExpectationVector(x,y,z);
  }
  addBasis(theta=90,phi=0,name='Basis') {
    if (!this.#snapshot) throw new Error('render an initial snapshot before adding bases');
    const id = this.#nextId++;
    const basis = createBasisControls({
      ...this.#containers,id,name,theta,phi,color:palette[id%palette.length],
      spinor:this.#snapshot.simulation.spins[0].components,
      onBasisChange:()=>this.render(this.#snapshot),
      onSpinorChange:components=>this.#onSpinorChange(components),
      onRemove:removed=>{this.#bases=this.#bases.filter(b=>b!==removed);this.render(this.#snapshot);},
    });
    this.#bases.push(basis);
    this.render(this.#snapshot);
  }
  clearExtraBases() {
    this.#bases.filter(b=>!b.isDefault).forEach(b=>{b.clockA.el.remove();b.clockB.el.remove();b.card.remove();});
    this.#bases=this.#bases.filter(b=>b.isDefault);
    this.render(this.#snapshot);
  }
}
