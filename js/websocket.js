var clientWebSocket = new WebSocket('ws://localhost:9001');

clientWebSocket.onopen = function(){
  clientWebSocket.send(JSON.stringify({ client: 'anonymus' }));
};

clientWebSocket.onmessage = function(e){
  
};