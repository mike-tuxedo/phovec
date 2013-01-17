var App = Ember.Application.create({
  ready: function(){
    console.log('ready called');
  }
});

App.ApplicationController = Ember.Controller.extend();

App.ApplicationView = Ember.View.extend({
  templateName: 'application'
});


/* Startpage */

App.StartpageController = Ember.Controller.extend({
  
});

App.StartpageView = Ember.View.extend({
  templateName : 'startpage',
  //contentBinding: 'StartpageController', when a property of StartpageController changes the StartpageView refreshes side
  controller: App.StartpageController
});


/* chatroom */

App.ChatroomController = Ember.Controller.extend({
  chatroomIds : [0],
  enter: function(){
    console.log('ChatrromController enter called');
  },
  createChatroom : function(event){
    
    var chatRoomIds = this.get('chatroomIds');
    var newChatroom = App.Chatroom.create();
    newChatroom.set('id',chatRoomIds[chatRoomIds.length-1]);
    this.set('chatroomIds', (chatRoomIds[chatRoomIds.length-1] + 1) );
    // ...other work to do
    
    //App.router.transitionTo('chatroom');
  }
});

App.ChatroomView = Ember.View.extend({
  templateName : 'chatroom'
});


/* videobox */

App.VideoboxController = Ember.Controller.extend({
  
});

App.VideoboxView = Ember.View.extend({
  templateName : 'videobox'
});


App.Router = Ember.Router.extend({
  root: Ember.Route.extend({
    index: Ember.Route.extend({
      route: '/',
      enter: function ( router ){
        console.log('a new client has come to the side');
      },
      connectOutlets:  function(router, context){
        router.get('applicationController').connectOutlet('startpage');
      }
    }),
    chatroom: Ember.Route.extend({
      route: '/chatroom',
      enter: function ( router ){
        console.log('a new client has come to the chatroom 1');
      },
      connectOutlets:  function(router, context){
        router.get('applicationController').connectOutlet('chatroom');
      }
    })
  })
})




App.initialize();
