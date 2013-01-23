var clientWebSocket = new WebSocket('ws://37.200.99.34:9005');

clientWebSocket.onopen = function(){
  clientWebSocket.send(JSON.stringify({ init: true, url: location.href })); // inform server whether you are host or guest of chatroom
  
};

clientWebSocket.onmessage = function(e){
  
  var message = JSON.parse(e.data);
  
  if(message.init){ // a new client has create chatroom or is invited by someone
  
    chatroomHash = message.chatroom;
    userID = message.userID;
    
    if(message.numberOfGuests){ // not 0 then there are other guests
      createNumberOfWebSockets(message.numberOfGuests);
    }
    else{ // I'm the first and so the host
      webRTCSockets.push( new webkitRTCPeerConnection({ "iceServers": [{ "url": "stun:provserver.televolution.net" },{ "url": "stun:stun1.voiceeclipse.net" }] }) );
    }
  }
  
  
  
};