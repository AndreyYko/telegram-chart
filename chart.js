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

  constructor (name, data) {
    this.chartName = name
    this.calculateChartData(data)
  }
  init () {
    this.createBackgroundContexts()
    this.createLinesContexts()
    this.createButtons()
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
  createLinesContexts () {
    this.columns.forEach(column => {
      const canvas = document.createElement('canvas')
      canvas.setAttribute('width', cWidth)
      canvas.setAttribute('height', cHeight)
      canvas.setAttribute('id', `${this.chartName}__line-${column.name}`)
      document.querySelector('.canvases').appendChild(canvas)
      const context = canvas.getContext('2d')
      context.lineWidth = LINE_WIDTH
      column.ctx = context
    })
  }
  createButtons () {
    this.columns.forEach(column => {
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
    })
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
    const maxValue = Math.max(...this.columns
      .filter(column => column.isVisible)
      .map(column => column.max)
    )
    this.currentPeriod = getPeriod(maxValue)
    this.currentMultiplier = getMultiplier(this.currentPeriod)
    this.drawCoords()
    this.writeCoordsText()
    this.columns
      // .filter(column => column.isVisible)
      .forEach(column => {
        this.drawChartLine(column)
      })
  }
  drawCoords () {
    for (let i = 0; i < 6; i++) {
      const y = CONTAINER_HEIGHT - (60 * i)
      drawLine(this.contexts.bg, 0, y, cWidth, y)
    }
  }
  writeCoordsText () {
    const { xl, yl } = this.contexts
    xl.clearRect(0, 0, cWidth, cHeight)
    yl.clearRect(0, 0, cWidth, cHeight)
    const xLabels = getXLabels(this.xValues)
    for (let i = 0; i < 6; i++) {
      const y = (CONTAINER_HEIGHT - (60 * i)) - 5 // -5 for label visibility
      yl.fillText(`${Math.floor(i * this.currentPeriod)}`, 0, y)
    }
    for (let i = 0; i < 6; i++) {
      let x = (cWidth / 5) * i
      if (i === 5) x -= 45 // for last bottom label overflowing
      xl.fillText(xLabels[i], x, CONTAINER_HEIGHT + 20)
    }
  }
  drawChartLine (column) {
    const { ctx, color, values } = column
    ctx.clearRect(0, 0, cWidth, cHeight)
    ctx.beginPath()
    ctx.strokeStyle = color

    ctx.lineJoin = 'round'
    const xStart = 0
    const yStart = Math.floor(CONTAINER_HEIGHT - ((values[0]) * this.currentMultiplier))
    ctx.moveTo(xStart, yStart)
    for (let i = 1; i < values.length; i++) {
      const xNext = Math.floor((cWidth / values.length) * i)
      const yNext = Math.floor(CONTAINER_HEIGHT - ((values[i]) * this.currentMultiplier))
      ctx.lineTo(xNext, yNext)
    }
    ctx.stroke()
  }
  toggleChartLine (name) {
    const column = this.columns.find(column => column.name === name)
    const { isVisible } = column
    column.isVisible = !isVisible
    this.changeButtonStyle(name)
    this.drawChart()
  }
  changeButtonStyle (name) {
    const { button, color, isVisible } = this.columns.find(column => column.name === name)
    const mark = button.querySelector('mark')
    mark.style.backgroundColor = !isVisible ? '#fff' : color
    mark.style.width = !isVisible ? '21px' : '25px'
    mark.style.height = !isVisible ? '21px' : '25px'
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
