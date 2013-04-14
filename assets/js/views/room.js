App.RoomView = Ember.View.extend({
  templateName: 'room',
  classNames: ['room-wrapper'],
  sidebar: false,
  showSidebar: function(){
      if(this.sidebar === false){
        $('#social_sidebar_container').animate({ right: '0px'}, { duration: 250, queue: false });
        
        $('#show_sidebar').mouseover(function(){$('#show_sidebar').css('opacity', '1')});
        $('#show_sidebar').mouseout(function(){$('#show_sidebar').css('opacity', '0.3')});
        $('#show_sidebar').val('>');
        this.sidebar = true;
      }
      else{
        $('#social_sidebar_container').animate({ right: '-180px'}, { duration: 250, queue: false });
        
        $('#show_sidebar').mouseout(function(){$('#show_sidebar').css('opacity', '1')});
        $('#show_sidebar').val('<');
        this.sidebar = false;
      }
  },
  hideEffects: function(){
    $('#videoEffects').css('display', 'none');
  }
}); 