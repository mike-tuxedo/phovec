App.RoomView = Ember.View.extend({
  templateName: 'room',
  classNames: ['room-wrapper'],
  sidebar: false,
  showSidebar: function(){
      if(this.sidebar === false){
        $('#social_sidebar').animate({ right: '0px'}, { duration: 250, queue: false });
        $('#show_sidebar').animate({ right: '155px', opacity: '0.3'}, { duration: 250, queue: false });
        $('#show_sidebar_shadow').animate({ right: '155px'}, { duration: 250, queue: false });
        
        $('#show_sidebar').mouseover(function(){$('#show_sidebar').css('opacity', '1')});
        $('#show_sidebar').mouseout(function(){$('#show_sidebar').css('opacity', '0.3')});
        $('#show_sidebar').val('>');
        this.sidebar = true;
      }
      else{
        $('#social_sidebar').animate({ right: '-190px'}, { duration: 250, queue: false });
        $('#show_sidebar').animate({ right: '-35px'}, { duration: 250, queue: false });
        $('#show_sidebar_shadow').animate({ right: '-35px'}, { duration: 250, queue: false });
        
        $('#show_sidebar').mouseout(function(){$('#show_sidebar').css('opacity', '1')});
        $('#show_sidebar').val('<');
        this.sidebar = false;
      }
  },
  hideEffects: function(){
    $('#videoEffects').css('display', 'none');
  }
}); 