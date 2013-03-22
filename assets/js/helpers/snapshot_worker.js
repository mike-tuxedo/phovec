
onmessage = function(event){
  
  var data = event.data;
  var videoCoords = [];
  
  var cell = {};
  cell.width = null;
  cell.height = null;
  
  for(var v=0; v < data.video_num; v++){
    
    var alteredImageData = getCoordinatesForSnapshot(data.image_data, data.color, videoCoords, cell);
    
    videoCoords.push(alteredImageData);
      
  }
  
  postMessage({ coords: videoCoords, cell_width: cell.width, cell_height: cell.height });
  
};

var getCoordinatesForSnapshot = function(imgData,hex_color,formerCoords, cell){ // hex_color #999999
    
  var startX = 0, startY = 0, endX = null;
  
  for (var outer_y=startY; outer_y < imgData.height; outer_y++){
    
    for (var outer_x=startX; outer_x < imgData.width; outer_x++){
      
      var outer_offset = (outer_y * imgData.width + outer_x) * 4;
      var outer_offset_last_pos_x = outer_x > 0 ? (outer_y * imgData.width + (outer_x-1)) * 4 : 0;
      
      // is pixel on the left upper corner
      if( !startX && !hasArrayGotCoord(formerCoords, { startX: outer_x, startY: outer_y}) && 
          getHexColor(imgData.data[outer_offset], imgData.data[outer_offset+1], imgData.data[outer_offset+2]) === hex_color &&
          getHexColor(imgData.data[outer_offset-4], imgData.data[outer_offset-3], imgData.data[outer_offset-2]) !== hex_color && 
          getHexColor(imgData.data[outer_offset-(imgData.width*4)], imgData.data[outer_offset-(imgData.width*4)+1], imgData.data[outer_offset-(imgData.width*4)+2]) !== hex_color ){
        
        startX = outer_x;
        startY = outer_y;
      }
      // is pixel on the right lower corner
      else if( !cell.width && 
               getHexColor(imgData.data[outer_offset], imgData.data[outer_offset+1], imgData.data[outer_offset+2]) !== hex_color &&
               getHexColor(imgData.data[outer_offset_last_pos_x], imgData.data[outer_offset_last_pos_x+1], imgData.data[outer_offset_last_pos_x+2]) === hex_color ){
        
        if(!endX)
          endX = outer_x;
        
        // pixel under left has'n got hex_color so it is the last y-end
        if( getHexColor(imgData.data[outer_offset_last_pos_x+(imgData.width*4)-4], imgData.data[outer_offset_last_pos_x+(imgData.width*4)-3], imgData.data[outer_offset_last_pos_x+(imgData.width*4)-2]) !== hex_color ){
          
          if(!cell.width){
            cell.width = endX - startX;
            cell.height = outer_y - startY;
          }
          
        }
      }
      
    }
    
  }
  
  return { startX: startX, startY: startY };
};
  
var getHexColor = function(red,green,blue){
  if(red && green && blue)
    return '#' + red.toString(16) + green.toString(16) + blue.toString(16);
};

var hasArrayGotCoord = function(array,_coord){
  
  var hasGot = false;
  
  array.forEach(function(coord,index){
  
    if(coord.startX === _coord.startX && coord.startY === _coord.startY)
      hasGot = true;
      
  });
  
  if(hasGot)
    return true;
  else
    return false;
};