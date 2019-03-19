"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Chart =
/*#__PURE__*/
function () {
  function Chart(name, data) {
    _classCallCheck(this, Chart);

    _defineProperty(this, "chartName", null);

    _defineProperty(this, "contexts", {
      bg: null,
      // background
      xl: null,
      // x labels
      yl: null,
      // y labels
      ynl: null,
      // y next labels (animation)
      yfl: null // y first label (static)

    });

    _defineProperty(this, "columns", []);

    _defineProperty(this, "xValues", null);

    _defineProperty(this, "currentMultiplier", null);

    _defineProperty(this, "currentTimelineMultiplier", null);

    _defineProperty(this, "currentPeriod", null);

    _defineProperty(this, "currentColumn", null);

    this.chartName = name;
    this.calculateChartData(data);
  }

  _createClass(Chart, [{
    key: "init",
    value: function init() {
      this.createBackgroundContexts();
      this.createColumnsContextsAndButtons();
      this.drawChart();
      console.log(this);
    }
  }, {
    key: "createBackgroundContexts",
    value: function createBackgroundContexts() {
      var _this = this;

      Object.keys(this.contexts).forEach(function (ctx) {
        _this.contexts[ctx] = createCanvasContext('BG', _this.chartName, ctx);
      });
    }
  }, {
    key: "createColumnsContextsAndButtons",
    value: function createColumnsContextsAndButtons() {
      var _this2 = this;

      this.columns.forEach(function (column) {
        _this2.createColumnContext(column);

        _this2.createColumnButton(column);
      });
    }
  }, {
    key: "createColumnContext",
    value: function createColumnContext(column) {
      var chartName = this.chartName;
      column.ctx = createCanvasContext('COLUMN', chartName, column.name);
      column.timeline = createTimeline(chartName, column.name);
    }
  }, {
    key: "createColumnButton",
    value: function (_createColumnButton) {
      function createColumnButton(_x) {
        return _createColumnButton.apply(this, arguments);
      }

      createColumnButton.toString = function () {
        return _createColumnButton.toString();
      };

      return createColumnButton;
    }(function (column) {
      var color = column.color,
          title = column.title,
          name = column.name;
      var button = createColumnButton(this.chartName, color, title, name);
      button.addEventListener('click', this.toggleChartLine.bind(this, name));
      column.button = button;
    })
  }, {
    key: "calculateChartData",
    value: function calculateChartData(data) {
      var _this3 = this;

      var columns = data.columns,
          colors = data.colors,
          names = data.names,
          types = data.types;
      columns.forEach(function (column) {
        var label = column[0];
        column = column.slice(1);

        if (types[label] === 'x') {
          _this3.xValues = column;
        } else if (types[label] === 'line') {
          _this3.columns.push({
            name: label,
            title: names[label],
            values: column,
            color: colors[label],
            max: Math.max.apply(Math, _toConsumableArray(column)),
            isVisible: true,
            button: null,
            ctx: null
          });
        }
      });
    }
  }, {
    key: "drawChart",
    value: function drawChart() {
      var _this4 = this;

      var columns = this.columns,
          contexts = this.contexts,
          xValues = this.xValues;
      var bg = contexts.bg,
          xl = contexts.xl,
          yl = contexts.yl,
          yfl = contexts.yfl;
      var maxValue = Math.max.apply(Math, _toConsumableArray(columns.map(function (column) {
        return column.isVisible && column.max;
      })));
      this.currentPeriod = getPeriod(maxValue);
      this.currentMultiplier = getMultiplier(this.currentPeriod);
      this.currentTimelineMultiplier = getTimelineMultiplier(this.currentPeriod);
      drawCoords(bg, yfl);
      writeXLabels(xl, xValues);
      writeYLabels(yl, yfl, this.currentPeriod);
      columns.forEach(function (column) {
        drawChartLine(column, _this4.currentMultiplier);
        drawTimelineChartLine(column, _this4.currentTimelineMultiplier);
      });
    }
  }, {
    key: "redrawChartWithAnimation",
    value: function redrawChartWithAnimation() {
      var _this5 = this;

      var columns = this.columns;
      var maxValue = Math.max.apply(Math, _toConsumableArray(columns.map(function (column) {
        return column.isVisible && column.max;
      })));
      var prevMultiplier = this.currentMultiplier;

      if (maxValue) {
        this.currentPeriod = getPeriod(maxValue);
        this.currentMultiplier = getMultiplier(this.currentPeriod);
      }

      if (prevMultiplier === this.currentMultiplier) {
        this.chartColumnAnimation(this.currentMultiplier, this.currentColumn, true);
      } else {
        this.chartCoordsAnimation(prevMultiplier);
        this.chartYLabelAnimation(prevMultiplier);
        columns.map(function (column) {
          var isChangeAlpha = column.name === _this5.currentColumn.name;

          _this5.chartColumnAnimation(prevMultiplier, column, isChangeAlpha);
        });
      }
    }
  }, {
    key: "chartCoordsAnimation",
    value: function chartCoordsAnimation(prevMultiplier) {
      var bg = this.contexts.bg,
          currentMultiplier = this.currentMultiplier;
      var isUp = prevMultiplier < currentMultiplier;
      var frameCount = BG_ANIMATION_FRAMES;
      var step = 0;
      var alpha = 0;

      function animate() {
        var req = requestAnimationFrame(animate);
        drawAnimatedCoords(bg, isUp, step, alpha / 10);
        step += BG_ANIMATION_FRAMES / 10;
        alpha++;
        if (step > frameCount) cancelAnimationFrame(req);
      }

      animate();
    }
  }, {
    key: "chartYLabelAnimation",
    value: function chartYLabelAnimation(prevMultiplier) {
      var _this$contexts = this.contexts,
          yl = _this$contexts.yl,
          ynl = _this$contexts.ynl,
          currentMultiplier = this.currentMultiplier,
          currentPeriod = this.currentPeriod;
      var isUp = prevMultiplier < currentMultiplier;
      var frameCount = BG_ANIMATION_FRAMES;
      var step = 0;
      var alpha = 0;

      function animate() {
        var req = requestAnimationFrame(animate);
        writeAnimatedYLabels(yl, ynl, currentPeriod, isUp, step, alpha / 10);
        step += BG_ANIMATION_FRAMES / 10;
        alpha++;
        if (step > frameCount) cancelAnimationFrame(req);
      }

      animate();
    }
  }, {
    key: "chartColumnAnimation",
    value: function chartColumnAnimation(prevMultiplier, column) {
      var isChangeAlpha = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var framesCount = 10;
      var currentMultiplier = this.currentMultiplier;
      var isVisible = column.isVisible;
      var isUp = prevMultiplier < currentMultiplier;
      var diff = isUp ? currentMultiplier - prevMultiplier : prevMultiplier - currentMultiplier;
      var step = 0;

      function animate() {
        var req = requestAnimationFrame(animate);
        var multiplier = prevMultiplier;
        var alpha = isChangeAlpha ? isVisible ? 0 : 100 : null;

        if (step < framesCount) {
          var point = diff / framesCount * step;
          multiplier = isUp ? prevMultiplier + point : prevMultiplier - point;
          if (isChangeAlpha) alpha = isVisible ? alpha + 10 * step : alpha - 10 * step;
        } else {
          multiplier = currentMultiplier;
          if (isChangeAlpha) alpha = isVisible ? 100 : 0;
        }

        drawChartLine(column, multiplier, isChangeAlpha ? alpha / 100 : isVisible ? 1 : 0);
        step++;
        if (step > framesCount) cancelAnimationFrame(req);
      }

      animate();
    }
  }, {
    key: "toggleChartLine",
    value: function toggleChartLine(name) {
      this.currentColumn = this.columns.find(function (column) {
        return column.name === name;
      });
      var _this$currentColumn = this.currentColumn,
          button = _this$currentColumn.button,
          color = _this$currentColumn.color,
          isVisible = _this$currentColumn.isVisible;
      this.currentColumn.isVisible = !isVisible;
      changeButtonStyle(button, color, this.currentColumn.isVisible);
      this.redrawChartWithAnimation();
    }
  }]);

  return Chart;
}();