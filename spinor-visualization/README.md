# Spinor Visualization

## Physics engine

The visual-free simulation engine lives in `src/engine/`:

- `engine/math/` contains complex arithmetic and vector/coordinate transforms.
- `engine/physics/spinor.js` contains the single stateful spin object.
- `engine/physics/measurement.js`, `precession.js`, and `magnetic-field.js`
  contain stateless calculations.
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
