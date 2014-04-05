/*  
 * Super simple JS router, like super super simple
 *
 * Because Chrome Extensions don't allow you to run 'external' scripts (which include inline scripts)
 * I'm placing the route for the document as a data attribute of the body tag
 * <body data-route="popup">
 * it then looks for the function that matches that route and runs it
 *
 */

var DrivePass = DrivePass || {};

DrivePass.Router = (function() {
  function Router(info) {
    this.methods = info;
    this.process();
  }

  Router.prototype.process = function() {
    // always run what's in 'universal' before other routes
    this.methods.universal();
    var route = document.body.dataset.route;
    // only want to process defined routes
    if (typeof route !== 'undefined') {
      var execRoute = this.methods[route];
      if (typeof execRoute === 'function') {
        execRoute();
      }
    }
  };

  return Router;

})();