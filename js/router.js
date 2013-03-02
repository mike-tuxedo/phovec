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
    this.resource('room', {
    path: '/room'
  });
  this.route("invitation", {
    path: "/invitation"
  });
}); 