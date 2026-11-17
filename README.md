# MRI-Physics

A work-in-progress quantum-first MRI simulator, starting with individual spin-half particles in magnetic fields and building toward collective behavior in spin populations.

Complex probability amplitudes are the primary state. Operators evolve those amplitudes, probabilities come from squared magnitudes, and ensemble quantities are derived from quantum states and explicit physical models.

## Current functionality

- Represent spin-half states using complex probability amplitudes.
- Display magnitude and phase as [Feynman-inspired amplitude clocks](https://commons.wikimedia.org/wiki/File:Feynmans_QED_probability_amplitudes.gif) in multiple bases.
- Change the displayed basis and inspect the corresponding amplitude calculations.
- Evolve spinors under magnetic fields through explicit Hamiltonians and propagators.
- Derive spin expectations for a secondary 3D visualization.
- Run independent spinors headlessly with a simulation-owned clock.

The viewer consumes snapshots; it does not own scientific time or drive evolution through Bloch vectors. See [ARCHITECTURE.md](spinor-visualization/ARCHITECTURE.md) for module boundaries, units, state invariants, timing, limitations and extension plans.

## Run the visualization

From the repository root, with Python installed:

```sh
cd spinor-visualization
python -m http.server 8000
```

Open http://localhost:8000. The viewer uses Three.js from a CDN, so its 3D display requires network access.

## Run tests or a headless example

With Node.js installed (CI uses Node 22), run from the repository root:

```sh
cd spinor-visualization
npm test
node examples/headless.js
```

No npm install step is required. Tests use Node built-ins. The public engine entry point is `spinor-visualization/src/engine/index.js`.

[GitHub Actions](.github/workflows/tests.yml) runs all discovered tests and the headless example on pushes and pull requests, and supports manual runs. The checks cover physics, state validity, simulation timing and controller behavior; they do not automate browser interactions or visual checks.

## Project layout

- `spinor-visualization/src/engine/`: reusable math, quantum physics, operators and simulation.
- `spinor-visualization/src/application/`: commands, playback pacing and snapshot delivery.
- `spinor-visualization/src/view/`: amplitude clocks, controls and derived 3D presentation.
- `spinor-visualization/test/`: engine and application tests.
- `spinor-visualization/examples/`: headless usage examples.

`spinor-visualization/package.json` enables ES modules for Node, defines `npm test`, and prevents accidental npm publication. It adds no dependencies, bundler or browser build step; there is currently no dependency lockfile.

Viewer styling lives in `spinor-visualization/style.css`. Plain CSS keeps the viewer directly runnable. Shared styles can use CSS custom properties; SCSS can be reconsidered if reusable mixins or generated styling justify a compiler.

## Stuff that preceded this

- [Desmos exploration](https://www.desmos.com/calculator/amuxrllcem)
- [Original spinor visualization](https://github.com/gr812b/spinor-visualization)
