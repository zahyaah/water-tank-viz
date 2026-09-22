/**
 * Water Tank Problem — SVG renderer.
 *
 * Builds the two figures from the problem statement. Both share the same grid
 * and geometry; the water-only figure simply omits the block rects, so the two
 * diagrams line up column for column.
 */
(function (root) {
  'use strict';

  var WaterTank = root.WaterTank || (root.WaterTank = {});

  var SVG_NS = 'http://www.w3.org/2000/svg';

  // One grid cell in viewBox units. The SVG scales to its container, so this is
  // a drawing unit rather than a pixel size.
  var CELL = 40;

  // Blank rows above the tallest block, matching the headroom in the figures.
  var HEADROOM_ROWS = 2;

  var COLORS = {
    block: '#FFE600',
    water: '#1FA6E8',
    grid: '#000000'
  };

  function element(name, attributes) {
    var node = document.createElementNS(SVG_NS, name);
    Object.keys(attributes).forEach(function (key) {
      node.setAttribute(key, attributes[key]);
    });
    return node;
  }

  function gridPath(columns, rows) {
    var segments = [];
    var width = columns * CELL;
    var height = rows * CELL;
    var i;

    for (i = 0; i <= columns; i += 1) {
      segments.push('M' + i * CELL + ' 0V' + height);
    }
    for (i = 0; i <= rows; i += 1) {
      segments.push('M0 ' + i * CELL + 'H' + width);
    }

    return element('path', {
      'd': segments.join(''),
      'data-role': 'grid',
      'fill': 'none',
      'stroke': COLORS.grid,
      'stroke-width': 1,
      'shape-rendering': 'crispEdges'
    });
  }

  /**
   * Build the diagram for a set of block heights and their water levels.
   *
   * options.showBlocks — draw the yellow block columns (default true). Set it
   * to false for the water-only output figure.
   */
  function renderDiagram(heights, levels, options) {
    var settings = options || {};
    var showBlocks = settings.showBlocks !== false;

    // An empty input still needs a drawable viewBox, so fall back to one column.
    var columns = Math.max(heights.length, 1);
    var tallest = heights.reduce(function (max, height) {
      return Math.max(max, height);
    }, 0);
    var rows = tallest + HEADROOM_ROWS;

    var svg = element('svg', {
      'viewBox': '0 0 ' + columns * CELL + ' ' + rows * CELL,
      'role': 'img',
      'preserveAspectRatio': 'xMidYMax meet'
    });

    var background = element('rect', {
      'x': 0,
      'y': 0,
      'width': columns * CELL,
      'height': rows * CELL,
      'fill': '#ffffff'
    });
    svg.appendChild(background);
    svg.appendChild(gridPath(columns, rows));

    heights.forEach(function (height, index) {
      var level = levels[index] || 0;

      if (showBlocks && height > 0) {
        svg.appendChild(element('rect', {
          'data-role': 'block',
          'x': index * CELL,
          'y': (rows - height) * CELL,
          'width': CELL,
          'height': height * CELL,
          'fill': COLORS.block
        }));
      }

      if (level > 0) {
        svg.appendChild(element('rect', {
          'data-role': 'water',
          'x': index * CELL,
          'y': (rows - height - level) * CELL,
          'width': CELL,
          'height': level * CELL,
          'fill': COLORS.water
        }));
      }
    });

    return svg;
  }

  WaterTank.renderDiagram = renderDiagram;
  WaterTank.CELL = CELL;
  WaterTank.HEADROOM_ROWS = HEADROOM_ROWS;
  WaterTank.COLORS = COLORS;
})(typeof globalThis !== 'undefined' ? globalThis : this);
