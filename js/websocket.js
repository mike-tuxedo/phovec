var clientWebSocket = new WebSocket('ws://37.200.99.34:9005');

clientWebSocket.onopen = function(){};

clientWebSocket.onmessage = function(e){
  
  var message = JSON.parse(e.data);
  
  if(message.init){ // a new client has create chatroom or is invited by someone
  
    chatroomHash = message.chatroom;
    userID = message.userID;
    
    if(message.numberOfGuests){ // not 0 then there are other guests
      createNumberOfWebSockets(message.numberOfGuests);
    }
    else{ // I'm the first and so the host
      /*
      var chatroom = App.Chatroom.create();
      chatroom.set('id', (Math.random() * 10000));
      chatroom.set('url', (location.href + '/' + chatroom.get('id')) );
      this.set('chatroom', chatroom);
    */
      var chatroomUrl = '/chatroom/' + chatroomHash;
      redirectClientToChatroom(chatroomUrl);
      webRTCSockets.push( new webkitRTCPeerConnection({ "iceServers": [{ "url": "stun:provserver.televolution.net" },{ "url": "stun:stun1.voiceeclipse.net" }] }) );
    
    }
  }
  
  
  
};