function probability(component) {
  return component.re * component.re + component.im * component.im;
}

export function spinExpectation(spinor) {
  const alpha = spinor.alpha || spinor[0];
  const beta = spinor.beta || spinor[1];
  const alphaProbability = probability(alpha);
  const betaProbability = probability(beta);
  const relative = {
    re: alpha.re * beta.re + alpha.im * beta.im,
    im: alpha.re * beta.im - alpha.im * beta.re,
  };

  return {
    x: 2 * relative.im,
    y: alphaProbability - betaProbability,
    z: 2 * relative.re,
  };
}

export function measurementProbabilities(spinor) {
  const alpha = spinor.alpha || spinor[0];
  const beta = spinor.beta || spinor[1];
  return { alpha: probability(alpha), beta: probability(beta) };
}

export function measureAlongAxis(spinor, axis, random = Math.random) {
  const expectation = spinExpectation(spinor);
  const projection = expectation.x * axis.x
    + expectation.y * axis.y
    + expectation.z * axis.z;
  const positiveProbability = (1 + projection) / 2;
  return random() < positiveProbability ? 1 : -1;
}
