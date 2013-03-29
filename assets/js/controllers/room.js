App.RoomController = Ember.ObjectController.extend({
  init: function() {
    var controller = this;
    var loop = setInterval(function(){
      
      if( typeof FaceDetector !== undefined ){
        FaceDetector.init(document.getElementsByTagName('video')[0], document.getElementById('output')); 
        clearInterval(loop);
      }
      
    },500);
 
    /* starting animated plus */
    //time between a set of animations and the next set of animations (one set are 3 bubbles)
    var repetitionRate = 4000;
    //duration until a bubble reach his given size
    var duration = 1700;
    var top = parseInt($('.get_friends').css('margin-top'), 10);
    console.log(top);
     /*
    setTimeout(function(){setInterval(function(){animateGradient($('#gradient1'), duration, 200, top)}, repetitionRate)}, 0);
    setTimeout(function(){setInterval(function(){animateGradient($('#gradient2'), duration, 150, top)}, repetitionRate)}, 200);
    setTimeout(function(){setInterval(function(){animateGradient($('#gradient3'), duration, 100, top)}, repetitionRate)}, 400);
  
    function animateGradient(gradient, duration, size, top){
        var halfSize = size/2;
  
        gradient.animate({
          opacity: '0',
          width: size + 'px',
          height: size + 'px',
          right: '-' + halfSize + 'px',
          borderTopLeftRadius: halfSize + 'px',
          borderBottomLeftRadius: halfSize + 'px',
          marginTop: (top-halfSize) + 'px'
        },
        duration,
        function(){
          gradient.css('opacity','0.8');
          gradient.css('width','0px');
          gradient.css('height','0px');
          gradient.css('right','0px');
          gradient.css('borderTopLeftRadius','0px');
          gradient.css('borderBottomLeftRadius','0px');
          gradient.css('marginTop','350px');
        });
      }*/
  },
  putClassesOnUser: function(){
    this.putUserStreamOnDetector('classes');
  },
  putHairOnUser: function(){
    this.putUserStreamOnDetector('hair');
  },
  putBeardOnUser: function(){
    this.putUserStreamOnDetector('beard');
  },
  takeOffClothesOfUser: function(){
    document.getElementById('output').style.display = 'none';
    FaceDetector.closing = true;
  },
  putUserStreamOnDetector: function(type){
    FaceDetector.closing = false;
    if(WebRTC.users && WebRTC.users[0].stream)
      FaceDetector.getStream(WebRTC.users[0].stream,type);
  },
  takeScreenShotFromChatroom: function(){
    
    var controller = this;
    
    if($('#snapshotButton'))
      $('#snapshotButton').remove();
      
    html2canvas( [ document.body ], {
      onrendered: function(canvas) {
        
        var video_tags = $('video');
        
        var snapshot_worker = new Worker('js/helpers/snapshot_worker.js');
        
        snapshot_worker.postMessage({image_data: (canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height)), video_num: (video_tags.length) });
        
        snapshot_worker.onmessage = function(e){
          
          e.data.forEach(function(video_coord,index){
            
            var ctx = canvas.getContext('2d');
    
            for(var v=0; v < video_tags.length; v++){
              
              ctx.drawImage( video_tags[v], 
                             0, 0, video_tags[v].videoWidth, video_tags[v].videoHeight, // s_x, s_y, s_width, s_height
                             video_coord.start_x, video_coord.start_y, // d_x, d_y
                             (video_coord.end_x - video_coord.start_x),// d_width, number because of '#999999'-areas
                             (video_coord.end_y - video_coord.start_y) // d_height, number because of '#999999'-areas
                           );
            }
            
          });
          
          controller.createSnapshotButton(function(){
            var win = window.open(canvas.toDataURL('image/png'), 'Snapshot', ('width='+canvas.width+', height='+canvas.height) );
          });
        };
        
      },
      taintTest: true,
      allowTaint: true,
      letterRendering: true,
      background: undefined
    });
    
  },
  createSnapshotButton: function(event_methode){
    var button = document.createElement('input');
    button.type = 'button';
    button.onclick = event_methode;
    button.value = 'get Snapshot';
    button.width = '100';
    button.id = 'snapshotButton';
    document.body.appendChild(button);
  }
});
