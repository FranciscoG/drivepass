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
      return a['hostname'];
    } else {
      console.warn('url undefined');
      return false;
    }
  }

};


/*  example of JS router
http://collectiveidea.com/blog/archives/2012/01/25/standalone-javascript-routing/

var Router;

Router = (function() {
  function Router() {}

  Router.add = function(path, callback) {
    this.routes || (this.routes = []);
    return this.routes.push({
      path: new RegExp(path.replace(/\//g, "\\/").replace(/:(\w*)/g, "(\\w*)")),
      callback: callback
    });
  };

  Router.process = function() {
    var params, route, _i, _len, _ref;
    _ref = this.routes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      route = _ref[_i];
      params = window.location.pathname.match(route.path);
      if (params != null) {
        route.callback(params);
        return;
      }
    }
  };

  return Router;

})();

*/