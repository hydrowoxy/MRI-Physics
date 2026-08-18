/*
Spin expectation vector from spinor clocks [a, b].

P(up) = |a|^2
P(down) = |b|^2
relativeClock = conjugate(a) b

<S> = (
  2 Im(relativeClock),
  P(up) - P(down),
  2 Re(relativeClock)
)

The expectation vector is physical, so it does not depend on which basis was
used to describe the same state. A new basis changes the coordinates, not the
state itself.
*/

export function spinExpectationVectorFromDefaultBasis(state) {
  const a = state[0];
  const b = state[1];

  const upProbability = a.re * a.re + a.im * a.im;
  const downProbability = b.re * b.re + b.im * b.im;

  // The clock radii set the up/down imbalance. The relative clock angle sets
  // the sideways direction, so probabilities alone are not the whole vector.
  const relativeClock = {
    re: a.re * b.re + a.im * b.im,
    im: a.re * b.im - a.im * b.re,
  };

  return {
    x: 2 * relativeClock.im,
    y: upProbability - downProbability,
    z: 2 * relativeClock.re,
  };
}
