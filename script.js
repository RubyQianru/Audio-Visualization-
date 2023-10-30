const volume = document.getElementById('volume')
const visualizer = document.getElementById('visualizer')

const context = new AudioContext()
const analyserNode = new AnalyserNode(context, { fftSize: 256 })
const gainNode = new GainNode(context, { gain: volume.value})

setupEventListeners()
setupContext()
resize()
drawVisualizer()

function setupEventListeners() {
  window.addEventListener('resize', resize)
  volume.addEventListener('input', e => {
    const value = parseFloat(e.target.value)
    gainNode.gain.setTargetAtTime(value, context.currentTime, .01)
  })

}

async function setupContext() {
  const guitar = await getGuitar()
  if (context.state === 'suspended') {
    await context.resume()
  }
  const source = context.createMediaStreamSource(guitar)
  source
    .connect(gainNode)
    .connect(analyserNode)
    .connect(context.destination)
}

function getGuitar() {
  return navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: false,
      autoGainControl: false,
      noiseSuppression: false,
      latency: 0
    }
  })
}

function drawVisualizer() {
  requestAnimationFrame(drawVisualizer)

  const bufferLength = analyserNode.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)
  analyserNode.getByteFrequencyData(dataArray)
  const width = visualizer.width
  const height = visualizer.height 
  const barWidth = width * 2.5 / bufferLength

  const canvasContext = visualizer.getContext('2d')
  canvasContext.clearRect(0, 0, width, height)

  dataArray.forEach((item, index) => {
    const y = item / 255 * height 
    const x = barWidth * index * 1.5

    // canvasContext.fillStyle = `hsl(${y / height * 400 +200}, 100%, 50%)`
    canvasContext.fillStyle = 'skyblue'
    canvasContext.fillRect(x, height - y, barWidth, y)
  })
}

function resize() {
  visualizer.width = visualizer.clientWidth * window.devicePixelRatio
  visualizer.height = visualizer.clientHeight * window.devicePixelRatio
}