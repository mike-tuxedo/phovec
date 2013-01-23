var chatroomHash = null;
var userID = null;
var webRTCSockets = [];


var createNumberOfWebSockets = function(number){
  for(var w=0; w < number; w++)
    webRTCSockets.push( new webkitRTCPeerConnection({ "iceServers": [{ "url": "stun:provserver.televolution.net" },{ "url": "stun:stun1.voiceeclipse.net" }] }) );
};