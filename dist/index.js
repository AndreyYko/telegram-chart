"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function init() {
  var parsedData = JSON.parse(DATA);

  var _parsedData = _slicedToArray(parsedData, 5),
      firstChart = _parsedData[0],
      secondChart = _parsedData[1],
      thirdChart = _parsedData[2],
      fourthChart = _parsedData[3],
      fifthChart = _parsedData[4];

  var chart = new Chart('first-chart', firstChart);
  chart.init();
}

init();