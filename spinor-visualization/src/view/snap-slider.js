export function createSnapState() {
  return { target: null };
}

export function snapSliderValue(rawValue, targets, threshold, state) {
  if (state.target !== null) {
    if (Math.abs(rawValue - state.target) <= threshold) return state.target;
    state.target = null;
  }

  let bestTarget = null;
  let bestDist = Infinity;
  targets.forEach((target) => {
    const distance = Math.abs(rawValue - target);
    if (distance <= threshold && distance < bestDist) {
      bestDist = distance;
      bestTarget = target;
    }
  });

  if (bestTarget !== null) state.target = bestTarget;
  return bestTarget ?? rawValue;
}
