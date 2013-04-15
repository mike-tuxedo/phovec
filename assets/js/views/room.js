App.RoomView = Ember.View.extend({
  templateName: 'room',
  classNames: ['room-wrapper'],
  sidebar: false,
  showSidebar: function(){
      if(this.sidebar === false){
        $('#social_sidebar_container').animate({ right: '0px'}, { duration: 250, queue: false });
        
        $('#show_sidebar').mouseover(function(){$('#show_sidebar').css('opacity', '1')});
        $('#show_sidebar').mouseout(function(){$('#show_sidebar').css('opacity', '0.3')});
        $('#show_sidebar').css('background', 'url("../img/sidebar-arrow-02.png")');
        this.sidebar = true;
      }
      else{
        $('#social_sidebar_container').animate({ right: '-180px'}, { duration: 250, queue: false });
        
        $('#show_sidebar').mouseout(function(){$('#show_sidebar').css('opacity', '1')});
        
        $('#show_sidebar').css("background", "#003366"); 
        $('#show_sidebar').css("background-image", "url(../img/sidebar-arrow-02.png)"); 
        this.sidebar = false;
      }
  },
  hideEffects: function(){
    $('#videoEffects').css('display', 'none');
  }
}); 