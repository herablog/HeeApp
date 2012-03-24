// Create namespace
var heeApp = heeApp || {};

(function(){
  
  heeApp.view.screen = function(data){
     var socket = this.socket;
      socket.on('connect', function () {
        socket.on('change', function (d) {
          console.log(d);
          location.hash = '#screen/3';
        });
      });
      
    var self = this;
    var u = this.u;
    var numCurrent = this.state.params[0];
    var counter = {};
    u.log.info('load ' + this.state.current);
    // load audio
    var audio = new Audio(this.settings.sound);
    audio.load();
    audio.autoplay = false;

    // get Count
    var value = parseInt(localStorage.getItem(numCurrent)) || 0;
    u.getEl('#detail .counter').innerText = value;

    // connect socket
    var socket = this.socket;
    socket.on('connect', function () {
      // sound on
      socket.on('soundPlay', function (){
        // state update
        self.state.update();
        var numCurrent = self.state.params[0];
        // initial counter
        var value = parseInt(localStorage.getItem(numCurrent)) || 0;
        var counter = new heeApp.Counter(value);

        // count
        counter.plus();
        var count = counter.getCount();
        u.getEl('#detail > header .counter').innerText = counter.getCount();
        localStorage.setItem(numCurrent, counter.getCount());

        // audio play from start position
        audio.currentTime = 0;
        audio.play();
      });
    });

    this.detail(data);
  }
})();