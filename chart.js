class Chart {
  chartName = null
  contexts = {
    bg: null,
    xl: null,
    yl: null
  }
  columns = []
  xValues = null
  currentMultiplier = null
  currentPeriod = null

  currentColumn = null

  constructor (name, data) {
    this.chartName = name
    this.calculateChartData(data)
  }
  init () {
    this.createBackgroundContexts()
    this.createColumnsContextsAndButtons()

    this.drawChart()
    console.log(this)
  }
  createBackgroundContexts () {
    Object.keys(this.contexts).forEach(ctx => {
      this.contexts[ctx] = createCanvasContext('BG', this.chartName, ctx)
    })
  }
  createColumnsContextsAndButtons () {
    this.columns.forEach(column => {
      this.createColumnContext(column)
      this.createColumnButton(column)
    })
  }
  createColumnContext (column) {
    column.ctx = createCanvasContext('COLUMN', this.chartName, column.name)
  }
  createColumnButton (column) {
    const { color, title, name } = column
    const button = createColumnButton(this.chartName, color, title, name)
    button.addEventListener('click', this.toggleChartLine.bind(this, name))
    column.button = button
  }
  calculateChartData (data) {
    const { columns, colors, names, types } = data
    columns.forEach(column => {
      const label = column[0]
      column = column.slice(1)
      if (types[label] === 'x') {
        this.xValues = column
      } else if (types[label] === 'line') {
        this.columns.push({
          name: label,
          title: names[label],
          values: column,
          color: colors[label],
          max: Math.max(...column),
          isVisible: true,
          button: null,
          ctx: null
        })
      }
    })
  }
  drawChart () {
    const { columns, contexts, xValues } = this
    const { bg, xl, yl } = contexts
    const maxValue = Math.max(...columns.map(column => column.isVisible && column.max))
    this.currentPeriod = getPeriod(maxValue)
    this.currentMultiplier = getMultiplier(this.currentPeriod)
    drawCoords(bg)
    writeXLabels(xl, xValues)
    writeYLabels(yl, this.currentPeriod)
    columns.forEach(column => drawChartLine(column, this.currentMultiplier))
  }
  redrawChartWithAnimation () {
    const { columns, contexts: { yl } } = this
    const maxValue = Math.max(...columns.map(column => column.isVisible && column.max))
    const prevMultiplier = this.currentMultiplier
    if (maxValue) {
      this.currentPeriod = getPeriod(maxValue)
      this.currentMultiplier = getMultiplier(this.currentPeriod)
      writeYLabels(yl, this.currentPeriod)
    }
    if (prevMultiplier === this.currentMultiplier) {
      this.chartColumnAnimation(this.currentMultiplier, this.currentColumn, true)
    } else {
      columns.map(column => {
          const isChangeAlpha = column.name === this.currentColumn.name
          this.chartColumnAnimation(prevMultiplier, column, isChangeAlpha)
        })
    }
  }
  chartColumnAnimation (prevMultiplier, column, isChangeAlpha = false) {
    const framesCount = 10
    const { currentMultiplier } = this
    const { isVisible } = column
    const isUp = prevMultiplier < currentMultiplier
    const diff = isUp ? currentMultiplier - prevMultiplier : prevMultiplier - currentMultiplier
    let step = 0
    function animate () {
      const req = requestAnimationFrame(animate)
      let multiplier = prevMultiplier
      let alpha = isChangeAlpha ? isVisible ? 0 : 100 : null
      if (step < framesCount) {
        const point = (diff / framesCount) * step
        multiplier = isUp ? prevMultiplier + point : prevMultiplier - point
        if (isChangeAlpha) alpha = isVisible ? alpha + (10 * step) : alpha - (10 * step)
      } else {
        multiplier = currentMultiplier
        if (isChangeAlpha) alpha = isVisible ? 100 : 0
      }
      drawChartLine(column, multiplier, isChangeAlpha ? alpha / 100 : isVisible ? 1 : 0)
      step++
      if (step > framesCount) {
        cancelAnimationFrame(req)
      }
    }
    animate()
  }
  toggleChartLine (name) {
    this.currentColumn = this.columns.find(column => column.name === name)
    const { button, color, isVisible } = this.currentColumn
    this.currentColumn.isVisible = !isVisible
    changeButtonStyle(button, color, this.currentColumn.isVisible)
    this.redrawChartWithAnimation()
  }
}

function init () {
  const parsedData = JSON.parse(DATA)
  const [firstChart, secondChart, thirdChart, fourthChart, fifthChart] = parsedData
  const chart =  new Chart('first-chart', fifthChart)
  chart.init()
}


init()
