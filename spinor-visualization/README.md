# Spinor Visualization

## Physics engine

The visualizer imports a compatibility facade from `src/physics/`, while the
visual-free simulation engine lives in `src/engine/`:

- `engine/math/` contains complex arithmetic and vector/coordinate transforms.
- `engine/physics/spinor.js` and `population.js` contain stateful simulation
  objects.
- `engine/physics/measurement.js`, `precession.js`, `magnetic-field.js`, and
  `boltzmann.js` contain stateless calculations.
- `engine/index.js` is the public engine entry point.

The engine accepts plain numbers and vectors and has no DOM, canvas, or UI
dependencies.

## Run

1. Open a terminal in this folder:

```powershell
cd spinor-visualization
```

2. Start a local server:

```powershell
python -m http.server 8000
```

3. Open this in a browser:

```text
http://localhost:8000
```
