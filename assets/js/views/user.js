App.UserView = Ember.View.extend({
  mouseEnter: function(e){
                  $(e.target).animate({opacity:"0.8"});
  },
  mouseLeave: function(e){
      $(e.target).animate({opacity:"0"});
  }
  click: function(e){
      $(e.target).animate({opacity:"0.8"});
  }
});