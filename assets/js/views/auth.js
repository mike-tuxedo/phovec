App.AuthView = Ember.View.extend({
  didInsertElement: function(){
    App.Controller.auth.createHiddenTextInput();
  },
  QrCodeTab: function(){
    //set tab active or inactive
    $('#qr_tab').removeClass('tab_inactive').addClass('tab_active');
    $('#email_tab').removeClass('tab_active').addClass('tab_inactive');
    $('#facebook_tab').removeClass('tab_active').addClass('tab_inactive');
    $('#google_tab').removeClass('tab_active').addClass('tab_inactive');
    //change content of sidebar
    //$('#userInfo').html('');
    $('#qrcode_box').show();
    $('#userInfo').hide();
    $('#mail_form').hide();
    $('#friends_of_google').hide();
    $('#friends_of_facebook').hide();
    App.Controller.room.showInvitationQRCode();
  },
  emailTab: function(){
    $('#email_tab').removeClass('tab_inactive').addClass('tab_active');
    $('#qr_tab').removeClass('tab_active').addClass('tab_inactive');
    $('#facebook_tab').removeClass('tab_active').addClass('tab_inactive');
    $('#google_tab').removeClass('tab_active').addClass('tab_inactive');
    
    $('#qrcode_box').hide();
    $('#userInfo').hide();
    $('#mail_form').show();
    $('#friends_of_google').hide();
    $('#friends_of_facebook').hide();
  },
  googleTab: function(){
    $('#google_tab').removeClass('tab_inactive').addClass('tab_active');
    $('#email_tab').removeClass('tab_active').addClass('tab_inactive');
    $('#facebook_tab').removeClass('tab_active').addClass('tab_inactive');
    $('#qr_tab').removeClass('tab_active').addClass('tab_inactive');
    
    $('#qrcode_box').hide();
    $('#userInfo').hide();
    $('#mail_form').hide();
    $('#friends_of_google').show();
    $('#friends_of_facebook').hide();
    App.Controller.auth.googleLogin();
  },
  facebookTab: function(){
    $('#facebook_tab').removeClass('tab_inactive').addClass('tab_active');
    $('#email_tab').removeClass('tab_active').addClass('tab_inactive');
    $('#qr_tab').removeClass('tab_active').addClass('tab_inactive');
    $('#google_tab').removeClass('tab_active').addClass('tab_inactive');
    
    $('#qrcode_box').hide();
    $('#userInfo').hide();
    $('#mail_form').hide();
    $('#friends_of_google').hide();
    $('#friends_of_facebook').show();
    App.Controller.auth.fbLogin();
  }
});
