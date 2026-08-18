import { createSnapState, snapSliderValue } from './snap-slider.js';

export function createFieldControls({ onChange }) {
  const bMag = document.getElementById('bMag');
  const bTheta = document.getElementById('bTheta');
  const bPhi = document.getElementById('bPhi');
  const bMagLabel = document.getElementById('bMagLabel');
  const thetaLabel = document.getElementById('bThetaLabel');
  const phiLabel = document.getElementById('bPhiLabel');
  const thetaSnap = createSnapState();
  const phiSnap = createSnapState();

  function value() {
    return {
      magnitude: Number(bMag.value || 1),
      theta: Number(bTheta.value || 90),
      phi: Number(bPhi.value || 0),
    };
  }

  function updateLabels() {
    const field = value();
    bMagLabel.textContent = `Magnetic field |B| ${field.magnitude.toFixed(1)}`;
    thetaLabel.textContent = `Field theta ${field.theta.toFixed(0)} deg`;
    phiLabel.textContent = `Field phi ${field.phi.toFixed(0)} deg`;
  }

  function notify() {
    updateLabels();
    onChange(value());
  }

  bMag.addEventListener('input', notify);
  bTheta.addEventListener('input', () => {
    bTheta.value = snapSliderValue(Number(bTheta.value), [0, 90, 180], 5, thetaSnap).toFixed(0);
    notify();
  });
  bPhi.addEventListener('input', () => {
    bPhi.value = snapSliderValue(Number(bPhi.value), [0, 90, 180, 270, 360], 5, phiSnap).toFixed(0);
    notify();
  });

  updateLabels();
  return { value, updateLabels };
}
