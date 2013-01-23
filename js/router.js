App.Router = Ember.Router.extend({
  root: Ember.Route.extend({
    index: Ember.Route.extend({
      route: '/',
      enter: function ( router ){
        console.log('index side called');
      },
      connectOutlets:  function(router, context){
        router.get('applicationController').connectOutlet('startpage');
      }
    }),
    chatroom: Ember.Route.extend({
      route: '/chatroom/:hash',
      enter: function ( router ){ // this event method is called only when a guest comes in
      
        if( location.hash.length == 51 ){ // example: "#/chatroom/f037cbc3eafcf7c1cfbe2ddc19fcdbf15f836f73"
          App.router.startpageController.setUpChatroom();
          
        }
        
      },
      connectOutlets:  function(router, context){
        router.get('applicationController').connectOutlet('chatroom');
      }
    })
  })
});