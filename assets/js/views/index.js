App.IndexView = Ember.View.extend({
  templateName: 'index',
  activeStartImage: false,
  keyUp: function(event) {
    if (event.target === document.getElementById("name")) {
      if (document.getElementById("name").value.length >= 3) {
        document.getElementById("startButtonImage").onmouseover = function() {
          this.style.opacity = 0.8;
        };
        document.getElementById("startButtonImage").onmouseout = function() {
          this.style.opacity = 1;
        };
        document.getElementById("startButtonImage").onclick = function() {
          Users.getLocalUser().name = document.getElementById("name").value;
          App.handleURL('/rooms');
          App.Router.router.replaceURL('/rooms');
        };
        if(this.activeStartImage === false){
          document.getElementById("startButtonImage").style.backgroundImage = "url('assets/img/startbutton.png')";
          this.activeStartImage = true;       
        }

      } else {
        document.getElementById("startButtonImage").onmouseover = null;
        document.getElementById("startButtonImage").onmouseout = null;
        document.getElementById("startButtonImage").onclick = null;
        if(this.activeStartImage === true){
          document.getElementById("startButtonImage").style.backgroundImage = "url('assets/img/startbutton_disabled.png')";
          this.activeStartImage = false;
        }
        
      }
    }
  }
});
