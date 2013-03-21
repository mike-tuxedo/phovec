
onmessage = function(event){
  
  var data = event.data;
  var video_coords = [];
  
  var next_start_x = 0, next_start_y = 0;
  
  for(var v=0; v < data.video_num; v++){
    
    var altered_image_data = getCoordinatesForSnapshot(data.image_data, '#999999', next_start_x, next_start_y);
    
    video_coords.push(altered_image_data);
    next_start_x = altered_image_data.end_x + 20;
    next_start_y = altered_image_data.start_y;
    
  }
  
  postMessage(video_coords);
  
};


var getCoordinatesForSnapshot = function(imgData,hex_color,start__x,start__y){ // hex_color #999999
    
  var start_x = start__x,
      start_y = start__y,
      end_x = null,
      end_y = null;
  
  for (var outer_y=start_y; outer_y < imgData.height; outer_y++){
    
    for (var outer_x=start_x; outer_x < imgData.width; outer_x++){
      
      var outer_offset = (outer_y * imgData.width + outer_x) * 4;
      var outer_offset_last_pos_x = outer_x > 0 ? (outer_y * imgData.width + (outer_x-1)) * 4 : 0;
      
      if( !start_x && getHexColor(imgData.data[outer_offset], imgData.data[outer_offset+1], imgData.data[outer_offset+2]) === hex_color ){
        start_x = outer_x;
        start_y = outer_y;
      }
      // last pixel had got hex_color but current has not so it is last x-end
      else if( getHexColor(imgData.data[outer_offset], imgData.data[outer_offset+1], imgData.data[outer_offset+2]) !== hex_color &&
               getHexColor(imgData.data[outer_offset_last_pos_x], imgData.data[outer_offset_last_pos_x+1], imgData.data[outer_offset_last_pos_x+2]) === hex_color ){
        
        if(!end_x)
          end_x = outer_x;
        
        // pixel under left has'n got hex_color so it is the last y-end
        if( getHexColor(imgData.data[outer_offset_last_pos_x+(imgData.width*4)-4], imgData.data[outer_offset_last_pos_x+(imgData.width*4)-3], imgData.data[outer_offset_last_pos_x+(imgData.width*4)-2]) !== hex_color ){
          
          end_y = outer_y;
          return { start_x: (start_x), start_y: (start_y), end_x: (end_x), end_y: (end_y)};
        }
      }
      
    }
    
  }
  
};
  
var getHexColor = function(red,green,blue){
  return '#' + red.toString(16) + green.toString(16) + blue.toString(16);
};