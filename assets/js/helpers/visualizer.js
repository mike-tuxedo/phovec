var Visualizer = {
  analyser: null,
  microphone: null,
  audioContext: null,
  canvasContext: null,
  init: function(stream) {
    var max = min = xIndex = 0;
    var fWidth = 1;
    
    this.audioContext = new webkitAudioContext();
    this.canvasContext = document.getElementById('canvas').getContext('2d');
    this.analyser = this.audioContext.createAnalyser();

    this.microphone = this.audioContext.createMediaStreamSource(stream);
    this.microphone.connect(this.analyser);
    this.canvasContext.fillStyle = "rgba(0, 0, 255, 1)";

    setInterval( function() {
      // FFTData = new Float32Array(this.analyser.fftSize);
      // this.analyser.getByteTimeDomainData(FFTData);
      var BTDData = new Uint8Array(this.analyser.fftSize);
      this.analyser.getByteTimeDomainData(BTDData);
      
      Visualizer.canvasContext.clearRect(0, 0, 512, 200);
      for (var i = 0; i < BTDData.length; i+=4) {
        Visualizer.canvasContext.fillRect(i/4 * fWidth, 200, fWidth, -BTDData[i]);
        console.log(BTDData.length, BTDData[i]);
      }
    }.bind(this), 40);
  }
};

navigator.webkitGetUserMedia({
  audio: true
}, Visualizer.init.bind(Visualizer));
