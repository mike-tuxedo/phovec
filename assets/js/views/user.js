App.UserView = Ember.View.extend({
  mouseEnter: function(e){
      $('.videoOptions').css('opacity','0.9');
  },
  mouseLeave: function(e){
      $('.videoOptions').css('opacity','0');
  },
  showEffects: function(){
    $('#videoEffects').css('display', 'block');
    $('#videoEffects').css('margin-top', '0px');
  },
  muteAudio: function(){
    this.get('muteAudio');
  },
  hideVideo: function(){
    this.get('controller').send('hideVideo');
  }
});