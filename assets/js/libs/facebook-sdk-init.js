window.fbAsyncInit = function() {

  FB.init({
    appId: '324301331025901',
    channelUrl: 'http://phovec.nucular-bacon.com/#/room',
    status: true,
    cookie: true,
    xfbml: true
  });
  
  App.Controller.auth.set('FB', FB);
  
};