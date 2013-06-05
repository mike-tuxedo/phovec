function AudioVisualizer() {
  this.analyser = null;
  this.microphone = null;
  this.audioContext = null;
  this.canvasContext = null;
  this.intervalId = null;
  this.type = "byte";
}

AudioVisualizer.prototype.setup = function(stream) {
console.log(stream);

  this.canvasContext = document.getElementById('audioVisualizer').getContext('2d');
  this.canvasContext.width = 400;
  this.canvasContext.height = 250;
  this.canvasContext.canvas.width = 400;
  this.canvasContext.canvas.height = 250;

  this.audioContext = new webkitAudioContext();
  this.analyser = this.audioContext.createAnalyser();

  this.microphone = this.audioContext.createMediaStreamSource(stream);
  this.microphone.connect(this.analyser);
  this.canvasContext.fillStyle = "rgba(255, 255, 255, 1)";
};

AudioVisualizer.prototype.start = function() {
  $('#audioVisualizer').show();
  this.intervalId = setInterval( function() {
    //clear canvas context at maximum size
    this.canvasContext.clearRect(0, 0, 1024, 1024);
    var data = [];
    var length = 0;

    if (this.type === "time") {
      data = new Uint8Array(this.analyser.fftSize);
      this.analyser.getByteTimeDomainData(data);
      length = data.length;
    } else if (this.type === "fft") {
      data = new Float32Array(this.analyser.fftSize);
      this.analyser.getFloatFrequencyData(data);
      length = data.length;
    } else if (this.type === "byte") {
      data = new Uint8Array(this.analyser.fftSize);
      this.analyser.getByteFrequencyData(data);
      length = data.length / 4;
    }

    var stepSize = 16;
    var fWidth = document.getElementById('audioVisualizer').offsetWidth / length;
    var y = document.getElementById('audioVisualizer').offsetHeight;

    for (var i = 0; i < data.length; i += stepSize) {
      var x = i * fWidth;
      var width = fWidth * stepSize;
      var height = 0;

      if (this.type === "time") {
        height = -data[i] / 255 * 100;
      } else if (this.type === "fft") {
        height = data[i] / 2;
      } else if (this.type === "byte") {
        height = -data[i];
      }

      this.canvasContext.fillRect(x, y, width, height);
    }
  }.bind(this), 100);
};

AudioVisualizer.prototype.stop = function() {
  $('#audioVisualizer').hide();
  this.canvasContext.clearRect(0, 0, 1024, 1024);
  clearInterval(this.intervalId);
};

