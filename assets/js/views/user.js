App.UserView = Ember.View.extend({
  controlEffects: function(){
    $('#videoEffects').css('display', 'block');
    $('#videoEffects').css('margin-top', '0px');
  },
  controlAudio: function(){
    App.Controller.user.controlAudio();
  },
  controlVideo: function(){
    App.Controller.user.controlVideo();
  }
});