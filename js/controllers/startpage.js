App.StartpageController = Ember.Controller.extend({

  redirectClientToChatroom : function(urlPart){
    App.router.transitionTo('chatroom');
    App.router.location.setURL(urlPart);
  },
  
  createNumberOfWebSockets : function(number){
    for(var w=0; w < number; w++)
      webRTCSockets.push( new webkitRTCPeerConnection({ "iceServers": [{ "url": "stun:provserver.televolution.net" },{ "url": "stun:stun1.voiceeclipse.net" }] }) );
  }
  
});