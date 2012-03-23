(function(){
// Create namespace
var heeApp = heeApp || {};

/**
 * Set page state (hashchange)
 * @constructor
**/
heeApp.State = function(callback){
  this.current;
  this.params = [];
  
  this.setState();
  
  var self = this;
  window.addEventListener('hashchange', function(e){
    self.setState();
    callback();
  }, false);
};

heeApp.State.prototype = {
  setState: function(){
    var arr = location.hash.split('/');
    this.current = arr[0].substr(1);
    arr.shift();
    this.params = arr;
  }
};

/**
 * Counter
 * @constructor
**/
heeApp.Counter = function(init){
  var count = init || 0;
  this.getCount = function(){
    return count;
  };
  this.setCount = function(num){
    return count += num;
  };
};
heeApp.Counter.prototype = {
  plus: function(interval){
    var num = interval || 1;
    this.setCount(num);
  }
};

// util
heeApp.util = {
  /**
   * add class
   * @public
   * @param {object} DOM element
   * @param {string} class name
  */
  addClass: function(el, str){
    if(!el){ return; }
    var classes = el.className.split(' ');

    for(var i = 0, len = classes.length; i < len; i++){
      if(classes[i] === str){ return; }
    }
    
    if(el.className.length !== 0){
      el.className += ' ' + str;
    } else {
      el.className += str;
    }

  },
  
  /**
   * remove class
   * @public
   * @param {object} DOM element
   * @param {string} class name
  */
  removeClass: function(el, str){
    if(!el || !el.className){ return; }
    var classes = el.className.split(' ');

    for(var i = 0, len = classes.length; i < len; i++){
      if(classes[i] === str){
        classes.splice(i,1);
      }
    }

    el.className = '';

    for(i = 0, len = classes.length; i < len; i++){
      if(i !== len - 1){
        el.className += classes[i] + ' ';  
      } else {
        el.className += classes[i];
      }
    }
  },
  
  log: {
    info: function(data){
      console.log('[Info] ' + data);
    },
    debug: function(data){
      console.log(data);
    }
  },
  
  getEl: function(selector){
    return document.querySelector(selector);
  }
  
};
heeApp.util.getJSON = (function(){
  var xhr;
  xhr = new XMLHttpRequest();
  return function(url, callback){
    xhr.onreadystatechange = function(){
      if (xhr.readyState === 4){
        callback(xhr.responseText, xhr.getResponseHeader("Content-Type"));
      }
    };
    xhr.open('GET', url, true);  
    xhr.send();
  }
})();





heeApp.view = {
  settings: {
    sound: 'sound/he.mp3',
    ws: 'http://127.0.0.1:3000'
  },
  init: function(){
    var self = this;
    this.data;
    this.state = new heeApp.State(heeApp.view.render); // initial state
    this.u = heeApp.util; // initial util
    this.socket = io.connect(this.settings.ws);
    this.u.getJSON('data/data.json', function(data){
      var json = JSON.parse(data);
      self.render(json);
    });
  },
  render: function(data){
    this.data = this.data || data.data;
    console.log(this.data);
    this.u.addClass(this.u.getEl('#contents'), this.state.current);
    this[this.state.current] && this[this.state.current](this.data);
  },
  master: function(){
    
  },
  
  detail: function(data){
        console.log(data);
    var u = this.u;
    var current = this.state.current;
    u.log.info('load ' + current);
    var numPage = this.state.params[0];
    var data = this.data[numPage] || data.data[numPage];
    u.log.debug(data);
    u.getEl('#detail > h1').innerText = data.title;
    
    // set paging
    u.getEl('#detail > header li:first-child a').href = '/#' + current + '/' + (parseInt(numPage) - 1);
    u.getEl('#detail > header li:last-child a').href = '/#' + current + '/' + (parseInt(numPage) + 1);
    
    // add member
    var frame = document.createDocumentFragment();
    data.members.forEach(function(item){
      var el = document.createElement('li');
      el.innerText = item;
      frame.appendChild(el);
    });
    u.getEl('#detail > .members').appendChild(frame);
    
    // add urls
    frame = document.createDocumentFragment();
    data.urls.forEach(function(item){
      var el = document.createElement('li');
      var elA = document.createElement('a');
      elA.innerText = item;
      elA.href = item;
      el.appendChild(elA);
      frame.appendChild(el);
    });
    u.getEl('#detail > .urls').appendChild(frame);
    
    // add auth
    if(data.auth){
      u.getEl('#detail > .auth .id').innerText = data.auth[0];
      u.getEl('#detail > .auth .password').innerText = data.auth[1];
    }
    
    // add login
    if(data.login){
      u.getEl('#detail > .login .id').innerText = data.login[0];
      u.getEl('#detail > .login .password').innerText = data.login[1];
    }

    // add techs
    frame = document.createDocumentFragment();
    data.techs.forEach(function(item){
      var el = document.createElement('li');
      el.innerText = item;
      frame.appendChild(el);
    });
    u.getEl('#detail > .techs').appendChild(frame);
    
    // add description
    u.getEl('#detail > .description').innerText = data.description;
  },
  
  button: function(){
    this.u.log.info('load ' + this.state.current);
    // connect socket
    var socket = this.socket;
    socket.on('connect', function () {
      // sound on
      var el = document.getElementById('btnHee');
      el.addEventListener('click', function(){
        socket.emit('hee');
      }, false);
    });
  },
  screen: function(data){
    var u = this.u;
    u.log.info('load ' + this.state.current);
    // load audio
    var audio = new Audio(this.settings.sound);
    audio.load();
    audio.autoplay = false;
    
    // initial counter
    var counter = new heeApp.Counter();
    
    // connect socket
    var socket = this.socket;
    socket.on('connect', function () {
      // sound on
      socket.on('soundPlay', function () {
        counter.plus();
        u.getEl('#detail > header .counter').innerText = counter.getCount();
        
        audio.currentTime = 0;
        audio.play();
      });
    });
    
    this.detail(data);
  }
};


window.addEventListener('load', function(){
  heeApp.view.init.apply(heeApp.view);
}, false);

})();

