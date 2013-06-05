App.IndexView = Ember.View.extend({
  templateName: 'index',
  activeStartImage: false,
  keyUp: function(event) {
    if (event.target === document.getElementById("startName")) {
      if (document.getElementById("startName").value.length >= 3) {
        document.getElementById("startButtonImage").onmouseover = function() {
          this.style.opacity = 0.8;
        };
        document.getElementById("startButtonImage").onmouseout = function() {
          this.style.opacity = 1;
        };
        document.getElementById("startButtonImage").onclick = function() {
          Users.getLocalUser().name = document.getElementById("startName").value;
          App.handleURL('/rooms');
          App.Router.router.replaceURL('/rooms');
        };
        if(this.activeStartImage === false){
          var startbtn = document.getElementById("startButtonImage");
          startbtn.style.backgroundPositionX = "-352px";
          startbtn.style.cursor = "pointer";
          this.activeStartImage = true;       
        }

      } else {
        document.getElementById("startButtonImage").onmouseover = null;
        document.getElementById("startButtonImage").onmouseout = null;
        document.getElementById("startButtonImage").onclick = null;
        if(this.activeStartImage === true){
          document.getElementById("startButtonImage").style.backgroundPositionX = "0px";
          this.activeStartImage = false;
        }
        
      }
    }
  },
  keyDown: function(event){
    if (event.target === document.getElementById("startName")) {
      if (document.getElementById("startName").value.length >= 15) {
        document.getElementById("startName").value = App.shortenString(document.getElementById("startName").value, 15);
      }
      
      if(event.which === 13){
        document.getElementById("startButtonImage").click();
      }
    }
  }
});
