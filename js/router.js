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
      enter: function ( router ){
        router.chatroomController.createChatroom();
      },
      connectOutlets:  function(router, context){
        router.get('applicationController').connectOutlet('chatroom');
      }
    })
  })
});