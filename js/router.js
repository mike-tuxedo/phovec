/**
 * Enables URLs without the # sign - only on server possible!
 */
// App.Router.reopen({
// location: 'history'
// });

App.Router.map(function() {
  this.route("about", {
    path: "/about"
  });
  this.resource("room", function() {
    this.route("hangup");
  });
  this.route("invitation", {
    path: "/invitation"
  });
});

App.IndexRoute = Ember.Route.extend({

});
App.AboutRoute = Ember.Route.extend({

});
App.RoomIndexRoute = Ember.Route.extend({
  setupController: function(controller, model){
    controller.set('content', App.Room);
  }
});
App.RoomHangupRoute = Ember.Route.extend({

});
App.InivitationRoute = Ember.Route.extend({

}); 