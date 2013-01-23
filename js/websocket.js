var setUpWebSocket = function(){

  clientWebSocket = new WebSocket('ws://37.200.99.34:9005');

  clientWebSocket.onopen = function(){
    clientWebSocket.send(JSON.stringify({ init: true, url: location.href })); // inform server whether you are host or guest of chatroom
  };

  clientWebSocket.onmessage = function(e){ // this event method gets called when nodeJS-server sent message to client
    
    var message = JSON.parse(e.data);
    
    if(message.init){ // a new client has create chatroom or is invited by someone
    
      chatroomHash = message.chatroom;
      userID = message.userID;
      
      if(message.numberOfGuests){ // not 0 then there are other guests
        App.router.chatroomController.createNumberOfWebSockets(message.numberOfGuests);
        App.router.chatroomController.createNumberOfVideoTags(message.numberOfGuests,'userVideoBox');
        App.router.chatroomController.addStreamToVideoTag('userVideoBox0');
      }
      else{ // I'm the first and so the host
        
        webRTCSockets.push( new webkitRTCPeerConnection({ "iceServers": [{ "url": "stun:provserver.televolution.net" },{ "url": "stun:stun1.voiceeclipse.net" }] }) );
        
        var chatroomUrl = '/chatroom/' + chatroomHash;
        App.router.startpageController.redirectClientToChatroom(chatroomUrl);
        
        setTimeout(
          function(){ // no idee why App.router is not available the first milliseconds
            
            var myVideoTagId = 'myVideoBox';
            App.router.chatroomController.createVideoBox(myVideoTagId);
            App.router.chatroomController.addStreamToVideoTag(myVideoTagId);
          
          },
          500
        );
        
      }
    }
    
    
    
  };

};