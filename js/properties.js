var chatroomHash = null;
var userID = null;
var webRTCSockets = [];
var wholeChatroomURL = 'http://localhost:8001/qpt3/phovec/#/chatroom/?';

var createNumberOfWebSockets = function(number){
  for(var w=0; w < number; w++)
    webRTCSockets.push( new webkitRTCPeerConnection({ "iceServers": [{ "url": "stun:provserver.televolution.net" },{ "url": "stun:stun1.voiceeclipse.net" }] }) );
};


var redirectClientToChatroom = function(urlPart){
  App.router.transitionTo('chatroom');
  App.router.location.setURL(urlPart);
}


var sendInitMessagesToServer = function(){
  clientWebSocket.send(JSON.stringify({ init: true, url: location.href })); // inform server whether you are host or guest of chatroom
};