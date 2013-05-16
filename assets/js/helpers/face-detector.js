var FaceDetector = {
  closing: false,
  typeToLoad: null,
	getStream: function(stream,type) {
    
    setup = setup.bind(this);
    
    if(navigator.browser[0] === 'Firefox'){
      this.video.oncanplay = setup;
    }
    else if(navigator.browser[0] === 'Chrome'){
      this.video.addEventListener('canplay',setup,true);
    }
    
		function setup() { // wait for video that must be prepared
    
      this.video.play();
      
      this.canvas.style.display = 'inline';
      this.canvas.width = this.video.videoWidth;
      this.canvas.height = this.video.videoHeight;
      this.canvas.style.width = $(this.video).css('width');
      this.canvas.style.height = $(this.video).css('height');
      
      this.backCanvas.width = this.video.videoWidth / 4;
      this.backCanvas.height = this.video.videoHeight / 4;
      this.backContext = this.backCanvas.getContext('2d');
      
      var imageWidth = null;
      var imageHeight = null;
      
      if(type === 'glasses'){
        imageWidth = this.glasses.width;
        imageHeight = this.glasses.height;
      }  
      else if(type === 'hair'){
        imageWidth = this.hair.width;
        imageHeight = this.hair.height;
      }
      else if(type === 'beard'){
        imageWidth = this.beard.width;
        imageHeight = this.beard.height;
      }
      
      var width = imageWidth / 4 * 0.8;
      var height = imageHeight / 4 * 0.8;
    
      this.comp = [{
        x: (this.video.videoWidth / 4 - width) / 2,
        y: (this.video.videoHeight / 4 - height) / 2,
        width: width, 
        height: height,
      }];
    
      this.typeToLoad = type;
      this.drawToCanvas();
      this.video.style.display = 'none';
        
		}
		
		var domURL = window.URL || window.webkitURL;
		this.video.src = domURL ? domURL.createObjectURL(stream) : stream;
	},
	drawToCanvas: function() {
    
    if(!this.closing){
      this.drawToCanvas = this.drawToCanvas.bind(this);
      requestAnimationFrame(this.drawToCanvas,type);
    }
    
    var type = this.typeToLoad;
		var video = this.video;
	  var ctx = this.context;
	  var backCtx = this.backContext;
		var m = 4;
	  var width = 4;
		
		ctx.drawImage(video, 0, 0, this.canvas.width, this.canvas.height);
		
		backCtx.drawImage(video, 0, 0, this.backCanvas.width, this.backCanvas.height);
		
		var comp = ccv.detect_objects(this.ccv = this.ccv || {
			canvas: this.backCanvas,
			cascade: cascade,
			interval: 4,
			min_neighbors: 1
		});
		
		if (comp.length) {
			this.comp = comp;
		}
		
		for(var i = this.comp.length; i--; ) {
      // drawImage(img,x,y,width,height);
      if(type === 'glasses')
        ctx.drawImage(FaceDetector.glasses, (this.comp[i].x - width / 2) * m, (this.comp[i].y - width / 2) * m, (this.comp[i].width + width) * m, (this.comp[i].height + width) * m);
      else if(type === 'hair')
        ctx.drawImage(FaceDetector.hair, (this.comp[i].x - width / 2) * m, (this.comp[i].y - width / 2) * m, (this.comp[i].width + width) * m, (this.comp[i].height + width) * m);
      else if(type === 'beard')
        ctx.drawImage(FaceDetector.beard, (this.comp[i].x - width / 2) * m, (this.comp[i].y - width / 2) * m, (this.comp[i].width + width) * m, (this.comp[i].height + width) * m);
    }
    
	}
};

FaceDetector.glasses = new Image();
FaceDetector.glasses.src = 'assets/img/effects/glasses.png';

FaceDetector.hair = new Image();
FaceDetector.hair.src = 'assets/img/effects/hair.png';

FaceDetector.beard = new Image();
FaceDetector.beard.src = 'assets/img/effects/beard.png';

// source_id must be a <video>-tag
// output_id must be a <canvas>-tag
FaceDetector.init = function(source, output) {
  
  this.closing = false;
  
	this.video = source; // source that is used for receiving data from
	this.backCanvas = document.createElement('canvas'); // canvas that is used for calculations
	this.canvas = output; // canvas that is used for visualization
	this.canvas.style.display = 'none';
	this.context = this.canvas.getContext('2d');
	
	this.video.loop = true;
	this.video.load();
  
};
