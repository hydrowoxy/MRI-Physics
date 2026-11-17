// Traceless spin Hamiltonian coefficients in angular-frequency units.

// H/hbar = (omega dot sigma)/2, represented in angular-frequency units.
export function spinHamiltonian(omega) {
  if (![omega.x, omega.y, omega.z].every(Number.isFinite)) throw new TypeError('finite Hamiltonian coefficients required');
  return Object.freeze({ x: omega.x, y: omega.y, z: omega.z });
}

// is there any better way to have the math shown here without typing it in a 
// comment like above 