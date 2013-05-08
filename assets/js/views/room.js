﻿App.RoomView = Ember.View.extend({
  templateName: 'room',
  classNames: ['room-wrapper'],
  hideEffects: function(){
    $('#videoEffects').css('display', 'none');
  },
  sidebar: false,
  showSidebar: function(){
      if(this.sidebar === false){
        $('#scrollbar_fix').css('width','400px');
        $('#social_sidebar_container').animate({ right: '0px'}, { duration: 250, queue: false });
        $('#hangupButton').animate({marginRight: '300px'}, { duration: 250, queue: false });
        
        $('#show_sidebar').mouseover(function(){$('#show_sidebar').css('opacity', '1')});
        $('#show_sidebar').mouseout(function(){$('#show_sidebar').css('opacity', '0.3')});
        this.sidebar = true;
      }
      else{
        $('#social_sidebar_container').animate({ right: '-300px'}, { duration: 250, queue: false });
        $('#hangupButton').animate({marginRight: '0px'}, { duration: 250, queue: false });
        $('#scrollbar_fix').css('width','100px');
        
        $('#show_sidebar').mouseout(function(){$('#show_sidebar').css('opacity', '1')});
        this.sidebar = false;
      }
  }
}); 