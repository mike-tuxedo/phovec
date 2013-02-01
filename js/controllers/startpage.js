App.StartpageController = Ember.Controller.extend({
  
  setUpChatroom : function(){

  },
  
  redirectClientToChatroom : function(urlPart){
    App.router.transitionTo('chatroom');
    App.router.location.setURL(urlPart);
  },
  
});