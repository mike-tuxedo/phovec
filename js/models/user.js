App.User = Ember.Object.extend({
  name: null,
  id: null,
  stream: null,
  peerConnection: null,
  // 'local' or 'remote'
  type: null
});