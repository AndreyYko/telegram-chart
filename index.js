function init () {
  const parsedData = JSON.parse(DATA)
  const [firstChart, secondChart, thirdChart, fourthChart, fifthChart] = parsedData
  const chart =  new Chart('first-chart', fifthChart)
  chart.init()
}


init()
