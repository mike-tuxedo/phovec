describe("room-controller helper-methods tests", function() {
  
  var room = App.RoomController.create();
  
  it('should return true when word matches', function(){
    
    var speakOrder = 'Sprachbefehl Video an';
    
    expect(true).toEqual( room.doesContainWord(speakOrder,'Sprachbefehl') );
    expect(true).toEqual( room.doesContainWord(speakOrder,'Video') );
    expect(true).toEqual( room.doesContainWord(speakOrder,'an') );
    expect(false).toEqual( room.doesContainWord(speakOrder,'aus') );
    
  });
  
  it('should shorten string', function(){
    
    var name = 'Roger Federer';
    
    var shortenName = App.shortenString(name, 5);
    expect('Roger').toEqual( shortenName );
    
  });
  
});


describe("client-server connection-tests", function() {
  
  var hostWebSocket = new WebSocket('ws://www.nucular-bacon.com:49152');
  var hostHash = '';
  var roomHash = '';
  var done = false;
  
  it('should get an init-message by connecting to the server as host', function(){
    
    hostWebSocket.onopen = function(){
    
      hostWebSocket.onmessage = function(m) {
        
        var data = JSON.parse(m.data);
        
        expect(40).toEqual( data.roomHash.length );
        expect(typeof '').toEqual( typeof data.roomHash );
        
        hostHash = data.userHash;
        roomHash = data.roomHash;
        
        hostWebSocket.onmessage = null;
        
        hostWebSocket.send(JSON.stringify({
          subject: "init:user",
          roomHash: roomHash,
          userHash: hostHash,
          put: { name: 'John' }
        }));
        
        done = true;
        
      };
      
      hostWebSocket.send(JSON.stringify({
        subject: "init:room",
        url: 'localhost/#/rooms' // host
      }));
      
    };
    
  });
  
  waitsFor(function() {return done;}, 5000);
  done = false;
  
  it('should get an init-message by connecting to the server as guest', function(){
    
    var guestWebSocket = new WebSocket('ws://www.nucular-bacon.com:49152');
    
    guestWebSocket.onopen = function(){
    
      guestWebSocket.onmessage = function(m) {
          
        var data = JSON.parse(m.data);
        
        if(data.subject !== 'participant:join'){
        
          expect(hostHash).toEqual( data.users[0].id );
          expect(40).toEqual( data.userHash.length );
          expect(typeof '').toEqual( typeof data.userHash );
          guestWebSocket.onmessage = null;
          
          guestWebSocket.close();
          
          setTimeout(function(){ hostWebSocket.close() },500);
          
          done = true;
          
        }
        
      };
      
      guestWebSocket.send(JSON.stringify({
        subject: "init:room",
        url: ('localhost/#/room/'+roomHash) // guest
      }));
    
    };
    
  });
  
  waitsFor(function() {return done;}, 5000);
  
});
