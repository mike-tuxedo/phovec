App.AuthView = Ember.View.extend({
  QrCodeTab: function(){
    App.Controller.room.showInvitationQRCode();
  },
  emailTab: function(){
    App.Controller.auth.toggleEmailForm();
  },
  googleTab: function(){
    App.Controller.auth.googleLogin();
  },
  facebookTab: function(){
    App.Controller.auth.fbLogin();
  }
});
