// Nuclear species parameters; gamma is signed and expressed in rad/s/T.

// Free-proton value, CODATA 2022; chemical shielding is not included.
// https://physics.nist.gov/cgi-bin/cuu/Value?gammap
export const HYDROGEN_1 = Object.freeze({
  id: '1H',
  name: 'Hydrogen-1',
  spin: 0.5,
  gyromagneticRatio: 2.6752218708e8,
});

export const DEFAULT_SPECIES = HYDROGEN_1;

export function validateSpecies(species) {
  if (!species || species.spin !== 0.5) {
    throw new RangeError('the two-component engine requires a spin-half species');
  }
  if (!Number.isFinite(species.gyromagneticRatio)) {
    throw new TypeError('species requires a finite gyromagneticRatio in rad/s/T');
  }
  return species;
}
