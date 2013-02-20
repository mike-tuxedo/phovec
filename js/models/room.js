App.Room = Ember.Object.extend({
  url: '',
  id : 345,
  boxes : [],
  numberOfBoxes: 0,
  addBox: function(box){
    this.get('boxes').push(box);
  }
});