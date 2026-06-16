function formatComplex(z){
  const re = z.re.toFixed(2);
  const imAbs = Math.abs(z.im).toFixed(2);
  const sign = z.im < 0 ? '-' : '+';
  return `${re} ${sign} ${imAbs}i`;
}

export function renderChangeOfBasisMath({ spinor, theta, phi, result }) {
  const [a, b] = spinor;
  const [f, g] = result;

  return [
    `f = a cos(theta/2) + b e^(-i phi) sin(theta/2)`,
    `g = -a e^(i phi) sin(theta/2) + b cos(theta/2)`,
    ``,
    `theta = ${theta.toFixed(0)} deg, phi = ${phi.toFixed(0)} deg`,
    `a = ${formatComplex(a)}`,
    `b = ${formatComplex(b)}`,
    ``,
    `f = ${formatComplex(f)}`,
    `g = ${formatComplex(g)}`,
  ].join('\n');
}
