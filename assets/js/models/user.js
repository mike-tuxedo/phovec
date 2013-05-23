App.User = Ember.Object.extend({
  name: null,
  id: null,
  stream: null,
  peerConnection: null,
  // should only be set to 'local' or 'remote'
  type: null
});