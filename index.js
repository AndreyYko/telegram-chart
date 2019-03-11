const canvas = document.querySelector('#canvas')
const ctx = canvas.getContext('2d')

const grey = '#8c8c8c'
const red = '#ff0000'
const green = '#10ff00'

function drawLine (x1, y1, x2, y2, color, width = 1) {
  ctx.beginPath()
  ctx.moveTo(x1 - 0.5, y1 - 0.5)
  ctx.lineTo(x2 - 0.5, y2 - 0.5)
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.stroke()
}

function writeCoordsText () {
  const maxVal = Math.max(...inputData)
  const t = (maxVal - (maxVal % 5)) / 5
  ctx.font = '14px Arial'
  for (let i = 6; i > 0; i--) {
    ctx.fillText(`${Math.floor((6 - i) * t)}`, 0, (i * 60) - 5)
  }
  const cWidth = window.innerWidth * 0.9
  for (let i = 0; i < 6; i++) {
    let x = (cWidth / 5) * i
    if (i === 5) x -= 10
    ctx.fillText(`${i + 1}`, x, 375)
  }
}

const inputData = [10, 50, 25, 150, 200, 211]

function drawCoords () {
  const cWidth = window.innerWidth * 0.9
  const cHeight = 375
  canvas.setAttribute('width', `${cWidth}`)
  canvas.setAttribute('height', `${cHeight}`)
  drawLine(0, 60, cWidth, 60, grey)
  drawLine(0, 120, cWidth, 120, grey)
  drawLine(0, 180, cWidth, 180, grey)
  drawLine(0, 240, cWidth, 240, grey)
  drawLine(0, 300, cWidth, 300, grey)
  drawLine(0, 360, cWidth, 360, grey)
}

function drawChart (data) {
  const interval = Math.max(...data) / 360
  const cWidth = window.innerWidth * 0.9
  for (let i = 0; i < data.length; i++) {
    const x = (cWidth / 5) * i
    const y = (360 - (data[i] / interval))
    drawLine(x, y, x + 5, y + 5, red, 10)
  }
}

drawCoords()
writeCoordsText()
drawChart(inputData)
