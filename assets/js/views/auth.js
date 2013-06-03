App.AuthView = Ember.View.extend({
  didInsertElement: function(){
    App.Controller.auth.createHiddenTextInput();
  },
  QrCodeTab: function(){
    $('.sidebar_content').css('height', $(window).height() - 30 + 'px');
    //set tab active or inactive
    $('#qr_tab').removeClass('tab_inactive').addClass('tab_active');
    $('#email_tab').removeClass('tab_active').addClass('tab_inactive');
    $('#facebook_tab').removeClass('tab_active').addClass('tab_inactive');
    $('#google_tab').removeClass('tab_active').addClass('tab_inactive');
    //change content of sidebar
    //$('#userInfo').html('');
    $('#qrcode_box').show();
    $('#userInfo').hide();
    $('#friends_of_email').hide();
    $('#friends_of_google').hide();
    $('#friends_of_facebook').hide();
    App.Controller.room.showInvitationQRCode();
  },
  emailTab: function(){
    $('.sidebar_content').css('height', $(window).height() - 30 + 'px');
    $('#email_tab').removeClass('tab_inactive').addClass('tab_active');
    $('#qr_tab').removeClass('tab_active').addClass('tab_inactive');
    $('#facebook_tab').removeClass('tab_active').addClass('tab_inactive');
    $('#google_tab').removeClass('tab_active').addClass('tab_inactive');
    
    $('#qrcode_box').hide();
    $('#userInfo').hide();
    $('#friends_of_email').show();
    $('#friends_of_google').hide();
    $('#friends_of_facebook').hide();
  },
  googleTab: function(){
    $('.sidebar_content').css('height', $(window).height() - 30 + 'px');
    $('#google_tab').removeClass('tab_inactive').addClass('tab_active');
    $('#email_tab').removeClass('tab_active').addClass('tab_inactive');
    $('#facebook_tab').removeClass('tab_active').addClass('tab_inactive');
    $('#qr_tab').removeClass('tab_active').addClass('tab_inactive');
    
    $('#qrcode_box').hide();
    $('#userInfo').hide();
    $('#friends_of_email').hide();
    $('#friends_of_google').show();
    $('#friends_of_facebook').hide();
    App.Controller.auth.googleLogin();
  },
  facebookTab: function(){
    $('.sidebar_content').css('height', $(window).height() - 30 + 'px');
    $('#facebook_tab').removeClass('tab_inactive').addClass('tab_active');
    $('#email_tab').removeClass('tab_active').addClass('tab_inactive');
    $('#qr_tab').removeClass('tab_active').addClass('tab_inactive');
    $('#google_tab').removeClass('tab_active').addClass('tab_inactive');
    
    $('#qrcode_box').hide();
    $('#userInfo').hide();
    $('#friends_of_email').hide();
    $('#friends_of_google').hide();
    $('#friends_of_facebook').show();
    App.Controller.auth.fbLogin();
  }
});
