App.AuthController = Ember.ObjectController.extend({
  
  emailInvitationText: 'USER möchte dich auf Phovec einladen, die Adresse lautet URL.',
  
  // facebook-auth
  
  FB: null, // FB Instance of facebook-loader

  fbLoggedIn: false,

  fbLogin: function() {
    
    var controller = this;
    
    var FB = this.get('FB');

    FB.login(function(response) {
      if (response.authResponse) {
      
        controller.set('fbLoggedIn', true);
        controller.setupFBInfo();

      } else {
        console.log('login in failed', response);
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

    controller.queryFbAPI('/me', function(response) {
      
      var userName = response.first_name + ' ' + response.last_name;
      var hello = response.locale === 'de_DE' ? 'Hallo ' : 'Hello ';

      document.getElementById('userInfo').innerHTML = '<img src="https://graph.facebook.com/'+ response.id +'/picture" width="100" height="100" /> ' +
        '<p>'+ hello + response.first_name + ' ' + response.last_name + '</p>';
      
      controller.queryFbAPI('/me/friends', function(response) {
        
        if($('ul'))
          $('ul').remove();
        

        controller.sortFBEntires(response.data);        
        
        var friendList = document.createElement('ul');
        
        var invitationText = controller.get('emailInvitationText').replace('USER', userName);
        invitationText = invitationText.replace('URL', Location.href);
          
        response.data.forEach(function(friend, index) {
          
          friendList.innerHTML += '<li class="send_fb_message" onclick="App.Controller.auth.sendFbUserMessage(\''+friend.id+'\')"> Sende Facebook-Nachricht an ' + friend.name + '</li>'

          friendList.innerHTML += '<li class="send_mail" onclick="App.Controller.auth.sendMail({ subject:\'Einladungsmail\', from:\'phovec@nucular-bacon.com\', to:\''+friend.id+'@facebook.com\', text:\''+invitationText+'\', html:\'<b>'+invitationText+'</b>\'})"> Sende E-Mail an ' + friend.name + '</li>';
        
        });
        
        document.getElementById('friends').appendChild(friendList);

      });

    });

  },
  
  queryFbAPI: function(query, callback) {

    var FB = this.get('FB');

    FB.api(query, function(response) {

      callback(response);

    });

  },
  
  sortFBEntires : function(entries){
  
    for(var next=1; next < entries.length; next++)
      for(var former=next; former > 0; former--)
        if( entries[former-1].name > entries[former].name ){
          var former_entry = entries[former];
          entries[former] = entries[former-1];
          entries[former-1] = former_entry;
        }
  },
  
  sendFbUserMessage: function(id) {

    var FB = this.get('FB');

    var msg = {};
    msg.to = id;
    msg.method = 'send';
    msg.name = 'Phovec Invitation';
    msg.link = 'http://www.nytimes.com/2011/06/15/arts/people-argue-just-to-win-scholars-assert.html';

    FB.ui(msg, function(response) {

      if (response && response.success) {
        alert('Facebook-Message was sent.');
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
        success: function(resp) {
          
          user = resp;
          
          controller.getUserContacts(function(entries){
            
            if($('ul'))
              $('ul').remove();
              
            var friendList = document.createElement('ul');
            var invitationText = controller.get('emailInvitationText').replace('USER', userName);
            invitationText = invitationText.replace('URL', Location.href);
        
            entries.forEach(function(friend, index) {
            
              friendList.innerHTML += '<li id=' + (friend.name ? 'noname' : friend.name) + ' onclick="App.Controller.auth.sendMail({ subject:\'Einladungsmail\', from: \'phovec@nucular-bacon.com\', to:\''+friend.email+'\', text:\''+invitationText+'\', html:\'<b>'+invitationText+'</b>\'})">' + (friend.name ? friend.name : friend.email) + '</li>';
              
            });

            document.getElementById('friends').appendChild(friendList);
            
          });
          
          controller.set('googleLoggedIn',true);
          
          $('#userInfo').html('Welcome ' + user.name + '<br /><img src=\''+user.picture+"\'/>");
          
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
  
  // email-form
  
  toggleEmailForm: function(){
    $('.email_button').click(
      function(){
        $('#mail_form').click();
      }
    );
    
    $('#mail_form').toggle();
  },
  addMailInfo : function(){
    var addresse = $('#mailAddress').val();
    if(addresse.indexOf('@') !== -1){
      
      var descr = this.get('emailInvitationText').replace('USER', Users.getLocalUser().name);
      descr = descr.replace('URL', location.href);
      
      if($('#mailDescription').val().length){
        descr += ' ' + $('#mailDescription').val();
      }
      
      this.sendMail({ subject:'Einladungsmail', from: 'phovec@nucular-bacon.com', to: addresse, text: descr, html: ('<b>' +descr+'</b>') });
      
    }
    else{
      alert('Bitte gib eine valide E-Mail Adresse ein.')
    }
  },
  sendMail: function(mailSettings) {
    if (mailSettings.from && mailSettings.to && mailSettings.subject && mailSettings.text && mailSettings.html){
      SignalingChannel.send({
        subject: 'mail',
        chatroomHash: Users.users[0].roomHash,
        userHash: Users.users[0].id,
        mail: {
          from: mailSettings.from,
          to: mailSettings.to,
          subject: mailSettings.subject,
          text: mailSettings.text,
          html: mailSettings.html
        }
      });
    }
    else{
      console.log('Auth-Controller sendMail: not enough arguments: ', mailSettings);
    }
  }
});
