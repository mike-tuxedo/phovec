App.AuthController = Ember.ObjectController.extend({
  templateName: '_auth',
  init: function() {
    App.Controller.auth = this;
  },
  FB: null, // FB Instance of facebook-loader

  fb_logged_in: false,

  fbLogin: function() {

    var controller = this;

    var FB = this.get('FB');

    FB.login(function(response) {
      if (response.authResponse) {
        console.log('login in successfully', response);
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

    this.set('fb_logged_in', false);

    $('#fbUserInfo').html('');
    $('#fbFriends').html('');
  },
  setupFBInfo: function() {

    var controller = this;

    controller.queryFbAPI('/me', function(response) {

      var hello = response.locale === 'de_DE' ? 'Hallo ' : 'Hello ';
      document.getElementById('fbUserInfo').innerHTML = '<img src="https://graph.facebook.com/' + response.id + '/picture" width="100" height="100" /> ' + '<p>' + hello + response.first_name + ' ' + response.last_name + '</p>';

      controller.queryFbAPI('/me/friends', function(response) {

        var friend_list = document.createElement('ul');
        response.data.forEach(function(friend, index) {
          friend_list.innerHTML += '<li id=' + friend.id + ' onclick="App.Controller.auth.sendFbUserMessage(' + friend.id + ')">' + friend.name + '</li>';
        });
        document.getElementById('fbFriends').appendChild(friend_list);

      });

    });

  },
  queryFbAPI: function(query, callback) {

    var FB = this.get('FB');

    FB.api(query, function(response) {

      callback(response);

    });

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

  }
});
