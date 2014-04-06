/*  
 * Super simple DOM-based router
 *
 * <body data-route="popup" data-action="init">
 * it then looks for the function that matches that route/action and runs it
 *
 * based on Paul Irish's DOM-Based routing
 * http://www.paulirish.com/2009/markup-based-unobtrusive-comprehensive-dom-ready-execution/
 * http://viget.com/inspire/extending-paul-irishs-comprehensive-dom-ready-execution
 *
 */

var DrivePass = DrivePass || {};

DrivePass.Router = (function() {

  function Router(info) {
    this.methods = info;
    this.process();
  }

  Router.prototype.exec = function(controller, action) {
    var ns = DrivePass,
      _controller;

    if (typeof ns[controller] === 'function') {
      _controller = new ns[controller]();
    }

    if (typeof _controller[action] === 'function') {
      _controller[action]();
    }

  };

  Router.prototype.process = function() {

    // always run what's in 'universal' before other routes
    if (typeof this.methods.universal === 'function') {
      this.methods.universal();
    }

    var route = document.body.dataset.route;
    var action = document.body.dataset.action;

    if (typeof route !== 'undefined') {

      // first we look in the main app js to see if a method was defined there
      if (typeof this.methods[route] === "function") {
        this.methods[route]();
      } else {
        // we try the exec function that runs it if module exists
        this.exec(route, action);
      }

    }

    // another always process but run at the very end
    if (typeof this.methods.lastProcess === 'function') {
      this.methods.lastProcess();
    }

  };

  return Router;

})();