class Chart {
  chartName = null
  contexts = {
    bg: null,
    xl: null,
    yl: null
  }
  columns = []
  visibleColumns = []
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
      const canvas = document.createElement('canvas')
      canvas.setAttribute('width', cWidth)
      canvas.setAttribute('height', cHeight)
      canvas.setAttribute('id', `${this.chartName}__${ctx}`)
      document.querySelector('.canvases').appendChild(canvas)
      const context = canvas.getContext('2d')
      context.font = '12px Arial'
      context.fillStyle = COLOR_GREY
      this.contexts[ctx] = context
    })
  }
  createColumnsContextsAndButtons () {
    this.columns.forEach(column => {
      this.createColumnContext(column)
      this.createColumnButton(column)
    })
  }
  createColumnContext (column) {
    const canvas = document.createElement('canvas')
    canvas.setAttribute('width', cWidth)
    canvas.setAttribute('height', cHeight)
    canvas.setAttribute('id', `${this.chartName}__line-${column.name}`)
    document.querySelector('.canvases').appendChild(canvas)
    const context = canvas.getContext('2d')
    context.lineWidth = LINE_WIDTH
    column.ctx = context
  }
  createColumnButton (column) {
    const { color, title, name } = column
    const button = document.createElement('button')
    const mark = document.createElement('mark')
    const span = document.createElement('span')
    button.setAttribute('id', `${this.chartName}__button-${name}`)
    mark.style.backgroundColor = color
    span.innerText = title
    button.appendChild(mark)
    button.appendChild(span)
    button.addEventListener('click', this.toggleChartLine.bind(this, name))
    document.querySelector('.buttons').appendChild(button)
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
  redrawChartWithAnimation (toggledColumnName) {
    const maxValue = Math.max(
      ...this.columns
        .filter(column => column.isVisible)
        .map(column => column.max)
    )
    const prevMultiplier = this.currentMultiplier
    this.currentPeriod = getPeriod(maxValue)
    this.currentMultiplier = getMultiplier(this.currentPeriod)
    if (prevMultiplier === this.currentMultiplier) {
      this.chartColumnAnimation(this.currentMultiplier, this.columns.find(column => column.name === toggledColumnName), true)
    } else {
      this.columns
        .map(column => {
          const isChangeAlpha = column.name === toggledColumnName
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
      // if (isChangeAlpha) console.log(alpha)
      drawChartLine(column, multiplier, isChangeAlpha ? alpha / 100 : isVisible ? 1 : 0)
      step++
      if (step > framesCount) {
        cancelAnimationFrame(req)
      }
    }
    animate()
  }
  toggleChartLine (name) {
    const column = this.columns.find(column => column.name === name)
    const { isVisible } = column
    column.isVisible = !isVisible
    this.changeButtonStyle(name)
    this.redrawChartWithAnimation(name)
  }
  changeButtonStyle (name) {
    const { button, color, isVisible } = this.columns.find(column => column.name === name)
    const mark = button.querySelector('mark')
    mark.style.backgroundColor = isVisible ? color : COLOR_WHITE
    mark.style.width = isVisible ? BUTTON_UNABLED_SIZE : BUTTON_DISABLE_SIZE
    mark.style.height = isVisible ? BUTTON_UNABLED_SIZE : BUTTON_DISABLE_SIZE
    mark.style.border = !isVisible ? `2px solid ${color}` : 'none'
  }
}

function init () {
  const parsedData = JSON.parse(DATA)
  const [firstChart, secondChart, thirdChart, fourthChart, fifthChart] = parsedData
  const chart =  new Chart('first-chart', firstChart)
  chart.init()
}


init()
