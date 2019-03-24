class Chart {
  chartName = null
  contexts = {
    bg: null, // background
    xl: null, // x labels
    yl: null, // y labels
    ynl: null, // y next labels (animation)
    yfl: null // y first label (static)
  }
  columns = []
  xValues = null

  control = {
    wrapper: null,
    left: null,
    right: null,
    width: 100, // px
    rightPos: 0,
    clickedLayerX: null,
    isActive: false
  }


  currentMultiplier = null
  currentTimelineMultiplier = null
  currentPeriod = null
  currentTimelinePeriod = null

  currentColumn = null

  constructor (name, data) {
    this.chartName = name
    this.calculateChartData(data)
    this.controlMoveHandler = this.controlMoveHandler.bind(this)
  }
  init () {
    this.createBackgroundContexts()
    this.createColumnsContextsAndButtons()
    this.createControl()
    this.drawChart()
    this.drawTimeline()
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
    const { chartName } = this
    column.ctx = createCanvasContext('COLUMN', chartName, column.name)
    column.timeline = createTimeline(chartName, column.name)
  }
  createColumnButton (column) {
    const { color, title, name } = column
    const button = createColumnButton(this.chartName, color, title, name)
    button.addEventListener('click', this.toggleChartLine.bind(this, name))
    column.button = button
  }
  createControl () {
    const { chartName, control }  = this
    const { wrapper, controlLeft, controlRight } = createControl(chartName, control.width, control.rightPos)
    if (isAndroid() || isIOS()) {
      wrapper.addEventListener('touchstart', this.controlMouseDownHandler.bind(this))
      window.addEventListener('touchend', this.controlMouseUpHandler.bind(this))
    } else if (!isAndroid() && !isIOS()) {
      wrapper.addEventListener('mousedown', this.controlMouseDownHandler.bind(this))
      window.addEventListener('mouseup', this.controlMouseUpHandler.bind(this))
    }
    this.control = { ...control, wrapper, controlLeft, controlRight }
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
          currentValues: [],
          color: colors[label],
          max: Math.max(...column),
          currentValuesMax: 0,
          isVisible: true,
          button: null,
          ctx: null
        })
      }
    })
  }
  drawChart () {
    const { columns, contexts, xValues, control: { width, rightPos } } = this
    const { bg, xl, yl, yfl } = contexts
    columns.forEach(column => {
      column.currentValues = calculateCurrentValues(column.values, width, rightPos)
      column.currentValuesMax = Math.max(...column.currentValues)
    })
    const maxValue = Math.max(...columns.map(column => column.isVisible && column.currentValuesMax))
    this.currentPeriod = getPeriod(maxValue)
    this.currentMultiplier = getMultiplier(this.currentPeriod)
    drawCoords(bg, yfl)
    writeXLabels(xl, xValues)
    writeYLabels(yl, yfl, this.currentPeriod)
    columns.forEach(column => {
      drawChartLine(column, this.currentMultiplier)
    })
  }
  redrawChartMovingControl () {
    const { columns, contexts, xValues, control: { width, rightPos } } = this
    if (columns[0].currentValues.equals(calculateCurrentValues(columns[0].values, width, rightPos))) return
    const { bg, xl, yl, yfl } = contexts
    columns.forEach(column => {
      column.currentValues = calculateCurrentValues(column.values, width, rightPos)
      column.currentValuesMax = Math.max(...column.currentValues)
    })
    const maxValue = Math.max(...columns.map(column => column.isVisible && column.currentValuesMax))
    const prevPeriod = this.currentPeriod
    const prevMultiplier = this.currentMultiplier
    this.currentPeriod = getPeriod(maxValue)
    this.currentMultiplier = getMultiplier(this.currentPeriod)
    writeXLabels(xl, xValues)
    if (prevPeriod !== this.currentPeriod) {
      this.chartCoordsAnimation(prevMultiplier)
      this.chartYLabelAnimation(prevMultiplier)
    }
    columns.forEach(column => {
      drawChartLine(column, this.currentMultiplier)
    })
  }
  drawTimeline () {
    const { columns } = this
    const maxValue = Math.max(...columns.map(column => column.isVisible && column.max))
    this.currentTimelinePeriod = getPeriod(maxValue)
    this.currentTimelineMultiplier = getTimelineMultiplier(this.currentTimelinePeriod)
    columns.forEach(column => {
      drawTimelineChartLine(column, this.currentTimelineMultiplier)
    })
  }
  redrawChartWithAnimation () {
    const { columns, control: { width, rightPos } } = this
    columns.forEach(column => {
      column.currentValues = calculateCurrentValues(column.values, width, rightPos)
      column.currentValuesMax = Math.max(...column.currentValues)
    })
    const maxCurrentValue = Math.max(...columns.map(column => column.isVisible && column.currentValuesMax))
    const maxValue = Math.max(...columns.map(column => column.isVisible && column.max))
    const prevMultiplier = this.currentMultiplier
    const prevTimelineMultiplier = this.currentTimelineMultiplier
    if (maxCurrentValue) {
      this.currentPeriod = getPeriod(maxCurrentValue)
      this.currentTimelinePeriod = getPeriod(maxValue)
      this.currentMultiplier = getMultiplier(this.currentPeriod)
      this.currentTimelineMultiplier = getTimelineMultiplier(this.currentTimelinePeriod)
    }
    if (prevMultiplier === this.currentMultiplier) {
      this.chartColumnAnimation(this.currentMultiplier, this.currentColumn, true)
      this.chartTimelineColumnAnimation(this.currentTimelineMultiplier, this.currentColumn, true)
    } else {
      this.chartCoordsAnimation(prevMultiplier)
      this.chartYLabelAnimation(prevMultiplier)
      columns.forEach(column => {
          const isChangeAlpha = column.name === this.currentColumn.name
          this.chartColumnAnimation(prevMultiplier, column, isChangeAlpha)
          this.chartTimelineColumnAnimation(prevTimelineMultiplier, column, isChangeAlpha)
        })
    }
  }
  chartCoordsAnimation (prevMultiplier) {
    const { contexts: { bg }, currentMultiplier } = this
    const isUp = prevMultiplier < currentMultiplier
    const frameCount = BG_ANIMATION_FRAMES
    let step = 0
    function animate () {
      const req = requestAnimationFrame(animate)
      drawAnimatedCoords(bg, isUp, step)
      step += BG_ANIMATION_FRAMES / 10
      if (step > frameCount) cancelAnimationFrame(req)
    }
    animate()
  }
  chartYLabelAnimation (prevMultiplier) {
    const { contexts: { yl, ynl }, currentMultiplier, currentPeriod } = this
    const isUp = prevMultiplier < currentMultiplier
    const frameCount = BG_ANIMATION_FRAMES
    let step = 0
    let alpha = 0
    function animate () {
      const req = requestAnimationFrame(animate)
      writeAnimatedYLabels(yl, ynl, currentPeriod, isUp, step, alpha / 10)
      step += BG_ANIMATION_FRAMES / 10
      alpha++
      if (step > frameCount) cancelAnimationFrame(req)
    }
    animate()
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
      if (step > framesCount) cancelAnimationFrame(req)
    }
    animate()
  }
  chartTimelineColumnAnimation (prevMultiplier, column, isChangeAlpha = false) {
    const framesCount = 10
    const { currentTimelineMultiplier } = this
    const { isVisible } = column
    const isUp = prevMultiplier < currentTimelineMultiplier
    const diff = isUp ? currentTimelineMultiplier - prevMultiplier : prevMultiplier - currentTimelineMultiplier
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
        multiplier = currentTimelineMultiplier
        if (isChangeAlpha) alpha = isVisible ? 100 : 0
      }
      drawTimelineChartLine(column, multiplier, isChangeAlpha ? alpha / 100 : isVisible ? 1 : 0)
      step++
      if (step > framesCount) cancelAnimationFrame(req)
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
  controlMouseUpHandler () {
    if (this.control.isActive) {
      this.control.isActive = false
      window.removeEventListener('mousemove', this.controlMoveHandler)
      window.removeEventListener('touchmove', this.controlMoveHandler)
    }
  }
  controlMouseDownHandler (event) {
    this.control.clickedLayerX = getLayerX(event)
    this.control.isActive = true
    window.addEventListener('mousemove', this.controlMoveHandler)
    window.addEventListener('touchmove', this.controlMoveHandler)
  }
  controlMoveHandler (event) {
    const { clickedLayerX, width: controlWidth } = this.control
    const leftPadding = (window.innerWidth - cWidth) / 2
    const timelineWidthWithoutControl = cWidth - controlWidth
    const clientX = event.clientX || event.touches[0].pageX
    const newRightPos = Math.floor((cWidth - (clientX - leftPadding)) - (controlWidth - clickedLayerX))
    if (newRightPos >= 0 && newRightPos <= timelineWidthWithoutControl) {
      this.control.rightPos = newRightPos
    } else if (newRightPos < 0) {
      this.control.rightPos = 0
    } else if (newRightPos > timelineWidthWithoutControl) {
      this.control.rightPos = timelineWidthWithoutControl
    }
    moveControl(this.control)
    this.redrawChartMovingControl()
  }
}
