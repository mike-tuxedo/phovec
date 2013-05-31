var TransferVisualizer = {
  currentPercent: 0,
  update: function(filesize, transferedAmount){
    var percent = Math.floor((transferedAmount / filesize)*100); 
    
    if(percent > this.currentPercent){
      this.currentPercent = percent;
      $('span_text').text("Transfer " + this.currentPercent + "%");
      $('div_white').css("width", 100-this.currentPercent);
    }
  },
  init: function() {
    
  }
};