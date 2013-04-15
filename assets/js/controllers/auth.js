App.AuthController = Ember.ObjectController.extend({

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

          friend_list.innerHTML += '<li class="send_mail" onclick="App.Controller.user.sendMail({ subject:\'mail\', from:\'phovec@nucular-bacon.com\', to:\''+friend.id+'@facebook.com\', text:\''+user_name+' möchte dich einladen\', html:\'<b>'+user_name+' möchte dich einladen</b>\'})"> Send e-mail to ' + friend.name + '</li>';
        
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
  
  init: function(){
    var url = this.get('googleOauthURL') + 'scope=' + this.get('googleScope') + '&client_id=' + this.get('googleCliendtId') + '&redirect_uri=' + this.get('googleRedirect') + '&response_type=' + this.get('googleType');
    this.set('googleRequestURL', url);
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
    
    this.set('google_logged_in',false);
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
          
          videoStream = resp;
          
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
