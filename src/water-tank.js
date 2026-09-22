/**
 * Water Tank Problem — algorithm and input parsing.
 *
 * This file holds no DOM references, so it can be unit tested in isolation.
 */
(function (root) {
  'use strict';

  var WaterTank = root.WaterTank || (root.WaterTank = {});

  // Drawing caps. A grid is one cell per column and per unit of height, so an
  // unbounded input would freeze the browser building the SVG.
  var MAX_BLOCKS = 500;
  var MAX_HEIGHT = 500;

  /**
   * Units of water resting on top of each column.
   *
   * Water above column i is min(tallest to its left, tallest to its right)
   * minus its own height. The two-pointer walk works because whichever side is
   * currently shorter is the side that bounds the water, so that column can be
   * settled immediately without knowing the far side's exact maximum.
   *
   * O(n) time, O(n) space for the returned array.
   */
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

  /** Total units of water stored between the blocks. */
  function computeTotalWater(heights) {
    return computeWaterLevels(heights).reduce(function (total, level) {
      return total + level;
    }, 0);
  }

  /**
   * Turn user text into an array of block heights.
   *
   * Throws an Error with a message suitable for display when the text is not a
   * comma-separated list of whole numbers greater than -1.
   */
  function parseHeights(text) {
    var body = String(text).trim();

    if (body.charAt(0) === '[' && body.charAt(body.length - 1) === ']') {
      body = body.slice(1, -1);
    }
    body = body.trim();

    if (body === '') {
      return [];
    }

    var tokens = body.split(',').map(function (token) {
      return token.trim();
    });

    // A single trailing comma is a natural way to type a list, so allow it.
    if (tokens.length > 1 && tokens[tokens.length - 1] === '') {
      tokens.pop();
    }

    if (tokens.length > MAX_BLOCKS) {
      throw new Error('Enter ' + MAX_BLOCKS + ' blocks or fewer.');
    }

    return tokens.map(function (token) {
      // Whole numbers only: this rejects negatives, decimals and stray text,
      // enforcing the requirement that every height is greater than -1.
      if (!/^\d+$/.test(token)) {
        throw new Error(
          '"' + token + '" is not a valid block height. ' +
          'Enter whole numbers greater than -1, separated by commas.'
        );
      }

      var height = Number(token);
      if (height > MAX_HEIGHT) {
        throw new Error('Block heights must be ' + MAX_HEIGHT + ' or less.');
      }

      return height;
    });
  }

  WaterTank.computeWaterLevels = computeWaterLevels;
  WaterTank.computeTotalWater = computeTotalWater;
  WaterTank.parseHeights = parseHeights;
  WaterTank.MAX_BLOCKS = MAX_BLOCKS;
  WaterTank.MAX_HEIGHT = MAX_HEIGHT;
})(typeof globalThis !== 'undefined' ? globalThis : this);
