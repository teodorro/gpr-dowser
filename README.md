# GPR Dowser

A browser-based processing and interpretation tool for **Ground-Penetrating Radar (GPR)** data,
specialised in **Common Mid-Point (CMP) velocity analysis**.

The application is built primarily for the **"Loza" GPR** family. Loza radars trigger the receiver
on the arrival of the direct wave from the transmitter, so the recorded traces are aligned to that
first arrival rather than to a fixed zero time. This makes the raw radargrams look somewhat
non-standard compared with conventional GPR data, and the CMP moveout math is corrected for it
(see [Loza-specific moveout](#loza-specific-moveout) below).

> **Live demo:** https://teodorro.github.io/gpr-dowser/
> The app loads a bundled Loza example file on start, so you can try it without your own data.

---

## What it does

GPR Dowser takes a radargram (B-scan), lets you clean it up with a stack of signal-processing
steps, and — for CMP soundings — estimates a layered velocity/depth model by picking maxima on a
**semblance** velocity spectrum.

### Highlights

- **CMP velocity analysis** — semblance spectrum (Neidell & Taner, 1971) computed over a
  velocity × time grid, interactive hodograph overlay on the radargram, layer picking, and a
  layer table with interval velocities via the **Dix formula** (velocity, permittivity,
  thickness and total thickness per layer).
- **Loza-aware moveout** — the CMP travel-time curve accounts for the receiver being triggered by
  the direct arrival, so hodographs and semblance line up with real Loza data.
- **Signal processing pipeline** with full **undo/redo**:
  - Dewow (moving-mean detrending)
  - Subtract mean / subtract median trace
  - Savitzky–Golay smoothing (2-D: horizontal + vertical)
  - Gaussian smoothing
  - Align signal to a chosen amplitude breakpoint
  - Zero out the first _N_ left traces
  - Split a radargram into two at a chosen position
- **Non-destructive editing** — processing is stored as a _sequence of operations_ and replayed
  from the original data, so undo/redo never loses precision and never mutates the source.
- **Interactive B-scan canvas** — GPU-friendly rendering with `ImageBitmap`, HiDPI-aware,
  cursor-anchored zoom, smooth panning, and a single-trace (A-scan) inspector.
- **Multiple files** in tabs, each with its own independent processing history.
- **Units & physics** — configurable time step (ns), spatial step (m), velocity (m/ns) and
  permittivity, with depth axes derived from them.
- **8 colour palettes** (Greys, Viridis, Turbo, Spectral, Magma, Cubehelix, Sinebow, Rainbow),
  adjustable transparency, and light/dark themes.
- **Bilingual UI** — English and Russian (i18next).

---

## Supported file formats

| Extension | Source           | Notes                                                     |
| --------- | ---------------- | --------------------------------------------------------- |
| `.gem`    | Loza radar       | Proprietary binary format, parsed directly in the browser |
| `.geo`    | Loza radar       | Binary format                                             |
| `.txt`    | "Krot" text dump | Plain-text radargram export                               |

Data is parsed entirely client-side — nothing is uploaded to a server.

---

## Loza-specific moveout

For a conventional CMP sounding the two-way travel time along a reflection hyperbola is

```
t(x) = (1 / v) · √( (2·h)² + x² )
```

where `x` is the transmitter–receiver offset, `h` the reflector depth and `v` the RMS velocity.

Because a Loza receiver starts recording when the **direct air/ground wave** from the transmitter
arrives, every trace is already shifted by the direct-wave travel time. GPR Dowser corrects the
moveout curve accordingly:

```
t_loza(x) = (1 / v) · √( (2·h)² + x² )  −  x / c
```

where `c` is the speed of light in free space. This correction is applied consistently when
drawing hodographs and when computing the semblance spectrum, so picks made on the semblance map
correspond to physically meaningful velocities.

---

## Tech stack

- **React 19** + **TypeScript** + **Vite**
- **Zustand** for state (per-file store slices; command-replay undo/redo)
- **Canvas 2D** + **d3** for radargram rendering and colour maps
- **ECharts** for the CMP semblance plot
- **Radix UI** / shadcn components, **Tailwind CSS v4**
- **i18next** for localisation
- **Vitest** + Testing Library for tests
- CI/CD to **GitHub Pages** via GitHub Actions

---

## Getting started

```bash
npm install
npm run dev
```

Then open the URL printed by Vite (default http://localhost:5173).

### Scripts

| Command             | Description                          |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Start the dev server with HMR        |
| `npm run build`     | Type-check and build for production  |
| `npm run preview`   | Preview the production build locally |
| `npm run test`      | Run the test suite (Vitest)          |
| `npm run test:ui`   | Run tests with the Vitest UI         |
| `npm run lint`      | Lint the source                      |
| `npm run typecheck` | Type-check without emitting          |

---

## How to use

1. **Open a file** via _File → Open File_ (`.gem`, `.geo`, `.txt`), or use the example loaded on start.
2. **Set units** (time step, spatial step, velocity/permittivity) in the sidebar so depth axes are correct.
3. **Process** the radargram from the _Processing_ panel — dewow, subtract average, smoothing, etc.
   Every step is added to the history and can be undone/redone.
4. **Enable CMP mode** to compute the semblance spectrum. Hodographs are overlaid on the radargram.
5. **Pick layers** on the semblance map; the layer table shows RMS/interval velocity, permittivity
   and thickness per layer (Dix inversion).

---

## Roadmap / ideas

Planned and welcome contributions, in rough priority order:

1. **Export of SVG chart images** - export the image you see on a chart. In fact there's
   not a single chart but layers, so it should be put into one image somehow to be used in publications
2. **Support for non-Loza GPR data** — generalise the parsers and moveout so conventional
   (fixed zero-time) radars are handled alongside Loza.
3. **Hyperbola fitting** — interactive diffraction-hyperbola tool to estimate velocity from
   local point objects on a profile, as an alternative to CMP.
4. **Gain correction** — time-varying gain (AGC / user-defined gain curves) to compensate for
   signal attenuation with depth.

---

## Project layout

```
src/
  features/          UI features (b-scan, a-scan, cmp, sidebar, menus, ...)
  file-parsers/      .gem / .geo / .txt readers
  shared/            Grid2D data structure, GPR math, helpers
  stores/            Zustand slices (data, unit, visual, cmp, undo/redo)
  visual/            palettes, clamping, colour LUTs
public/
  data-examples/     bundled Loza sample files
```

---

## License

MIT
