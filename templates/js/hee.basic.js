// Create namespace
var heeApp = heeApp || {};

(function(){
  
heeApp.view = {
  settings: {
    sound: ['sound/he.mp3', 'sound/onara.mp3'],
    ws: 'http://ec2-54-248-9-204.ap-northeast-1.compute.amazonaws.com',
    onaraInterval: 20
  },
  init: function(){
    var self = this;
    this.data;
    this.state = new heeApp.State(this.render, this); // initial state
    this.u = heeApp.util; // initial util
    this.socket = io.connect(this.settings.ws); // initial socket.io

    this.u.getJSON('data/data.json', function(data){
      var json = JSON.parse(data);
      self.data = json;
      self.render(json);
    });

  },
  render: function(){
    var u = this.u;
    var state = this.state;
    if(u.isiPhone() || u.isAndroid()){
      // state.current = 'button';
      location.hash = '#button';
    }
    u.addClass(u.getEl('#contents'), state.current);
    this[state.current] && this[state.current](this.data);
  },
  
  master: function(data){
    var self = this;
    var u = self.u;
    var socket = self.socket;
    socket.on('connect', function(){
      u.addClass(u.getEl('#contents'), 'connected');
      u.getEl('#paging').addEventListener('click', function(e){
        if(e.target.parentNode.className === 'back'){
          socket.emit('changePage', parseInt(self.state.params[0]) - 1);
        } else {
          socket.emit('changePage', parseInt(self.state.params[0]) + 1);
        }
      }, false);
    });
    // disconnect
    socket.on('disconnect', function(data) {
      u.removeClass(u.getEl('#contents'), 'connected');
    });
    this.summary(data);
    this.screen(data);
  },

  detail: function(data){
    var u = this.u;    
    var current = this.state.current;
    u.log.info('load ' + current);
    var numPage = parseInt(this.state.params[0]);
    var data = this.data.data[numPage];
    u.log.debug(data);
    u.getEl('#detail > h1').innerText = data.title;

    // set paging
    if(numPage === 0){
      u.addClass(u.getEl('#paging li:first-child'), 'hidden');
    } else {
      u.removeClass(u.getEl('#paging li:first-child'), 'hidden');
      u.getEl('#paging li:first-child a').href = '/#' + current + '/' + (parseInt(numPage) - 1);
    }
    if(numPage === (this.data.data.length - 1)){
      u.addClass(u.getEl('#paging .next'), 'hidden');
    } else {
      u.removeClass(u.getEl('#paging .next'), 'hidden');
      u.getEl('#paging .next a').href = '/#' + current + '/' + (parseInt(numPage) + 1);
    }


    // add member
    var parent = u.getEl('#detail > .members');
    parent.innerHTML = '';
    var frame = document.createDocumentFragment();
    data.members.forEach(function(item){
      var el = document.createElement('li');
      el.innerText = item;
      frame.appendChild(el);
    });
    parent.appendChild(frame);

    // add urls
    parent = u.getEl('#detail > .urls');
    parent.innerHTML = '';
    if(data.urls){
      frame = document.createDocumentFragment();
      data.urls.forEach(function(item){
        var el = document.createElement('li');
        var elA = document.createElement('a');
        elA.innerText = item;
        elA.href = item;
        el.appendChild(elA);
        frame.appendChild(el);
      });
      parent.appendChild(frame);
    }

    // add auth
    if(data.auth){
      u.getEl('#detail > .auth .id').innerText = data.auth[0];
      u.getEl('#detail > .auth .password').innerText = data.auth[1];
      u.removeClass(u.getEl('#detail > .auth'), 'hidden');
    } else {
      u.addClass(u.getEl('#detail > .auth'), 'hidden');
    }

    // add login
    if(data.login){
      u.getEl('#detail > .login .id').innerText = data.login[0];
      u.getEl('#detail > .login .password').innerText = data.login[1];
      u.removeClass(u.getEl('#detail > .login'), 'hidden');
    } else {
      u.addClass(u.getEl('#detail > .login'), 'hidden');
    }

    // add techs
    parent = u.getEl('#detail > .techs');
    parent.innerHTML = '';
    frame = document.createDocumentFragment();
    data.techs.forEach(function(item){
      var el = document.createElement('li');
      el.innerText = item;
      frame.appendChild(el);
    });
    parent.appendChild(frame);

    // add description
    u.getEl('#detail > .description').innerText = data.description;
  },

  button: function(){
    var u = this.u;
    u.log.info('load ' + this.state.current);
    // connect socket
    var socket = this.socket;
    socket.on('connect', function () {
      u.addClass(u.getEl('#contents'), 'connected');
      // sound on
      var el = document.getElementById('btnHee');
      el.addEventListener('click', function(){
        socket.emit('hee');
      }, false);
    });
    // disconnect
    socket.on('disconnect', function(data) {
      u.removeClass(u.getEl('#contents'), 'connected');
    });
  },
  
  screen: function(data){
    var self = this;
    var u = this.u;
    var numCurrent = this.state.params[0];
    var counter = {};
    u.log.info('load ' + this.state.current);
    
    // load audio
    var audio = [];
    self.settings.sound.forEach(function(data){
      var sound = new Audio(data);
      sound.load();
      sound.autoplay = false;
      audio.push(sound);
    });


    // get Count
    var value = parseInt(localStorage.getItem(numCurrent)) || 0;
    u.getEl('#counter').innerText = value;

    // connect socket
    var socket = self.socket;
    var state = self.state;
    socket.on('connect', function(){
      u.addClass(u.getEl('#contents'), 'connected');
      socket.on('changePage', function(d){
        var num = d || state.params[0];
        location.hash = '#' + state.current + '/' + num;
      });
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
        u.getEl('#counter').innerText = counter.getCount();
        localStorage.setItem(numCurrent, counter.getCount());

        // load audio
        if(counter.getCount() % self.settings.onaraInterval){
          var num = 0;
        } else {
          var num = 1;
        }
        // audio play from start position
        audio[num].currentTime = 0;
        audio[num].play();
      });
    });
    
    // disconnect
    socket.on('disconnect', function(data) {
      u.removeClass(u.getEl('#contents'), 'connected');
    });

    this.detail(data);
  },

  summary: function(data){
    var u = this.u;
    var parent = u.getEl('#summary table');
    var frame = document.createDocumentFragment();

    for(var i = 0, len = data.data.length; i < len; i +=1){
      var tr = document.createElement('tr');
      var th = document.createElement('th');
      var td = document.createElement('td');
      th.innerText = data.data[i].members.join(', ');
      tr.appendChild(th);
      td.innerText = localStorage.getItem(i) || 0;
      tr.appendChild(td);
      frame.appendChild(tr);
    }
    parent.appendChild(frame);
  }
};


window.addEventListener('load', function(){
  heeApp.view.init.apply(heeApp.view);
}, false);
  
  
})();