App.AuthController = Ember.ObjectController.extend({

  init: function() {
    var url = this.get('google_Oauth_URL') + 'scope=' + this.get('google_Scope') + '&client_id=' + this.get('google_CliendtId') + '&redirect_uri=' + this.get('google_Redirekt') + '&response_type=' + this.get('google_Type');
    this.set('google_Request_URL', url);
  },
  
  // facebook-auth
  
  FB: null, // FB Instance of facebook-loader

  fb_logged_in: false,

  fbLogin: function() {

    var controller = this;

    var FB = this.get('FB');

    FB.login(function(response) {
      if (response.authResponse) {
      
        controller.set('fb_logged_in', true);
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
  
    this.set('fb_logged_in', false);
  },
  
  setupFBInfo: function() {

    var controller = this;

    controller.queryFbAPI('/me', function(response) {
      
      var user_name = response.first_name + ' ' + response.last_name;
      var hello = response.locale === 'de_DE' ? 'Hallo ' : 'Hello ';

      document.getElementById('userInfo').innerHTML = '<img src="https://graph.facebook.com/'+ response.id +'/picture" width="100" height="100" /> ' +
        '<p>'+ hello + response.first_name + ' ' + response.last_name + '</p>';
      
      controller.queryFbAPI('/me/friends', function(response) {
        
        if($('ul'))
          $('ul').remove();
        

        controller.sortFBEntires(response.data);        
        
        var friend_list = document.createElement('ul');
        
        response.data.forEach(function(friend, index) {
        
          friend_list.innerHTML += '<li class="send_fb_message" onclick="App.Controller.auth.sendFbUserMessage(\''+friend.id+'\')"> Send Facebook-Message to ' + friend.name + '</li>'

          if(friend.email)
            friend_list.innerHTML += '<li class="send_mail" onclick="App.Controller.user.sendMail({ subject:\'mail\', from:\'phovec@nucular-bacon.com\', to:\''+friend.email+'\', text:\''+user_name+' möchte dich einladen\', html:\'<b>'+user_name+' möchte dich einladen</b>\'})"> Send e-mail to ' + friend.name + '</li>';
        
        });
        
        document.getElementById('friends').appendChild(friend_list);

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
  
  google_Oauth_URL : 'https://accounts.google.com/o/oauth2/auth?',
  google_Valid_URL : 'https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=',
  google_Scope : 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.google.com/m8/feeds/',
  google_CliendtId : '186949140302.apps.googleusercontent.com',
  google_Redirekt : 'http://phovec.nucular-bacon.com/',
  google_Logout : 'http://accounts.google.com/Logout',
  google_Type : 'token',
  google_Request_URL : null,
  
  google_logged_in : false,
  
  googleLogin: function(){
    
    var controller = this;
    var win = window.open(this.get('google_Request_URL'), "Google-Login", 'width=400, height=300');
    
    var pollTimer = window.setInterval(function() {
    
      if( win.document && win.document.URL.indexOf( controller.get('google_Redirekt') ) != -1 ){
      
        window.clearInterval(pollTimer);
        
        var url =   win.document.URL;
        acToken =   controller.getUrlAttributes(url, 'access_token');
        tokenType = controller.getUrlAttributes(url, 'token_type');
        expiresIn = controller.getUrlAttributes(url, 'expires_in');
        win.close();

        controller.checkValidateToken(acToken);
        
      }
      else
        console.log('error happend while executing googleLogin');
        
    }, 500);
        
  },
  
  googleLogout: function(){
    $('#userInfo').html('');
    $('#friends').html('');
    
    this.set('google_logged_in',false);
  },
  
  checkValidateToken : function(token) {
    var controller = this;
    $.ajax({
        url: this.get('google_Valid_URL') + token,
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
              
            var friend_list = document.createElement('ul');
        
            entries.forEach(function(friend, index) {
            
              friend_list.innerHTML += '<li id=' + (friend.name ? 'noname' : friend.name) + ' onclick="App.Controller.user.sendMail({ subject:\'mail\', from: \'phovec@nucular-bacon.com\', to:\''+friend.email+'\', text:\''+user.name+' möchte dich einladen\', html:\'<b>'+user.name+' möchte dich einladen</b>\'})">' + (friend.name ? friend.name : friend.email) + '</li>';
              
            });

            document.getElementById('friends').appendChild(friend_list);
            
          });
          
          controller.set('google_logged_in',true);
          
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
  }
  
});
