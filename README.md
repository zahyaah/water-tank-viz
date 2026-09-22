# Water Tank Problem

Given `n` always greater than `-1`, representing the block height, compute the
units of water stored in-between the blocks.

This is a frontend-only web application built with **vanilla JavaScript and
HTML/CSS** — no framework, no build step, and no dependencies. The solution is
drawn as an SVG shape, which the problem statement names as the preferred
output.

### Example

```
Input:  [0,4,0,0,0,6,0,6,4,0]
Output: 18 Units
```

The page renders two figures for any input:

1. **Input** — the blocks in yellow with the trapped water in blue, on a grid.
2. **Output** — the trapped water alone, on the same grid, above the total.

## Running it

No install and no build are required.

```bash
open index.html        # or just double-click the file
```

Scripts are loaded with plain `<script>` tags rather than ES modules,
specifically so the page works when opened straight from disk. If you prefer to
serve it:

```bash
python3 -m http.server 8000     # then visit http://localhost:8000
```

## Running the tests

```bash
open tests/index.html
```

The runner page executes 39 tests and prints a pass/fail line for each, with a
summary at the top. The harness in `tests/harness.js` is hand-written and
dependency-free, to keep the project within the vanilla-JavaScript constraint.

## Approach

Water above a column is bounded by the tallest block to its left and the tallest
block to its right. It can hold water up to the lower of those two walls:

```
water[i] = max(0, min(maxLeft[i], maxRight[i]) - height[i])
```

The naive version scans left and right for every column, which is O(n²). This
implementation uses the **two-pointer** technique instead and settles every
column in a single pass.

The insight is that whichever pointer currently sits on the *shorter* column is
the one whose side bounds the water. If `height[left] < height[right]`, then a
wall at least as tall as `height[left]` is known to exist on the right, so
`maxLeft` alone determines the water above `left` — the exact value of
`maxRight` cannot change the answer. That column can be finalised immediately
and the pointer advanced.

**Complexity:** O(n) time, O(n) space for the returned array of levels. The
levels array is needed anyway, because the diagram draws water per column rather
than just reporting a total.

### The algorithm

```js
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
```

For the worked example this returns:

```js
computeWaterLevels([0, 4, 0, 0, 0, 6, 0, 6, 4, 0]);
// [0, 0, 4, 4, 4, 0, 6, 0, 0, 0]  →  sum = 18
```

### Drawing the figures

Both figures share one grid and one set of geometry, so the columns line up
between them. The only difference is whether the block rects are drawn:

```js
var levels = WaterTank.computeWaterLevels(heights);

showOnly(inputFigure,  WaterTank.renderDiagram(heights, levels));
showOnly(outputFigure, WaterTank.renderDiagram(heights, levels, { showBlocks: false }));
```

Inside the renderer, each column contributes at most two rects. A block sits on
the floor; its water stacks directly on top of it:

```js
svg.appendChild(element('rect', {
  'data-role': 'block',
  'x': index * CELL,
  'y': (rows - height) * CELL,
  'width': CELL,
  'height': height * CELL,
  'fill': COLORS.block
}));

svg.appendChild(element('rect', {
  'data-role': 'water',
  'x': index * CELL,
  'y': (rows - height - level) * CELL,
  'width': CELL,
  'height': level * CELL,
  'fill': COLORS.water
}));
```

The SVG carries a `viewBox` and no fixed pixel size, so one set of integer
coordinates scales to any container width without recomputing geometry.

### Input handling

`parseHeights` accepts a comma-separated list, tolerating surrounding brackets,
whitespace, and a single trailing comma. Every value must match `/^\d+$/`, which
enforces the "greater than `-1`" requirement and rejects decimals and stray text
in one rule. Heights and column counts are capped at 500, because the grid draws
one cell per unit of height and an unbounded input would lock up the browser.

Invalid input shows an inline message and leaves the previous figures on screen,
so the page does not blank out mid-edit.

## Project structure

```
index.html                 Application page
styles.css                 Styling
src/water-tank.js          Algorithm and input parsing (no DOM access)
src/renderer.js            Builds the SVG figures
src/app.js                 DOM wiring
tests/index.html           Test runner page
tests/harness.js           Dependency-free assertion harness
tests/water-tank.test.js   Algorithm and parser tests
tests/renderer.test.js     Renderer tests
SPEC.md                    Specification
```

`src/water-tank.js` holds no DOM references, so the algorithm is tested in
isolation from the rendering.

## Test coverage

| Case | Input | Expected |
|---|---|---|
| Statement example | `[0,4,0,0,0,6,0,6,4,0]` | 18 |
| Empty | `[]` | 0 |
| Single column | `[5]` | 0 |
| Two columns | `[5,5]` | 0 |
| Increasing slope | `[1,2,3,4]` | 0 |
| Decreasing slope | `[4,3,2,1]` | 0 |
| Simple valley | `[3,0,3]` | 3 |
| Flat ground | `[0,0,0]` | 0 |
| Wide floor | `[5,0,0,0,5]` | 15 |
| Nested valleys | `[4,2,0,3,2,5]` | 9 |
| Classic twelve-column case | `[0,1,0,2,1,0,1,3,2,1,2,1]` | 6 |

Per-column water levels are asserted alongside the totals, since the figures
depend on the distribution and a correct total can hide a wrong one. The parser
and renderer have their own suites covering whitespace and bracket tolerance,
rejection of invalid values, rect counts, geometry, fill colours, and the
water-only view.
