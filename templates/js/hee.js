// (function(){
  var audio = new Audio("sound/he.mp3");
    audio.load();
    audio.autoplay = false;
  
var socket = io.connect('http://127.0.0.1:3000');
socket.on('connect', function() {

    
    socket.on('test', function () {
      console.log('test !');
    });
    
    var el = document.getElementById('btnHee');
    el.addEventListener('click', function(){
      socket.emit('hee');
    }, false);
    
  });

  


// })();

