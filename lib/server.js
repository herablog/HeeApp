var express = require('express');
var io = require('socket.io');

var app = module.exports = express.createServer();

app.listen(5000);
console.log("Express server listening on port %d", app.address().port)

var socket = io.listen(app);

// Connect
socket.on('connection', function(client){
  console.log('Connect: ' + client);
  
  // on message
  client.on('message', function(message){
    console.log(message);
  });
  
  // disconnect
  client.on('disconnect', function(){
    
  });
});
