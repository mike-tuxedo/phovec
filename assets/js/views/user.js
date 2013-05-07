App.UserView = Ember.View.extend({
  mouseEnter: function(e){
      //$('.videoOptions').css('opacity','0.9');
  },
  mouseLeave: function(e){
      //$('.videoOptions').css('opacity','0');
  },
  controlEffects: function(){
    $('#videoEffects').css('display', 'block');
    $('#videoEffects').css('margin-top', '0px');
  },
  controlAudio: function(){
    console.log('audiocontrol');
    //App.Controller.user.controlAudio();
  },
  controlVideo: function(){
    console.log('videocontrol');
    //App.Controller.user.controlVideo();
  }
});