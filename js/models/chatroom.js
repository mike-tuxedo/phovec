App.Chatroom = Ember.Object.extend({
  url: '',
  id : 0,
  boxes : [],
  numberOfBoxes: 0,
  addBox: function(box){
    this.get('boxes').push(box);
  }
});