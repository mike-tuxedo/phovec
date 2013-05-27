var Visualizer = {
  analyser: null,
  microphone: null,
  init: function(stream) {
    var max = min = 0;
    this.audioContext = new webkitAudioContext();
    this.canvasContext = document.getElementById('canvas').getContext('2d'), this.analyser = this.audioContext.createAnalyser();

    this.microphone = this.audioContext.createMediaStreamSource(stream);
    this.microphone.connect(this.analyser);
    this.canvasContext.fillStyle = "rgba(0, 0, 255, 1)";

    setInterval(function() {
      FFTData = new Float32Array(analyser.frequencyBinCount);
      analyser.getFloatFrequencyData(FFTData);

      this.canvasContext.clearRect(0, 0, 200, 200);
      this.canvasContext.fillRect(25, 25, 10, -FFTData[0]);

      console.log(-FFTData[0]);
      if (FFTData[0] > max) {
        max = FFTData[0];
      }
      if (FFTData[0] < min) {
        min = FFTData[0];
      }
    }, 10);
  }
};

navigator.webkitGetUserMedia({
  audio: true
}, Visualizer.init);
