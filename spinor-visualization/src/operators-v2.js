// Spinor math utilities
const toRad = (d) => d * Math.PI/180;

export function basisRotationMatrix(thetaDeg, phiDeg) {
  // Return SU(2) basis rotation matrix for changing basis.
  // Transformation: [c, d]^T = U * [a, b]^T where [a,b] is old basis spinor, [c,d] is new basis.
  // Formula (user provided):
  // c = a·cos(θ/2) + b·e^(-iφ)·sin(θ/2)
  // d = -a·e^(iφ)·sin(θ/2) + b·cos(θ/2)
  // So U = [[cos(θ/2),        e^(-iφ)·sin(θ/2)],
  //         [-e^(iφ)·sin(θ/2), cos(θ/2)       ]]
  
  const th = toRad(thetaDeg);
  const ph = toRad(phiDeg);
  
  const cos_half = Math.cos(th / 2);
  const sin_half = Math.sin(th / 2);
  
  // e^(-iφ) = cos(φ) - i·sin(φ)
  // e^(iφ)  = cos(φ) + i·sin(φ)
  const exp_neg_i_phi = { re: Math.cos(ph), im: -Math.sin(ph) };
  const exp_i_phi    = { re: Math.cos(ph), im: Math.sin(ph) };
  
  // e^(-iφ)·sin(θ/2)
  const off_diag_01 = {
    re: exp_neg_i_phi.re * sin_half,
    im: exp_neg_i_phi.im * sin_half
  };
  
  // -e^(iφ)·sin(θ/2)
  const off_diag_10 = {
    re: -exp_i_phi.re * sin_half,
    im: -exp_i_phi.im * sin_half
  };
  
  return [[{ re: cos_half, im: 0 }, off_diag_01],
          [off_diag_10, { re: cos_half, im: 0 }]];
}

// Since JS doesn't have complex numbers natively, represent complex as {re,im}
export function complex(re, im=0) { return {re,im}; }
export function cAdd(a,b){ return {re: a.re+b.re, im: a.im+b.im}; }
export function cMul(a,b){ return {re: a.re*b.re - a.im*b.im, im: a.re*b.im + a.im*b.re}; }
export function cScale(a,s){ return {re: a.re*s, im: a.im*s}; }
export function cConj(a){ return {re: a.re, im: -a.im}; }
export function cExp(theta){ return {re: Math.cos(theta), im: Math.sin(theta)}; }

export function applySU2(U, spinor){
  // U is 2x2 with complex entries {re,im}
  const a = cMul(U[0][0], spinor[0]);
  const b = cMul(U[0][1], spinor[1]);
  const c = cMul(U[1][0], spinor[0]);
  const d = cMul(U[1][1], spinor[1]);
  return [cAdd(a,b), cAdd(c,d)];
}

export function su2FromAxisAngle(thetaRad, axis){
  // axis: {x,y,z} normalized. Return SU(2) matrix representing rotation U = cos(θ/2) I - i sin(θ/2) n·σ
  const half = thetaRad/2;
  const cosH = Math.cos(half); const sinH = Math.sin(half);
  const nx = axis.x, ny = axis.y, nz = axis.z;
  const a = { re: cosH, im: -nz * sinH };
  const d = { re: cosH, im: nz * sinH };
  const off01 = { re: -ny * sinH, im: -nx * sinH };
  const off10 = { re: ny * sinH, im: -nx * sinH };
  return [[a, off01],[off10, d]];
}
