// face-detector-libs are loaded after facebook-sdk is loaded because of interference
var face_detector_libs_loaded = false;

setTimeout(function(){
  var sources = ["js/libs/request-animation-frame.js","js/libs/face-detection/ccv.js","js/libs/face-detection/face.js","js/face-detector.js"];
  
  sources.forEach(function(src,index){
    var script = document.createElement('script');
    script.src = src;
    document.body.appendChild(script);
  });
  
  face_detector_libs_loaded = true;
},2000);