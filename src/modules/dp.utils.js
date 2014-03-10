var utils = {
  /**
   * Add or remove the css class "show" from a DOM element
   * @param {object}  elm  - A DOM element 
   */
  toggle: function(elm) {
    if (elm.classList.contains("show")) {
      elm.classList.remove('show');
    } else {
      elm.classList.add('show');
    }
  },
  
  /**
   * simple toggler to add/remove a class that uses CSS3 transition to show/hide an element
   * @param  {string}   handler 
   * @param  {string}   targ
   */
  toggler: function(handler,targ) {
    var self = this;
    var elm = document.getElementById(targ);
    document.getElementById(handler).addEventListener('click',function(e){
      self.toggle(elm);
    },false);
  },

  /**
    * gets the hostname from a URL string
    * @param  {string}  a full url
    * @return {string}
    */
  getHostname: function(url){
    // letting the browser give me the hostname, easier than a regex
    // inspired by: http://stackoverflow.com/a/12470263
    var _url = url || "",
        a = document.createElement('a');
    if (_url !== ""){
      a.href = _url;
      return a.hostname;
    } else {
      console.warn('url undefined');
      return false;
    }
  },

  encodeHTML: function(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  },

  addslashes: function( str ) {
    return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
  },

  getJSON: function(req_url,yay,bummer) {
    var data,
        request = new XMLHttpRequest();

    var _noCB = function(){ console.log('');};
    var success = (typeof yay === 'function') ? yay : _noCB;
    var fail = (typeof bummer === 'function') ? bummer : _noCB;
    
    request.open('GET', req_url, false);

    request.onload = function() {
      if (request.status >= 200 && request.status < 400){
        data = JSON.parse(request.responseText);
        success(data);
      } else {
        fail();
      }
    };

    request.onerror = function() {
      fail();
    };

    request.send(null);
  }

};


