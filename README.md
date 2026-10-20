# MRI-Physics

A work-in-progress quantum-based MRI physics simulator, starting with the behaviour of individual spin-½ particles in magnetic fields.

The goal is to build a simulation of MRI physics from the quantum behaviour of individual spins up to the collective dynamics of large spin populations.

## Current Implementation

The current interactive spinor visualization supports:

- Representing spin-½ states using complex probability amplitudes
- Visualizing spinor components as [Feynman-inspired "clocks"](https://commons.wikimedia.org/wiki/File:Feynmans_QED_probability_amplitudes.gif) in different measurement bases
- Changing bases and observing how the same quantum state is represented + the calculations to do so
- Simulating time evolution under a magnetic field of arbitrary direction and magnitude
- Visualizing spin expectation values and magnetic precession in 3D

## Running the Visualization

From the repository root:

```
cd spinor-visualization
python -m http.server 8000
```

Open `http://localhost:8000` in your browser.

## Stuff that led to this

https://www.desmos.com/calculator/amuxrllcem

https://github.com/gr812b/spinor-visualization
