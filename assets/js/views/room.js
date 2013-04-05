App.RoomView = Ember.View.extend({
  templateName: 'room',
  sidebar: false,
  showSidebar: function(){
      if(this.sidebar === false){
        $('#social_sidebar').animate({ right: '0px'}, { duration: 250, queue: false });
        $('#show_sidebar').animate({ right: '165px'}, { duration: 250, queue: false });
        this.sidebar = true;
        console.log('intervalID in view: ' + this.get('animationInterval'));
        this.get("controller").send("animation", "stop");  
      }
      else{
        $('#social_sidebar').animate({ right: '-190px'}, { duration: 250, queue: false });
        $('#show_sidebar').animate({ right: '-25px'}, { duration: 250, queue: false });
        this.sidebar = false;
      }
    }
}); 