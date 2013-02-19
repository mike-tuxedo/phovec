/**
 * Enables URLs without the # sign - only on server possible!
 */
// App.Router.reopen({
  // location: 'history'
// });

App.Router.map(function() {
  this.route("about", { path: "/about" });
});

App.IndexRoute = Ember.Route.extend({
  model: function() {
    //return App.Chatroom.find();
  }
});
