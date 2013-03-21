
onmessage = function(event){
  
  var data = event.data;
  var videoCoords = [];
  
  var nextStartX = 0, nextStartY = 0;
  
  for(var v=0; v < data.video_num; v++){
    
    var alteredImageData = getCoordinatesForSnapshot(data.image_data, data.color, nextStartX, nextStartY);
    
    videoCoords.push(alteredImageData);
    nextStartX = alteredImageData.endX + 20;
    nextStartY = alteredImageData.startY;
    
  }
  
  postMessage(videoCoords);
  
};


var getCoordinatesForSnapshot = function(imgData,hex_color,start_x,start_y){ // hex_color #999999
    
  var startX = start_x,
      startY = start_y,
      endX = null,
      endY = null;
  
  for (var outer_y=startY; outer_y < imgData.height; outer_y++){
    
    for (var outer_x=startX; outer_x < imgData.width; outer_x++){
      
      var outer_offset = (outer_y * imgData.width + outer_x) * 4;
      var outer_offset_last_pos_x = outer_x > 0 ? (outer_y * imgData.width + (outer_x-1)) * 4 : 0;
      
      if( !startX && getHexColor(imgData.data[outer_offset], imgData.data[outer_offset+1], imgData.data[outer_offset+2]) === hex_color ){
        startX = outer_x;
        startY = outer_y;
      }
      // last pixel had got hex_color but current has not so it is last x-end
      else if( getHexColor(imgData.data[outer_offset], imgData.data[outer_offset+1], imgData.data[outer_offset+2]) !== hex_color &&
               getHexColor(imgData.data[outer_offset_last_pos_x], imgData.data[outer_offset_last_pos_x+1], imgData.data[outer_offset_last_pos_x+2]) === hex_color ){
        
        if(!endX)
          endX = outer_x;
        
        // pixel under left has'n got hex_color so it is the last y-end
        if( getHexColor(imgData.data[outer_offset_last_pos_x+(imgData.width*4)-4], imgData.data[outer_offset_last_pos_x+(imgData.width*4)-3], imgData.data[outer_offset_last_pos_x+(imgData.width*4)-2]) !== hex_color ){
          
          endY = outer_y;
          return { startX: (startX), startY: (startY), endX: (endX), endY: (endY)};
        }
      }
      
    }
    
  }
  
};
  
var getHexColor = function(red,green,blue){
  return '#' + red.toString(16) + green.toString(16) + blue.toString(16);
};