/**
 * Minimal zero-dependency test harness.
 *
 * The problem statement restricts the project to vanilla JavaScript, so the
 * suite cannot use a third-party runner. This harness runs unchanged in a
 * browser page and under plain Node, which lets the DOM-free algorithm tests
 * run headlessly while the renderer tests run in a real browser.
 */
(function (root) {
  'use strict';

  var Harness = root.Harness || (root.Harness = {});

  var suites = [];
  var currentSuite = null;

  function describe(name, body) {
    var previous = currentSuite;
    currentSuite = { name: name, tests: [] };
    suites.push(currentSuite);
    body();
    currentSuite = previous;
  }

  function test(name, body) {
    if (!currentSuite) {
      describe('General', function () {});
    }
    currentSuite.tests.push({ name: name, body: body });
  }

  function fail(message, expected, actual) {
    throw new Error(
      message + '\n    expected: ' + format(expected) + '\n    actual:   ' + format(actual)
    );
  }

  function format(value) {
    if (typeof value === 'string') return JSON.stringify(value);
    if (Array.isArray(value)) return '[' + value.join(', ') + ']';
    return String(value);
  }

  function assertEqual(actual, expected, message) {
    if (actual !== expected) {
      fail(message || 'Values are not equal', expected, actual);
    }
  }

  function assertDeepEqual(actual, expected, message) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      fail(message || 'Structures are not equal', expected, actual);
    }
  }

  /**
   * `expectedText` is required so that an incidental TypeError cannot satisfy a
   * test that is meant to assert a specific validation failure.
   */
  function assertThrows(body, expectedText, message) {
    var thrown = null;
    try {
      body();
    } catch (error) {
      thrown = error;
    }
    if (!thrown) {
      fail(message || 'Expected the call to throw', 'an Error', 'no error');
    }
    if (thrown.message.indexOf(expectedText) === -1) {
      fail(
        message || 'Thrown message does not contain the expected text',
        'a message containing ' + format(expectedText),
        thrown.message
      );
    }
  }

  function run() {
    var results = [];
    var passed = 0;
    var failed = 0;

    suites.forEach(function (suite) {
      suite.tests.forEach(function (unit) {
        var result = { suite: suite.name, name: unit.name, ok: true, error: null };
        try {
          unit.body();
          passed += 1;
        } catch (error) {
          result.ok = false;
          result.error = error.message;
          failed += 1;
        }
        results.push(result);
      });
    });

    return { passed: passed, failed: failed, results: results };
  }

  function reportToConsole(summary) {
    summary.results.forEach(function (result) {
      if (result.ok) {
        console.log('  PASS  ' + result.suite + ' › ' + result.name);
      } else {
        console.log('  FAIL  ' + result.suite + ' › ' + result.name);
        console.log('        ' + result.error.split('\n').join('\n        '));
      }
    });
    console.log('\n' + summary.passed + ' passed, ' + summary.failed + ' failed');
  }

  function reportToDocument(summary, mount) {
    var heading = document.createElement('p');
    heading.className = summary.failed === 0 ? 'summary pass' : 'summary fail';
    heading.textContent = summary.passed + ' passed, ' + summary.failed + ' failed';
    mount.appendChild(heading);

    var lastSuite = null;
    summary.results.forEach(function (result) {
      if (result.suite !== lastSuite) {
        var title = document.createElement('h2');
        title.textContent = result.suite;
        mount.appendChild(title);
        lastSuite = result.suite;
      }

      var row = document.createElement('div');
      row.className = result.ok ? 'case pass' : 'case fail';
      row.textContent = (result.ok ? 'PASS  ' : 'FAIL  ') + result.name;
      mount.appendChild(row);

      if (!result.ok) {
        var detail = document.createElement('pre');
        detail.className = 'detail';
        detail.textContent = result.error;
        mount.appendChild(detail);
      }
    });
  }

  Harness.describe = describe;
  Harness.test = test;
  Harness.assertEqual = assertEqual;
  Harness.assertDeepEqual = assertDeepEqual;
  Harness.assertThrows = assertThrows;
  Harness.run = run;
  Harness.reportToConsole = reportToConsole;
  Harness.reportToDocument = reportToDocument;
})(typeof globalThis !== 'undefined' ? globalThis : this);
