export function complex(re, im = 0) {
  return { re, im };
}

export function complexAdd(a, b) {
  return { re: a.re + b.re, im: a.im + b.im };
}

export function complexMul(a, b) {
  return {
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re,
  };
}

export function complexScale(a, scale) {
  return { re: a.re * scale, im: a.im * scale };
}
