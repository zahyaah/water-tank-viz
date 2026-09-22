(function (root) {
  'use strict';

  var describe = root.Harness.describe;
  var test = root.Harness.test;
  var assertEqual = root.Harness.assertEqual;
  var WaterTank = root.WaterTank;

  var CELL = WaterTank.CELL;

  function rectsOfRole(svg, role) {
    return Array.prototype.slice.call(svg.querySelectorAll('[data-role="' + role + '"]'));
  }

  describe('renderDiagram', function () {
    test('returns an svg element', function () {
      var svg = WaterTank.renderDiagram([3, 0, 3], [0, 3, 0]);
      assertEqual(svg.tagName.toLowerCase(), 'svg');
    });

    test('sizes the grid to the columns and the tallest block plus headroom', function () {
      var svg = WaterTank.renderDiagram([3, 0, 3], [0, 3, 0]);
      var rows = 3 + WaterTank.HEADROOM_ROWS;
      assertEqual(svg.getAttribute('viewBox'), '0 0 ' + 3 * CELL + ' ' + rows * CELL);
    });

    test('draws one block rect per non-zero height', function () {
      var svg = WaterTank.renderDiagram([0, 4, 0, 0, 0, 6, 0, 6, 4, 0], [0, 0, 4, 4, 4, 0, 6, 0, 0, 0]);
      assertEqual(rectsOfRole(svg, 'block').length, 4);
    });

    test('draws one water rect per non-zero water level', function () {
      var svg = WaterTank.renderDiagram([0, 4, 0, 0, 0, 6, 0, 6, 4, 0], [0, 0, 4, 4, 4, 0, 6, 0, 0, 0]);
      assertEqual(rectsOfRole(svg, 'water').length, 4);
    });

    test('places a block rect on the floor of its column', function () {
      var svg = WaterTank.renderDiagram([3, 0, 3], [0, 3, 0]);
      var block = rectsOfRole(svg, 'block')[0];
      var rows = 3 + WaterTank.HEADROOM_ROWS;

      assertEqual(block.getAttribute('x'), String(0));
      assertEqual(block.getAttribute('width'), String(CELL));
      assertEqual(block.getAttribute('height'), String(3 * CELL));
      assertEqual(block.getAttribute('y'), String((rows - 3) * CELL));
    });

    test('stacks a water rect directly on top of its block', function () {
      var svg = WaterTank.renderDiagram([3, 0, 3], [0, 3, 0]);
      var water = rectsOfRole(svg, 'water')[0];
      var rows = 3 + WaterTank.HEADROOM_ROWS;

      assertEqual(water.getAttribute('x'), String(CELL));
      assertEqual(water.getAttribute('height'), String(3 * CELL));
      assertEqual(water.getAttribute('y'), String((rows - 0 - 3) * CELL));
    });

    test('fills blocks yellow and water blue', function () {
      var svg = WaterTank.renderDiagram([3, 0, 3], [0, 3, 0]);
      assertEqual(rectsOfRole(svg, 'block')[0].getAttribute('fill'), WaterTank.COLORS.block);
      assertEqual(rectsOfRole(svg, 'water')[0].getAttribute('fill'), WaterTank.COLORS.water);
    });

    test('omits blocks but keeps water when showBlocks is false', function () {
      var svg = WaterTank.renderDiagram([3, 0, 3], [0, 3, 0], { showBlocks: false });
      assertEqual(rectsOfRole(svg, 'block').length, 0);
      assertEqual(rectsOfRole(svg, 'water').length, 1);
    });

    test('keeps the same geometry in both views, so the figures line up', function () {
      var withBlocks = WaterTank.renderDiagram([3, 0, 3], [0, 3, 0]);
      var waterOnly = WaterTank.renderDiagram([3, 0, 3], [0, 3, 0], { showBlocks: false });
      assertEqual(waterOnly.getAttribute('viewBox'), withBlocks.getAttribute('viewBox'));
    });

    test('draws no rects when there are no blocks', function () {
      var svg = WaterTank.renderDiagram([], []);
      assertEqual(rectsOfRole(svg, 'block').length, 0);
      assertEqual(rectsOfRole(svg, 'water').length, 0);
    });

    test('still produces a valid viewBox when there are no blocks', function () {
      var svg = WaterTank.renderDiagram([], []);
      assertEqual(svg.getAttribute('viewBox'), '0 0 ' + CELL + ' ' + WaterTank.HEADROOM_ROWS * CELL);
    });

    test('draws a grid line for every column and row boundary', function () {
      var svg = WaterTank.renderDiagram([3, 0, 3], [0, 3, 0]);
      var rows = 3 + WaterTank.HEADROOM_ROWS;
      var grid = svg.querySelector('[data-role="grid"]');
      var segments = grid.getAttribute('d').match(/M/g).length;

      assertEqual(segments, 3 + 1 + rows + 1);
    });
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
