# Spec: Water Tank Problem

## Objective

Given `n` always greater than `-1`, representing the block height, compute the
units of water stored in-between the blocks. Build a Web Application (Frontend
Solution) using Vanilla JavaScript and HTML/CSS to represent the solution.

The page takes an array of block heights, computes the trapped water, and
generates an SVG shape for the result, as the problem statement's hint prefers.

### Example (from the problem statement)

```
Input:  [0,4,0,0,0,6,0,6,4,0]
Output: 18 Units
```

Two diagrams are shown, matching the two figures in the statement:

1. **Input diagram** — blocks in yellow, trapped water in blue, drawn on a grid.
2. **Output diagram** — the trapped water alone in blue, on the same grid.

The total is printed as `Output: 18 Units`.

## Scope

Exactly what the statement asks for, and nothing beyond it:

- An input for the array of block heights.
- The computed water total, labelled in units.
- The two SVG diagrams described above.

No presets, no animation, no extra modes.

## Tech Stack

Vanilla JavaScript, HTML, CSS. No framework, no build step, no dependencies.
Rendering is inline SVG, which the statement names as preferred over a table
view.

Scripts are plain `<script>` tags rather than ES modules, so that `index.html`
opens directly from disk without a server. Each file is an IIFE attaching to a
single `WaterTank` namespace on `globalThis`, so the DOM-free algorithm tests
also run under plain Node while the renderer tests run in a browser.

## Commands

```
Run the app:   open index.html
Run the tests: open tests/index.html
```

No install and no build.

## Project Structure

```
index.html               → Application page
styles.css               → Styling
src/water-tank.js        → Algorithm: per-column water levels and total
src/renderer.js          → Builds the SVG diagrams
src/app.js               → Input parsing and DOM wiring
tests/index.html         → Test runner page
tests/harness.js         → Dependency-free assertion harness
tests/water-tank.test.js → Algorithm tests
tests/renderer.test.js   → Renderer tests
SPEC.md                  → This document
README.md                → Problem statement, approach, how to run
```

`src/water-tank.js` touches no DOM, so it is tested in isolation.

## Code Style

Two-space indent, semicolons, single quotes. `var` is used inside the IIFEs so
the files run unchanged in any environment without a transpiler. Comments
explain why, not what.

```js
(function (root) {
  'use strict';

  var WaterTank = root.WaterTank || (root.WaterTank = {});

  // Water above column i is min(maxLeft, maxRight) - height[i], floored at 0.
  function computeWaterLevels(heights) {
    var levels = new Array(heights.length).fill(0);
    var left = 0;
    var right = heights.length - 1;
    var maxLeft = 0;
    var maxRight = 0;

    while (left < right) {
      if (heights[left] < heights[right]) {
        maxLeft = Math.max(maxLeft, heights[left]);
        levels[left] = maxLeft - heights[left];
        left += 1;
      } else {
        maxRight = Math.max(maxRight, heights[right]);
        levels[right] = maxRight - heights[right];
        right -= 1;
      }
    }

    return levels;
  }

  WaterTank.computeWaterLevels = computeWaterLevels;
})(typeof globalThis !== 'undefined' ? globalThis : this);
```

## Testing Strategy

A dependency-free assertion harness with a browser runner page, honouring the
vanilla constraint. Tests are written before the implementation
(red-green-refactor).

| Case | Input | Expected total |
|---|---|---|
| Statement example | `[0,4,0,0,0,6,0,6,4,0]` | 18 |
| Empty | `[]` | 0 |
| Single column | `[5]` | 0 |
| Two columns | `[5,5]` | 0 |
| Increasing | `[1,2,3,4]` | 0 |
| Decreasing | `[4,3,2,1]` | 0 |
| Simple valley | `[3,0,3]` | 3 |
| All zeroes | `[0,0,0]` | 0 |
| Wide floor | `[5,0,0,0,5]` | 15 |
| Nested valleys | `[4,2,0,3,2,5]` | 9 |

Per-column water levels are asserted as well as the total, because the diagrams
depend on the distribution and a correct total can hide a wrong one.

Parser tests cover whitespace, trailing commas, and rejection of values that are
not greater than `-1` or are not numbers.

Renderer tests assert the SVG structure: a block rect per non-zero height, a
water rect per non-zero water level, correct geometry and fill colours.

## Visual Design

Colours and layout follow the statement's figures.

| Token | Value | Use |
|---|---|---|
| Block | `#FFE600` | Block columns |
| Water | `#1FA6E8` | Trapped water |
| Grid | `#000000`, 1px | Cell borders |
| Background | `#FFFFFF` | Grid interior |

The grid is `heights.length` columns wide by `max(heights) + 2` rows tall — two
blank rows of headroom above the tallest column, matching the figures. Cells are
square. The SVG uses a `viewBox` and no fixed pixel size, so it scales to its
container.

Input is capped at 500 columns and a height of 500. The grid draws one cell per
unit of height, so an unbounded input would lock up the browser.

## Boundaries

**Always:**
- Keep `src/water-tank.js` free of DOM access.
- Write the failing test before the implementation.
- Validate input before it reaches the renderer: every value must be a number
  greater than `-1`.
- Build SVG with `document.createElementNS`, never `innerHTML` with user input.

**Ask first:**
- Any addition not named in the problem statement.
- Any dependency, build step, or package manager.
- Any change to the colour palette.

**Never:**
- Introduce a framework or bundler.
- Use `innerHTML` with unescaped user input.
- Delete or skip a failing test to make the suite green.

## Success Criteria

- [x] `[0,4,0,0,0,6,0,6,4,0]` reports `Output: 18 Units`.
- [x] Both diagrams render and match the statement's figures.
- [x] All tests pass in `tests/index.html`.
- [x] Input not greater than `-1`, or non-numeric, shows an inline error.
- [x] `index.html` works when opened directly from disk.
- [x] Zero dependencies; no `package.json`, no `node_modules`.
- [x] Code and snippets are committed to the Git repository.

## Open Questions

None.
