App.RoomView = Ember.View.extend({
  templateName: 'room',
  showSidebar: function(){
      $('#social_sidebar').animate({ right: '0px'}, 250);
      this.get("controller").send("stopAnimation");
    }
}); 