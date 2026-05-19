# Spinor Visualization

Minimal web demo to visualize two-component spinors as clocks and view basis direction in 3D.

How to run

- Open `index.html` in a browser (no build step required). For a local server, run e.g.: 

```powershell
python -m http.server 8000
```

then open http://localhost:8000

What is included

- `index.html` — demo page and controls
- `style.css` — basic layout
- `src/clock.js` — 2D clock component
- `src/basis3d.js` — Three.js arrow showing basis direction
- `src/operators.js` — spinor math (complex helpers, SU(2) rotations)
- `src/main.js` — app wiring, UI, time evolution (Larmor-like)

Next steps

- Improve numerical stability and normalization
- Add UI to add arbitrary basis angles and remove bases
- Add explicit basis-change operator controls (theta/phi inputs per basis)
- Add pausing, resetting, and speed multipliers
