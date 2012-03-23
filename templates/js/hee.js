(function(){
// Create namespace
var heeApp = heeApp || {};

/**
 * Set page state (hashchange)
 * @constructor
**/
heeApp.State = function(callback, main){
  this.current;
  this.params = [];
  
  this.setState();
  
  var self = this;
  window.addEventListener('hashchange', function(e){
    self.setState();
    callback.call(main);
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
    this.u.addClass(this.u.getEl('#contents'), this.state.current);
    this[this.state.current] && this[this.state.current](this.data);   
  },
  master: function(){
    
  },
  
  detail: function(data){
    var u = this.u;
    var current = this.state.current;
    u.log.info('load ' + current);
    var numPage = this.state.params[0];
    var data = this.data.data[numPage];
    u.log.debug(data);
    u.getEl('#detail > h1').innerText = data.title;
    
    // set paging
    u.getEl('#detail > header li:first-child a').href = '/#' + current + '/' + (parseInt(numPage) - 1);
    u.getEl('#detail > header li:last-child a').href = '/#' + current + '/' + (parseInt(numPage) + 1);
    
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
    }
    
    // add login
    if(data.login){
      u.getEl('#detail > .login .id').innerText = data.login[0];
      u.getEl('#detail > .login .password').innerText = data.login[1];
      u.removeClass(u.getEl('#detail > .login'), 'hidden');
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
    var numCurrent = this.state.params[0];
    u.log.info('load ' + this.state.current);
    // load audio
    var audio = new Audio(this.settings.sound);
    audio.load();
    audio.autoplay = false;
    
    // get Count
    var value = parseInt(localStorage.getItem(numCurrent)) || 0;
    u.getEl('#detail .counter').innerText = value;
    
    // initial counter
    var counter = new heeApp.Counter(value);
    
    // connect socket
    var socket = this.socket;
    socket.on('connect', function () {
      // sound on
      socket.on('soundPlay', function () {
        counter.plus();
        var count = counter.getCount();
        u.getEl('#detail > header .counter').innerText = counter.getCount();
        localStorage.setItem(numCurrent, counter.getCount());
        
        audio.currentTime = 0;
        audio.play();
      });
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

