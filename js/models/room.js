App.Room = Ember.Object.extend({
  url: 'room/' + this.get('id'),
  id : 345,
  boxes : [],
  numberOfBoxes: 0,
  addBox: function(box){
    this.get('boxes').push(box);
  }
});