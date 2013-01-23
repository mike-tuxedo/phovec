var chatroomHash = null;
var userID = null;
var webRTCSockets = [];
var wholeChatroomURL = 'http://localhost:8001/qpt3/phovec/#/chatroom/?';
var clientWebSocket = null;

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia; window.URL = window.URL || window.webkitURL;
