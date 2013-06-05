var FaceDetector = {
  _closed: true,
  get closed(){
    return this._closed;
  },
  set closed(val){ 
    if(val === false){
      this.canvas.style.display = 'inline';
    }
    else{
      //Bug-Fix made by Lukas
      if(this.canvas !== undefined){
        this.canvas.style.display = 'none';
      }
    }
    this._closed = val;
  },
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
      else if(type === 'glasses2'){
        imageWidth = this.glasses2.width;
        imageHeight = this.glasses2.height;
      } 
      else if(type === 'hat'){
        imageWidth = this.hat.width;
        imageHeight = this.hat.height;
      }
      else if(type === 'beard'){
        imageWidth = this.beard.width;
        imageHeight = this.beard.height;
      }
      else if(type === 'hair'){
        imageWidth = this.hair.width;
        imageHeight = this.hair.height;
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
    
    if(!this.closed){
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
			interval: 20,
			min_neighbors: 1
		});
		
		if (comp.length) {
			this.comp = comp;
		}
		
		for(var i = this.comp.length; i--; ) {
      // drawImage(img,x,y,width,height);
      if(type === 'glasses'){
        ctx.drawImage(FaceDetector.glasses, (this.comp[i].x - width / 2) * m, (this.comp[i].y - width / 2) * m, (this.comp[i].width + width) * m, (this.comp[i].height + width) * m);
      }
      else if(type === 'glasses2'){
        ctx.drawImage(FaceDetector.glasses2, (this.comp[i].x - width / 2) * m, (this.comp[i].y - width / 2) * m, (this.comp[i].width + width) * m, (this.comp[i].height + width) * m);
      }
      else if(type === 'hat'){
        ctx.drawImage(FaceDetector.hat, ((this.comp[i].x - width / 2) * m) /1.8, (this.comp[i].y - width / 2) * m * -5, (this.comp[i].width + width) * m * 2, (this.comp[i].height + width) * m * 2);
      }
      else if(type === 'beard'){
        ctx.drawImage(FaceDetector.beard, (this.comp[i].x - width / 2) * m, (this.comp[i].y - width / 2) * m, (this.comp[i].width + width) * m, (this.comp[i].height + width) * m);
      }
      else if(type === 'hair'){
        ctx.drawImage(FaceDetector.hair, (this.comp[i].x - width / 2) * m * 0.7, ((this.comp[i].y - width / 2) * m * 0.02), (this.comp[i].width + width) * m * 1.5, (this.comp[i].height + width) * m * 1.5);
      }
    }
	}
};

FaceDetector.glasses = new Image();
FaceDetector.glasses.src = 'assets/img/effects/glasses.png';

FaceDetector.glasses2 = new Image();
FaceDetector.glasses2.src = 'assets/img/effects/glasses2.png';

FaceDetector.hat = new Image();
FaceDetector.hat.src = 'assets/img/effects/hat.png';

FaceDetector.beard = new Image();
FaceDetector.beard.src = 'assets/img/effects/beard.png';

FaceDetector.hair = new Image();
FaceDetector.hair.src = 'assets/img/effects/hair.png';

// source_id must be a <video>-tag
// output_id must be a <canvas>-tag
FaceDetector.init = function(source, output) {
  
	this.video = source; // source that is used for receiving data from
	this.backCanvas = document.createElement('canvas'); // canvas that is used for calculations
	this.canvas = output; // canvas that is used for visualization
	this.context = this.canvas.getContext('2d');
	
  this.closed = false;
  this.canvas.style.display = 'none';
  
	this.video.loop = true;
	this.video.load();
  
};
