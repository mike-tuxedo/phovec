var AudioVisualizer = {
  analyser: null,
  microphone: null,
  audioContext: null,
  canvasContext: null,
  init: function(stream) {
    this.canvasContext = document.getElementById('canvas').getContext('2d');
    this.canvasContext.width = window.innerWidth;
    this.canvasContext.height = 255;
    document.getElementById('canvas').height = 255;

    this.audioContext = new webkitAudioContext();
    this.analyser = this.audioContext.createAnalyser();

    this.microphone = this.audioContext.createMediaStreamSource(stream);
    this.microphone.connect(this.analyser);
    this.canvasContext.fillStyle = "rgba(30, 30, 30, 1)";
    var max = 0;
    setInterval( function() {
      // FFTData = new Float32Array(this.analyser.fftSize);
      // this.analyser.getByteTimeDomainData(FFTData);
      var BTDData = new Uint8Array(this.analyser.fftSize);
      this.analyser.getByteTimeDomainData(BTDData);

      this.canvasContext.clearRect(0, 0, document.getElementById('canvas').offsetWidth, document.getElementById('canvas').offsetHeight);
      for (var i = 0; i < BTDData.length; i += stepSize) {
        var stepSize = 32;
        var fWidth = document.getElementById('canvas').offsetWidth / 2048;
        var x = i * fWidth;
        var y = document.getElementById('canvas').offsetHeight;
        var width = fWidth * stepSize;
        var height = -BTDData[i];

        this.canvasContext.fillRect(x, y, width, height);
      }
    }.bind(this), 40);
  }
};

navigator.webkitGetUserMedia({
  audio: true
}, AudioVisualizer.init.bind(AudioVisualizer));

/**
 * HTML is needed 
 * <canvas id="canvas">
      asdf
   </canvas>
 */
