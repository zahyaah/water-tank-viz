/**
 * Water Tank Problem — page wiring.
 *
 * Reads the block heights from the input, computes the trapped water, and
 * renders the two figures from the problem statement.
 */
(function (root) {
  'use strict';

  var WaterTank = root.WaterTank;

  var form = document.getElementById('heights-form');
  var input = document.getElementById('heights-input');
  var errorBox = document.getElementById('error');
  var inputCaption = document.getElementById('input-caption');
  var inputFigure = document.getElementById('input-figure');
  var outputCaption = document.getElementById('output-caption');
  var outputFigure = document.getElementById('output-figure');

  function showOnly(container, node) {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(node);
  }

  function totalOf(levels) {
    return levels.reduce(function (sum, level) {
      return sum + level;
    }, 0);
  }

  function update() {
    var heights;

    try {
      heights = WaterTank.parseHeights(input.value);
    } catch (error) {
      // Keep the previous figures on screen so the page does not go blank
      // while the user is still typing.
      errorBox.textContent = error.message;
      errorBox.hidden = false;
      input.setAttribute('aria-invalid', 'true');
      return;
    }

    errorBox.textContent = '';
    errorBox.hidden = true;
    input.removeAttribute('aria-invalid');

    var levels = WaterTank.computeWaterLevels(heights);
    var total = totalOf(levels);

    inputCaption.textContent = 'Input: [' + heights.join(',') + ']';
    outputCaption.textContent = 'Output: ' + total + (total === 1 ? ' Unit' : ' Units');

    showOnly(inputFigure, WaterTank.renderDiagram(heights, levels));
    showOnly(outputFigure, WaterTank.renderDiagram(heights, levels, { showBlocks: false }));
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    update();
  });

  update();
})(typeof globalThis !== 'undefined' ? globalThis : this);
