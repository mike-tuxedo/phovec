App.UserView = Ember.View.extend({
  mouseEnter: function(e){
                  $(e.target).animate({opacity:"0.5"});
  },
  mouseLeave: function(e){
      $(e.target).animate({opacity:"0"});
  }
});