# Quantum-first spinor simulation

## Foundation

Each spinor stores two complex probability amplitudes, $\alpha$ and $\beta$:

$$
|\psi\rangle = \begin{pmatrix} \alpha \\ \beta \end{pmatrix},
\qquad P_0 = |\alpha|^2, \quad P_1 = |\beta|^2,
\qquad |\alpha|^2 + |\beta|^2 = 1.
$$

Operators evolve these amplitudes directly; probabilities refer to the chosen basis. Phase is essential for interference and cannot be recovered from probabilities alone.

Amplitude clocks are the primary presentation of magnitude and phase. Changing the displayed basis transforms the representation without changing the underlying state. The current application focuses on a single spinor; ensemble simulation is future work.

Unitary evolution is deterministic between measurements. The current measurement API samples Born-rule outcomes using an injectable random source; it does not collapse the state.

## Boundaries

The public headless entry point is `src/engine/index.js`. Dependencies flow from application to simulation to physics to math; physics functions can also be used directly.

| Location | Responsibility |
| --- | --- |
| `engine/math/` | Complex arithmetic, vectors, coordinates and matrix application. |
| `engine/physics/species.js` | Named species parameters and the hydrogen-1 default. |
| `engine/physics/state.js`, `spinor.js` | Amplitude construction, validation and encapsulated state. |
| `engine/physics/operators/` | Individual operators and interactions, plus shared Hamiltonian and propagation utilities. |
| `engine/physics/magnetic-field.js` | Field evaluation at a position and time. |
| `engine/physics/basis.js`, `observables.js`, `measurement.js` | Basis transformations, predicted quantities and sampled outcomes. |
| `engine/simulation/` | Spin state, position, interactions and scientific time. |
| `application/` | Commands, snapshot delivery and playback pacing. |
| `view/` | Amplitude clocks, controls and presentation from snapshots. |
| `main.js` | Browser wiring. |

The viewer receives detached snapshots through `render(snapshot)` and emits edit requests. It never owns a Simulation or advances scientific time. The current application controller configures a uniform magnetic field; the simulation supports general interaction callbacks.

## Operators and evolution

Each operator or physical interaction has its own module under `physics/operators/`. Magnetic coupling lives in `magnetic.js`. General operators use row-major complex $2 \times 2$ matrices. Applying one returns amplitudes without automatic normalization.

An interaction receives `{position, timeSeconds}` and returns coefficients `omega`, representing $\boldsymbol{\omega}$ in

$$
\frac{H}{\hbar} = \frac{1}{2}\boldsymbol{\omega}\cdot\boldsymbol{\sigma}.
$$

Each simulation step sums simultaneous Hamiltonian contributions and evolves the spinor:

$$
U(\Delta t) = \exp\!\left(-\frac{i H\Delta t}{\hbar}\right),
\qquad |\psi(t+\Delta t)\rangle = U(\Delta t)|\psi(t)\rangle.
$$
 The current Hamiltonian representation is traceless and single-spin.

Magnetic coupling follows

$$
H = -\boldsymbol{\mu}\cdot\mathbf B,
\qquad \boldsymbol{\mu} = \gamma\mathbf S,
\qquad \mathbf S = \frac{\hbar}{2}\boldsymbol{\sigma},
\qquad \boldsymbol{\omega} = -\gamma\mathbf B.
$$

The species parameter $\gamma$ is the signed gyromagnetic ratio in $\mathrm{rad\,s^{-1}\,T^{-1}}$. `physics/species.js` defaults to hydrogen-1 using the CODATA 2022 free-proton value

$$
\gamma_{\mathrm{^{1}H}} = 2.6752218708\times 10^8\;\mathrm{rad\,s^{-1}\,T^{-1}}.
$$

Chemical shielding is not yet modeled. The application accepts another spin-half species; magnetic functions also accept an explicit $\gamma$. Higher-spin nuclei need a larger state representation.

Fields use tesla, positions meters and gradients $\mathrm{T\,m^{-1}}$. The longitudinal MRI gradient approximation adds $\Delta B_z = \mathbf G\cdot\mathbf r$ to $B_z$. Core phases are radians; the existing basis-control API accepts degrees.

## Time and state contracts

- Simulation time is a safe integer count of microseconds. `step(count)` advances fixed steps; `stepUs` defaults to 1000 and can be set to 1.
- Fields are sampled at each step's midpoint. Constant-H propagation is analytical; varying fields need step-size convergence checks. Microsecond clock resolution does not guarantee physical accuracy.
- Browser timestamps only pace playback. Paused or hidden time is excluded, fractional step budget is retained, and scientific steps are not skipped.
- Spinor amplitudes must be finite and normalized within $10^{-10}$. Inputs and getters are copied; normalization is explicit rather than silently applied during evolution.
- `reset()` restores constructor states and zero time while retaining current interactions. Snapshots are detached copies.
- All next states are prepared before a step commits. Interaction callbacks should be pure for reproducible runs.

Setup, tests and CI are documented in the [repository README](../README.md).

At $1\,\mathrm T$, hydrogen precesses at $f = \gamma |\mathbf B|/(2\pi) \approx 42.58\,\mathrm{MHz}$. Constant-field propagation evaluates endpoints analytically, but the current millisecond steps and browser frame rate cannot resolve these cycles visually. Time-varying laboratory-frame fields need finer steps or an explicit rotating-frame model; the viewer does not slow physics by changing $\gamma$.
