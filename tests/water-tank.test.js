(function (root) {
  'use strict';

  var describe = root.Harness.describe;
  var test = root.Harness.test;
  var assertEqual = root.Harness.assertEqual;
  var assertDeepEqual = root.Harness.assertDeepEqual;
  var assertThrows = root.Harness.assertThrows;
  var WaterTank = root.WaterTank;

  describe('computeWaterLevels', function () {
    test('solves the example from the problem statement', function () {
      var levels = WaterTank.computeWaterLevels([0, 4, 0, 0, 0, 6, 0, 6, 4, 0]);
      assertDeepEqual(levels, [0, 0, 4, 4, 4, 0, 6, 0, 0, 0]);
    });

    test('returns an empty array for no blocks', function () {
      assertDeepEqual(WaterTank.computeWaterLevels([]), []);
    });

    test('holds no water with a single column', function () {
      assertDeepEqual(WaterTank.computeWaterLevels([5]), [0]);
    });

    test('holds no water between two equal columns', function () {
      assertDeepEqual(WaterTank.computeWaterLevels([5, 5]), [0, 0]);
    });

    test('holds no water on an increasing slope', function () {
      assertDeepEqual(WaterTank.computeWaterLevels([1, 2, 3, 4]), [0, 0, 0, 0]);
    });

    test('holds no water on a decreasing slope', function () {
      assertDeepEqual(WaterTank.computeWaterLevels([4, 3, 2, 1]), [0, 0, 0, 0]);
    });

    test('fills a simple valley to the height of its walls', function () {
      assertDeepEqual(WaterTank.computeWaterLevels([3, 0, 3]), [0, 3, 0]);
    });

    test('holds no water when every column is flat ground', function () {
      assertDeepEqual(WaterTank.computeWaterLevels([0, 0, 0]), [0, 0, 0]);
    });

    test('fills a wide flat floor across its whole width', function () {
      assertDeepEqual(WaterTank.computeWaterLevels([5, 0, 0, 0, 5]), [0, 5, 5, 5, 0]);
    });

    test('fills nested valleys to their own containing walls', function () {
      assertDeepEqual(WaterTank.computeWaterLevels([4, 2, 0, 3, 2, 5]), [0, 2, 4, 1, 2, 0]);
    });

    test('does not modify the input array', function () {
      var heights = [3, 0, 3];
      WaterTank.computeWaterLevels(heights);
      assertDeepEqual(heights, [3, 0, 3]);
    });
  });

  describe('computeTotalWater', function () {
    test('reports 18 units for the problem statement example', function () {
      assertEqual(WaterTank.computeTotalWater([0, 4, 0, 0, 0, 6, 0, 6, 4, 0]), 18);
    });

    test('reports 0 units for no blocks', function () {
      assertEqual(WaterTank.computeTotalWater([]), 0);
    });

    test('reports 15 units for a wide flat floor', function () {
      assertEqual(WaterTank.computeTotalWater([5, 0, 0, 0, 5]), 15);
    });

    test('reports 9 units for nested valleys', function () {
      assertEqual(WaterTank.computeTotalWater([4, 2, 0, 3, 2, 5]), 9);
    });

    test('reports 6 units for the classic twelve-column case', function () {
      assertEqual(WaterTank.computeTotalWater([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]), 6);
    });
  });

  describe('parseHeights', function () {
    test('reads a plain comma-separated list', function () {
      assertDeepEqual(WaterTank.parseHeights('0,4,0,0,0,6,0,6,4,0'), [0, 4, 0, 0, 0, 6, 0, 6, 4, 0]);
    });

    test('ignores whitespace around values', function () {
      assertDeepEqual(WaterTank.parseHeights('  3 ,  0 ,3  '), [3, 0, 3]);
    });

    test('accepts the list wrapped in square brackets', function () {
      assertDeepEqual(WaterTank.parseHeights('[3,0,3]'), [3, 0, 3]);
    });

    test('tolerates a trailing comma', function () {
      assertDeepEqual(WaterTank.parseHeights('3,0,3,'), [3, 0, 3]);
    });

    test('returns an empty array for empty input', function () {
      assertDeepEqual(WaterTank.parseHeights('   '), []);
    });

    test('rejects a negative height, since n must be greater than -1', function () {
      assertThrows(function () {
        WaterTank.parseHeights('3,-1,3');
      }, '"-1" is not a valid block height');
    });

    test('rejects a decimal height', function () {
      assertThrows(function () {
        WaterTank.parseHeights('3,1.5,3');
      }, '"1.5" is not a valid block height');
    });

    test('rejects non-numeric text', function () {
      assertThrows(function () {
        WaterTank.parseHeights('3,abc,3');
      }, '"abc" is not a valid block height');
    });

    test('rejects a missing value between two commas', function () {
      assertThrows(function () {
        WaterTank.parseHeights('3,,3');
      }, 'is not a valid block height');
    });

    test('rejects a height beyond the drawable limit', function () {
      assertThrows(function () {
        WaterTank.parseHeights('1,100000,1');
      }, 'Block heights must be 500 or less');
    });

    test('rejects more columns than can be drawn', function () {
      var tooMany = new Array(501).join('1,') + '1';
      assertThrows(function () {
        WaterTank.parseHeights(tooMany);
      }, 'Enter 500 blocks or fewer');
    });
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
