import { magneticFieldAt } from './magnetic-field.js';
import { spinExpectation } from './measurement.js';
import { precessSpinor } from './precession.js';
import { Population } from './population.js';

export function stepPopulation(
  population,
  time,
  deltaTime,
  fieldConfig = {},
  gyromagneticRatio = 1
) {
  const nextSpinors = population.spinors.map((spinor, index) => {
    const field = magneticFieldAt({
      ...fieldConfig,
      coordinate: population.coordinates[index],
      time,
    });
    const components = precessSpinor(
      spinor.components,
      field,
      deltaTime,
      gyromagneticRatio
    );
    return spinor.clone().setComponents(components);
  });

  return new Population(nextSpinors, population.coordinates);
}

export function populationExpectation(population) {
  if (population.spinors.length === 0) {
    return { x: 0, y: 0, z: 0 };
  }

  const total = population.spinors.reduce((sum, spinor) => {
    const expectation = spinExpectation(spinor.components);
    return {
      x: sum.x + expectation.x,
      y: sum.y + expectation.y,
      z: sum.z + expectation.z,
    };
  }, { x: 0, y: 0, z: 0 });

  return {
    x: total.x / population.spinors.length,
    y: total.y / population.spinors.length,
    z: total.z / population.spinors.length,
  };
}
