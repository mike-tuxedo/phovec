App.RoomController = Ember.ObjectController.extend({
  init: function() {
    var controller = this;
    var loop = setInterval(function(){
      console.log('interval');
      if( face_detector_libs_loaded ){
        console.log('now');
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
      
        controller.copyVideosOntoCanvas(canvas);
        
        controller.showSnapshotButton(function(){
          var win = window.open(canvas.toDataURL('image/png'), 'Snapshot', ('width='+canvas.width+', height='+canvas.height) );
        });
      },
      allowTaint: true,
      letterRendering: true
    });
    
  },
  copyVideosOntoCanvas: function(canvas){
    var controller = this;
    
    var video_tags = $('video');
    
    var ctx = canvas.getContext('2d');
    
    for(var v=0; v < video_tags.length; v++){
      
      var whole_image_data = ctx.getImageData(0,0,canvas.width,canvas.height);
      var altered_image_data = controller.getCoordinatesForSnapshot(whole_image_data, '#999999');
      
      ctx.drawImage( video_tags[v], 
                     0, 0, video_tags[v].videoWidth, video_tags[v].videoHeight, // s_x, s_y, s_width, s_height
                     altered_image_data.start_x, altered_image_data.start_y, // d_x, d_y
                     (altered_image_data.end_x - altered_image_data.start_x)+6,// d_width, number because of '#999999'-areas
                     (altered_image_data.end_y - altered_image_data.start_y)+6// d_height, number because of '#999999'-areas
                   );
    }
    
  },
  getCoordinatesForSnapshot: function(imgData,hex_color){ // hex_color #999999
    
    var controller = this;
    var start_x = 0,
        start_y = 0,
        end_x = null,
        end_y = null;
    
    for (var outer_y=start_y; outer_y < imgData.height; outer_y++){
      
      for (var outer_x=start_x; outer_x < imgData.width; outer_x++){
        
        var outer_offset = (outer_y * imgData.width + outer_x) * 4;
        var outer_offset_last_pos_x = outer_x > 0 ? (outer_y * imgData.width + (outer_x-1)) * 4 : 0;
        
        if( !start_x && controller.getHexColor(imgData.data[outer_offset], imgData.data[outer_offset+1], imgData.data[outer_offset+2]) === hex_color ){
          start_x = outer_x;
          start_y = outer_y;
        }
        // last pixel had got hex_color but current has not so it is last x-end
        else if( controller.getHexColor(imgData.data[outer_offset], imgData.data[outer_offset+1], imgData.data[outer_offset+2]) !== hex_color &&
                 controller.getHexColor(imgData.data[outer_offset_last_pos_x], imgData.data[outer_offset_last_pos_x+1], imgData.data[outer_offset_last_pos_x+2]) === hex_color ){
          
          if(!end_x)
            end_x = outer_x;
          
          // pixel under left has'n got hex_color so it is the last y-end
          if( controller.getHexColor(imgData.data[outer_offset_last_pos_x+(imgData.width*4)-4], imgData.data[outer_offset_last_pos_x+(imgData.width*4)-3], imgData.data[outer_offset_last_pos_x+(imgData.width*4)-2]) !== hex_color ){
            
            end_y = outer_y;
            return { start_x: (start_x), start_y: (start_y), end_x: (end_x), end_y: (end_y)};
          }
        }
        
      }
      
    }
    
  },
  getHexColor: function(red,green,blue){
    return '#' + red.toString(16) + green.toString(16) + blue.toString(16);
  },
  showSnapshotButton: function(event_methode){
    var button = document.createElement('input');
    button.type = 'button';
    button.onclick = event_methode;
    button.value = 'get Snapshot';
    button.width = '100';
    button.id = 'snapshotButton';
    document.body.appendChild(button);
  }
});
