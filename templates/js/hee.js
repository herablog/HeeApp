// Create namespace
var heeApp = heeApp || {};

(function(){

/**
 * Set page state (hashchange)
 * @constructor
**/
heeApp.State = function(callback, main){
  this.current;
  this.params = [];
  
  this.update();
  
  var self = this;
  window.addEventListener('hashchange', function(e){
    self.update();
    callback.call(main);
  }, false);
};

heeApp.State.prototype = {
  update: function(){
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

})();

