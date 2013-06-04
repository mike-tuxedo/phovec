App.AuthController = Ember.ObjectController.extend({
  
  hiddenFieldCreated: false,
  
  shortEmailDesc: function(){
    var shortDesc = this.get('emailDesc');
    shortDesc = App.shortenString(shortDesc,160);
    this.set('emailAddress','');
    this.set('emailDesc','');
    return shortDesc;
  }.property('emailDesc'),
  
  // Honeypot Captcha to avoid bad-robots
  createHiddenTextInput: function(){
    
    if( this.get('hiddenFieldCreated') ){
      return;
    }
    
    // this invisible text-field is for bots that want to send a mail message 
    // when a bot fills it out the mail message is not sent
    var textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.id = "humanField";
    textInput.style.display = 'none';
    textInput.value = '';
    $('#mail_form').append(textInput);
    
    this.set('hiddenFieldCreated', true);
  },
  
  // do not change reserved words: USER, URL
  emailInvitationText: 'USER möchte dich auf Phovec einladen, die Adresse lautet URL',
  
  // facebook-auth
  
  FB: null, // FB Instance of facebook-loader

  fbLoggedIn: false,

  fbLogin: function() {
    
    var controller = this;
    
    var FB = this.get('FB');
    
    FB.getLoginStatus(function(response) {
    
      if (response.status === 'connected') {
        controller.setupFBInfo();
      } 
      else if (response.status === 'not_authorized') {
        alert('You are not authorized logging in by facebook-account');
      } 
      else {
        FB.login(function(response) {
          if (response.authResponse) {
            controller.setupFBInfo();
          } else {
            console.log('login in failed due to: ', response);
          }
        });
      }
    });
    
  },
  
  fbLogout: function() {
    var FB = this.get('FB');
    
    FB.logout();

    $('#userInfo').html('');
    $('#friends').html('');
  
    this.set('fbLoggedIn', false);
  },
  
  setupFBInfo: function() {

    var controller = this;
    
    controller.set('fbLoggedIn', true);
    
    controller.queryFbAPI('/me', function(response) {
      
      var userName = response.first_name + ' ' + response.last_name;
      var hello = response.locale === 'de_DE' ? 'Hallo ' : 'Hello ';

      document.getElementById('userInfo').innerHTML = '<img src="https://graph.facebook.com/'+ response.id +'/picture" width="100" height="100" /> ' +
        '<p>'+ hello + response.first_name + ' ' + response.last_name + '</p>';
      
      controller.queryFbAPI('/me/friends', function(response) {
        
        if($('ul'))
          $('ul').remove();
        

        controller.sortFBEntries(response.data);        
        controller.setFBMailAttributes(response.data);  
        
        var friendList = document.createElement('ul');
        
        var invitationText = controller.get('emailInvitationText').replace('USER', userName);
        invitationText = invitationText.replace('URL', location.href);
        
        response.data.forEach(function(friend, index) {
          
          friendList.innerHTML += '<li class="send_fb_message" onclick="App.Controller.auth.sendFbUserMessage(\''+friend.id+'\')"> Facebook-Nachricht an ' + friend.name + '</li>'

          friendList.innerHTML += '<li class="send_mail" onclick="App.Controller.auth.sendMail({ subject:\'Einladungsmail\', from:\'phovec@nucular-bacon.com\', to:\''+friend.email+'\', cc: \''+friend.id+'@facebook.com\', text:\''+invitationText+'\', html:\'<h3>'+invitationText+'</h3>\'})"> Facebook-E-Mail an ' + friend.name + '</li>';
        
          friendList.innerHTML += '<hr>';
        });

        document.getElementById('friends_of_facebook').appendChild(friendList);

      });

    });

  },
  
  queryFbAPI: function(query, callback) {

    var FB = this.get('FB');

    FB.api(query, function(response) {

      callback(response);

    });

  },
  
  sortFBEntries : function(entries){
  
    for(var next=1; next < entries.length; next++){
      for(var former=next; former > 0 && entries[former-1].name > entries[former].name; former--){
      
        var former_entry = entries[former];
        entries[former] = entries[former-1];
        entries[former-1] = former_entry;
        
      }
    }
    
  },

  setFBMailAttributes : function(entries){
    for(var e=0; e < entries.length; e++){
      var wholeName = entries[e].name.split(' ');
      var firstName = wholeName[0].toLowerCase();
      var secondName = wholeName.length > 2 ? wholeName.splice(1,wholeName.length).join('.').toLowerCase() : wholeName[1].toLowerCase();
      entries[e].email = firstName + '.' + secondName + '@facebook.com';
    }
  },
  
  sendFbUserMessage: function(id) {

    var FB = this.get('FB');
    
    var msg = {};
    msg.to = id;
    msg.method = 'send';
    msg.name = 'Phovec Einladung';
    msg.link = location.href;
    msg.description = ('Ein Freund möchte dich auf Phovec einladen! Deine Einladungsadresse lautet: ' + location.href);
    msg.caption = 'invisible text';
    
    FB.ui(msg, function(response) {

      if (response && response.success) {
        $('.confirm_send').fadeIn('slow');
        setTimeout(function(){ $('.confirm_send').fadeOut('slow');}, 2000);
      } else {
        alert('Facebook-Message was not sent.');
      }

    });
  },
  
  // google-auth
  
  init: function(){
    var requestURL = this.get('googleOauthURL') + 'scope=' + this.get('googleScope') + '&client_id=' + this.get('googleCliendtId') + '&redirect_uri=' + this.get('googleRedirect') + '&response_type=' + this.get('googleType');
    this.set('googleRequestURL', requestURL);
  },
  
  googleOauthURL : 'https://accounts.google.com/o/oauth2/auth?',
  googleValidURL : 'https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=',
  googleScope : 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.google.com/m8/feeds/',
  googleCliendtId : '186949140302.apps.googleusercontent.com',
  googleRedirect : 'http://phovec.nucular-bacon.com/',
  googleType : 'token',
  googleRequestURL : null,
  
  googleLoggedIn : false,
  
  googleLogin: function(){
    
    var controller = this;
    var win = window.open(this.get('googleRequestURL'), "Google-Login", 'width=400, height=300');
    
    var timeout = 30000;
    var timePast = 0;
    
    var pollTimer = setInterval(function() {
    
      if( win.document && win.document.URL.indexOf( controller.get('googleRedirect') ) != -1 ){
      
        clearInterval(pollTimer);
        
        var url =   win.document.URL;
        acToken =   controller.getUrlAttributes(url, 'access_token');
        tokenType = controller.getUrlAttributes(url, 'token_type');
        expiresIn = controller.getUrlAttributes(url, 'expires_in');
        win.close();

        controller.checkValidateToken(acToken);
        
      }
      else
        console.log('AuthController GoogleLogin: error happend');
      
      if(timePast > timeout){
        clearInterval(pollTimer);
        win.close();
      }
      
      timePast += 500;
      
    }, 500);
        
  },
  
  googleLogout: function(){
    $('#userInfo').html('');
    $('#friends').html('');
    
    this.set('googleLoggedIn',false);
  },
  
  checkValidateToken : function(token) {
    var controller = this;
    $.ajax({
        url: this.get('googleValidURL') + token,
        data: null,
        success: function(responseText){
            controller.setupGoogleInfo();
        },
        dataType: "jsonp"
    });
  },
  
  setupGoogleInfo : function() {
  
    var controller = this;
    
    $.ajax({
        url: 'https://www.googleapis.com/oauth2/v1/userinfo?access_token=' + acToken,
        data: null,
        success: function(response) {
          
          videoStream = response;
          
          controller.getUserContacts(function(entries){
            
            if($('ul'))
              $('ul').remove();
              
            var friendList = document.createElement('ul');
            var invitationText = controller.get('emailInvitationText').replace('USER', response.name);
            invitationText = invitationText.replace('URL', location.href);
        
            entries.forEach(function(friend, index) {
  
              friendList.innerHTML += '<li id=' + (friend.name ? 'noname' : friend.name) + ' onclick="App.Controller.auth.sendMail({ subject:\'Einladungsmail\', from: \'phovec@nucular-bacon.com\', to:\''+friend.email+'\', text:\''+invitationText+'\', html:\'<h3>'+invitationText+'</h3>\'})">' + (friend.name ? friend.name : friend.email) + '</li>';
              
              friendList.innerHTML += '<hr>'
            });

            document.getElementById('friends_of_google').appendChild(friendList);
            
          });
          
          controller.set('googleLoggedIn',true);
          
          $('#userInfo').html('Welcome ' + response.name + '<br /><img src=\''+response.picture+"\'/>");
          
        },
        dataType: "jsonp"
    });
    
  },
  
  getUserContacts : function(callback) {
    
    $.ajax({
        url: 'https://www.google.com/m8/feeds/contacts/default/full?access_token=' + acToken,
        data: null,
        success: function(resp) {
          
          var xmlDoc = $.parseXML( resp );
          var xml = $( xmlDoc );
          
          var entries = [];
          
          xml.find( "entry" ).each(function(index, value){
              
              var entry = {};
              
              $(value).find( "title" ).each(function(index, value){
                
                if( $(value).text().length > 2 )
                  entry.name = $(value).text();
                 
              });
              
              $(value).find( "email" ).each(function(index, value){
                
                if( $(value).attr('address').length > 2 )
                  entry.email = $(value).attr('address');
                  
              });  
              
              entries.push(entry);
              
          });
          
          callback(entries);
          
        },
        dataType: "jsonp"
    });
  },
  
  getUrlAttributes: function(url, name) {
    name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regexS = "[\\#&]"+name+"=([^&#]*)";
    var regex = new RegExp( regexS );
    var results = regex.exec( url );
    if( results == null )
      return "";
    else
      return results[1];
  },
  addMailInfo : function(){
    
    $('#mailFormButton').attr('disabled',true);
    
    var addresse = this.get('emailAddress');
    
    if(addresse.indexOf('@') !== -1 && $('#humanField').val().length === 0 ){ // avoid wrong mail-addresses and robot-attacks
      
      var descr = this.get('emailInvitationText').replace('USER', Users.getLocalUser().name);
      descr = descr.replace('URL', location.href);
      
      var htmlDescr = '<h3>' + descr + '</h3>';
      var textDescr = '\n' + descr;
      
      if(this.get('shortEmailDesc').length){
        htmlDescr += '<p>Nachricht: ' + this.get('shortEmailDesc') + '</p>';
        textDescr += '\nNachricht: ' + this.get('shortEmailDesc');
      }
      
      this.sendMail({ subject:'Einladungsmail', from: 'phovec@nucular-bacon.com', to: addresse, text: textDescr, html: htmlDescr });
    }
    else{
      alert('Bitte gib eine valide E-Mail Adresse ein.')
    }
  },
  
  sendMail: function(mailSettings) {
  
    if (mailSettings.from && mailSettings.to && mailSettings.subject && mailSettings.text && mailSettings.html){
    
      SignalingChannel.send({
        subject: 'mail',
        roomHash: Users.users[0].roomHash,
        userHash: Users.users[0].id,
        mail: {
          from: mailSettings.from,
          to: mailSettings.to,
          subject: mailSettings.subject,
          text: mailSettings.text,
          html: mailSettings.html
        }
      });
      
      $('.confirm_send').fadeIn('slow');
      setTimeout(function(){ $('.confirm_send').fadeOut('slow');}, 2000);
      
      setTimeout(function(){
        $('#mailFormButton').attr('disabled',false);
      },250);
      
    }
    else{
      console.log('Auth-Controller sendMail: not enough arguments: ', mailSettings);
    }
  },
  getQrCode: function(){
    console.log('show qrcode');
  }
});
