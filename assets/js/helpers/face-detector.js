var FaceDetector = {
  closing: false,
  typeToLoad: null,
	getStream: function(stream,type) {
    
    if(navigator.browser[0] === 'Firefox')
      FaceDetector.video.oncanplay = setup;
    else if(navigator.browser[0] === 'Chrome')
      FaceDetector.video.addEventListener('canplay',setup,true);
    
		function setup() {
    
			setTimeout(function() {
        
				FaceDetector.video.play();
				FaceDetector.canvas.style.display = 'inline';
        
				FaceDetector.canvas.width = FaceDetector.video.videoWidth;
				FaceDetector.canvas.height = FaceDetector.video.videoHeight;
				FaceDetector.backCanvas.width = FaceDetector.video.videoWidth / 4;
				FaceDetector.backCanvas.height = FaceDetector.video.videoHeight / 4;
				FaceDetector.backContext = FaceDetector.backCanvas.getContext('2d');
        
        var imageWidth = null;
        var imageHeight = null;
        
        if(type === 'classes'){
          imageWidth = FaceDetector.glasses.width;
          imageHeight = FaceDetector.glasses.height;
        }  
        else if(type === 'hair'){
          imageWidth = FaceDetector.hair.width;
          imageHeight = FaceDetector.hair.height;
        }
        else if(type === 'beard'){
          imageWidth = FaceDetector.beard.width;
          imageHeight = FaceDetector.beard.height;
        }
        
				var width = imageWidth / 4 * 0.8;
			  var height = imageHeight / 4 * 0.8;
			
				FaceDetector.comp = [{
					x: (FaceDetector.video.videoWidth / 4 - width) / 2,
					y: (FaceDetector.video.videoHeight / 4 - height) / 2,
					width: width, 
					height: height,
				}];
			
        FaceDetector.typeToLoad = type;
				FaceDetector.drawToCanvas();
        FaceDetector.video.style.display = 'none';
			}, 500);
      
		}
		
		var domURL = window.URL || window.webkitURL;
		FaceDetector.video.src = domURL ? domURL.createObjectURL(stream) : stream;
	},
	drawToCanvas: function() {
    
    if(!FaceDetector.closing)
      requestAnimationFrame(FaceDetector.drawToCanvas,type);
    
    var type = FaceDetector.typeToLoad;
		var video = FaceDetector.video;
	  var ctx = FaceDetector.context;
	  var backCtx = FaceDetector.backContext;
		var m = 4;
	  var width = 4;
		var i;
		var comp;
		
		ctx.drawImage(video, 0, 0, FaceDetector.canvas.width, FaceDetector.canvas.height);
		
		backCtx.drawImage(video, 0, 0, FaceDetector.backCanvas.width, FaceDetector.backCanvas.height);
		
		comp = ccv.detect_objects(FaceDetector.ccv = FaceDetector.ccv || {
			canvas: FaceDetector.backCanvas,
			cascade: cascade,
			interval: 4,
			min_neighbors: 1
		});
		
		if (comp.length) {
			FaceDetector.comp = comp;
		}
		
		for (i = FaceDetector.comp.length; i--; ) {
      // drawImage(img,x,y,width,height);
      if(type === 'classes')
        ctx.drawImage(FaceDetector.glasses, (FaceDetector.comp[i].x - width / 2) * m, (FaceDetector.comp[i].y - width / 2) * m, (FaceDetector.comp[i].width + width) * m, (FaceDetector.comp[i].height + width) * m);
      else if(type === 'hair')
        ctx.drawImage(FaceDetector.hair, (FaceDetector.comp[i].x - width / 2) * m, (FaceDetector.comp[i].y - width / 2) * m, (FaceDetector.comp[i].width + width) * m, (FaceDetector.comp[i].height + width) * m);
      else if(type === 'beard')
        ctx.drawImage(FaceDetector.beard, (FaceDetector.comp[i].x - width / 2) * m, (FaceDetector.comp[i].y - width / 2) * m, (FaceDetector.comp[i].width + width) * m, (FaceDetector.comp[i].height + width) * m);
    }
    
	}
};

FaceDetector.glasses = new Image();
FaceDetector.glasses.src = 'assets/img/glasses.png';

FaceDetector.hair = new Image();
FaceDetector.hair.src = 'assets/img/hair.png';

FaceDetector.beard = new Image();
FaceDetector.beard.src = 'assets/img/beard.png';

// source_id must be a <video>-tag
// output_id must be a <canvas>-tag
FaceDetector.init = function(source, output) {
  
  this.closing = false;
  
	FaceDetector.video = source; // source that is used for receiving data from
	FaceDetector.backCanvas = document.createElement('canvas'); // canvas that is used for calculations
	FaceDetector.canvas = output; // canvas that is used for visualization
	FaceDetector.canvas.style.display = 'none';
	FaceDetector.context = FaceDetector.canvas.getContext('2d');
	
	FaceDetector.video.loop = true;
	FaceDetector.video.load();
  
};
