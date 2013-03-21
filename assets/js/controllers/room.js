App.RoomController = Ember.ObjectController.extend({
  init: function() {
    var controller = this;
    var loop = setInterval(function(){
      
      if( typeof FaceDetector !== undefined ){
        FaceDetector.init(document.getElementsByTagName('video')[0], document.getElementById('output')); 
        clearInterval(loop);
      }
      
    },500);
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
        
        var videoTags = $('video');
        
        var snapshotWorker = new Worker('js/helpers/snapshot_worker.js');
        
        snapshotWorker.postMessage({ image_data: (canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height)), 
                                     color: '#999999', 
                                     video_num: (videoTags.length) 
                                  });
        
        snapshotWorker.onmessage = function(e){
          console.log('',e.data);
          e.data.forEach(function(videoCoord,index){
            
            var ctx = canvas.getContext('2d');
    
            for(var v=0; v < videoTags.length; v++){
              
              ctx.drawImage( videoTags[v], 
                             0, 0, videoTags[v].videoWidth, videoTags[v].videoHeight, // s_x, s_y, s_width, s_height
                             videoCoord.startX, videoCoord.startY, // d_x, d_y
                             (videoCoord.endX - videoCoord.startX),// d_width, number because of '#999999'-areas
                             (videoCoord.endY - videoCoord.startY) // d_height, number because of '#999999'-areas
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
