import { complexMul } from '../math/index.js';

/*
Magnetic-field time evolution in the field's own up/down basis.

omega = |B|
psi(t) = [a(t), b(t)]

a(t + dt) = a(t) exp(-i omega dt / 2)
b(t + dt) = b(t) exp(+i omega dt / 2)

In this basis the magnetic field changes only the clock phases, not their
radii/probabilities. The changing relative phase is what appears as precession
after converting back to the display/default basis.
*/

export function applyMagneticHamiltonian(fieldBasisSpinor, dt, fieldMagnitude) {
  const halfPhase = (fieldMagnitude * dt) / 2;
  const spinUpPhase = { re: Math.cos(-halfPhase), im: Math.sin(-halfPhase) };
  const spinDownPhase = { re: Math.cos(halfPhase), im: Math.sin(halfPhase) };

  return [
    complexMul(spinUpPhase, fieldBasisSpinor[0]),
    complexMul(spinDownPhase, fieldBasisSpinor[1]),
  ];
}
