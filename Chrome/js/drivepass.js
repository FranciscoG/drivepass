/*global Ply */
/*jshint bitwise: true, camelcase: true, curly: true, eqeqeq: true, forin: true,
immed: true, indent: 4, latedef: true, newcap: true, nonew: true, quotmark: single,
undef: true, unused: true, strict: true, trailing: true, browser: true */

// **Ply** is a lightweight JavaScript framework for creating
// reusable UI components and managing application logic. It
// aims to eliminate boilerplate code, create a consistent interface,
// and provide common patterns for code organization and re-use.

// Ply is not an MVC framework and doesn't aim to compete
// with [Backbone.js](http://documentcloud.github.com/backbone/) or [SproutCore](http://www.sproutcore.com/). Instead, it is intended for users
// who need to maintain logic on the server and are looking for a better
// option for code re-use and organization.

// This file comprises the Core module.

// Declare global namespace and assign version number.

window.Ply = {
    VERSION: '0.4.2'
};

// Define `core` module.

Ply.core = (function () {

    'use strict';

    // ## Private Variables
    // Create private variables. `listeners` is an associative array holding arrays of
    // notification listeners keyed on the notification name.
    var listeners = {},
        // id used to uniquely identify listeners for use in ignore.
        id = 0,
        debug = false;

    // ## Public Methods/Properties
    return {

        // ### Notify
        // Notifies listeners of an event. Notifiers should send themselves
        // and optional data as arguments.
        notify: function (note, sender, data) {

            // Cache listeners array or create a new array, assign, and cache it.
            var list = listeners[note] || (listeners[note] = []),
                // Create loop variables.
                i = 0,
                len = list.length;

            // Loop over listeners and notify each.
            for (; i < len; i++) {
                list[i].handler.call(list[i].listener, note, sender, data);
            }

        },

        // ### Listen
        // Listens for a particular notification or set of notifications.
        // Clients should pass in a handler function and themselves as arguments.
        // When the handler function is called, it will be applied to the `listener`'s
        // scope, ensuring that `this` refers to what the client expects.
        listen: function (notification, handler, listener) {

            // Cache the notification's listeners if it exists or create and cache
            // a new array otherwise.
            var list  = listeners[notification] || (listeners[notification] = []),
                // Split the notification on whitespace. Clients can listen to
                // multiple notifications by passing in a string with the notification
                // names split by whitespace.
                notes = notification.split(/\s/),
                // Create loop variables.
                len = notes.length,
                i = 0;

            // If the notification name contains whitespace,
            // listen on each particular notification (segment).
            if (len > 1) {
                for (; i < len; i++) {
                    this.listen(notes[i], handler, listener);
                }

                return;
            }

            // Add the listener and handler function to the notifications array.
            list.push({
                id: id += 1,
                handler: handler,
                listener: listener
            });
            
            // return handle used to ignore.
            return [notification, id];
        },

        // ### Ignore
        // Removes a particular notification from listeners object.
        // Clients should pass in the returned handle from `Ply.core.listen`.
        ignore: function (handle) {
            
            var note = handle[0];

            if (listeners[note]) {
                listeners[note].forEach(function (i) {
                    if (this.id === handle[1]) {
                        listeners[note].splice(i, 1);
                    }
                });
            }

            return;
        },

        // ### Log
        // Lightweight logging wrapper around `console`. Useful less so
        // for debugging than for posting notices of interest.
        log: function (msg, type) {

            // Do nothing if debug mode is disabled.
            if (!debug) {
                return;
            }

            // Use the correct logging mechanism based
            // on the parameter type.
            if (window.console) {

                switch (type) {
                case 'warn':
                    window.console.warn(msg);
                    break;

                case 'info':
                    window.console.info(msg);
                    break;

                default:
                    window.console.log(msg);
                    break;
                }
            }

        },

        // ### Error
        // Method to catch JavaScript errors. All Ply methods are run in a `try/catch` block,
        // with exceptions being passed to this method.
        error: function (ex, sev) {

            // If an `onError` callback function is defined in `Ply.config.core`, call it.
            // Note that implementing this callback is highly recommended. See the sample implementation
            // in `Ply.config`.
            if (Ply.config.core.onError && typeof Ply.config.core.onError === 'function') {
                // Pass in the exception and the severity to the handler.
                Ply.config.core.onError(ex, sev);

                return;
            }

            // If no error handler is defined, simply throw the error.
            throw ex;

        },

        // ### Debug
        // Enabled debugging when called with no argues or with any truthy value. To disable debug mode
        // send `false` or another falsy value to this function, e.g.: `Ply.core.debug(0)`.
        debug: function (val) {

            // Default to `true` if no arguments.
            debug = typeof val === 'undefined' ? true : val;

            if (debug) {
                // Print debug notice.
                this.log('debugging...', 'info');

                // Manually set `this.debugOn` in case debug is set after Ply has been initialized.
                // `debugOn` will still be cached to the old value.
                this.debugOn = true;
            }
            else {
                // Do the opposite.
                this.debugOn = false;
            }
        },

        // ### Debug on
        // Cache the value of debug. This is used by clients to determine
        // if debug mode is currently enabled.
        debugOn: (function () {
            // Coerce the value to a boolean.
            return !!debug;
        }())

    };

})();

// &#8618; [Ajax](ajax.html)
/* 
 * This is the funnel for all browser related interactions
 * right now it only handles Chrome, in the futre it will also handle FireFox, maybe Safari too
*/

var DrivePass = DrivePass || {};

DrivePass.Browser = {

  isChrome : function(){
    return /Chrome/.test(navigator.userAgent);
  },
  
  isFirefox : function(){
    return /Firefox/.test(navigator.userAgent);
  },

  sendToPage : function(data) {
    var _data = data || {};

    // data should always have username and password, otherwise return.
    if ( Object.keys(_data).length !== 2) {
      return false;
    }

    if (this.isChrome()) {

      chrome.tabs.getSelected(null, function(tab) {
        chrome.tabs.sendMessage(tab.id, {
          password: _data.password,
          username: _data.username
        }, function(response) {
            console.log(response.dom);
        });
      });

    }

  },

  getActiveTab : function(callback) {

    if (this.isChrome()) {

      chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
      }, function(tabs) {
        var tab = tabs[0];
        this.activeTabUrl = utils.getHostname(tab.url);
        
        if (typeof callback === 'function') {
          callback();
        }

      }.bind(this));
    }
  
  },

  oAuthSendRequest : function(listUrl, callback, params) {

    if (this.isChrome()) {

      var bgPage = chrome.extension.getBackgroundPage();
      bgPage.oauth.sendSignedRequest(listUrl, callback, params);

    }
  }

};


var DrivePass = DrivePass || {};

DrivePass.GoogleSpreadsheet = (function(){

  var _options = {},
      _response;

  var filterResults = function(response){
    var data = JSON.parse(response);
    var _i = 0,
        _results = {},
        _entries = data.feed.entry,
        cols = _options.columns;

    for (var prop in _entries) {
      _results[_i] = {};
      for (var n=0; n < cols.length; n++){
        var gsx = 'gsx$'+cols[n];
        _results[_i][cols[n]] = _entries[prop][gsx].$t;
      }
      _i++;
    }
    return _results;
  };

  var processLoad = function(response,xhr){
    if (xhr.status !== 200) {
      _response = {success:false, message: xhr.status + ": Connection Failed"};
      console.warn(xhr);
    } else {
      _response = {success:true, message: 'spreadsheet successfully loaded'};
      _response.sheetData = filterResults(response);
    }
    // TODO: check options if should be saving to local storage
    localStorage.setItem('_data', JSON.stringify(_response));
    // TODO: maybe use pubsub instead of callback
    if (_options.cb !== null) {
      _options.cb(_response);
    }
    return _response;
  };

  var load = function(cb) {
    _options.cb = (typeof cb === "function") ? cb : null;
    var params = {
      'headers': {
        'GData-Version': '3.0'
      },
      'parameters': {
        'alt': 'json',
        'showfolders': 'true'
      }
    };
    DrivePass.Browser.oAuthSendRequest(_options.jsonListUrl, processLoad, params);
  };

  /**
   * add new information to the spreadsheet. 
   * @param {array}    data array of data to be saved.  Make sure the order of the info inside the array matches the column order from init
   * @param {Function} cb   callback function
   */
  var add = function(data,cb){
    _options.cb = (typeof cb === "function") ? cb : null;
    var params = {
      'method': 'POST',
      'headers': {
        'GData-Version': '3.0',
        'Content-Type': 'application/atom+xml'
      },
      'body': constructSpreadAtomXml_(data)
    };
    DrivePass.Browser.oAuthSendRequest(_options.jsonListUrl, processAdd, params);
  };

  /**
   * Cunstructs an AtomXML string that google uses to add information to a spreadsheet
   * @param  {array} data  array of info to be inserted into a spreadsheeet.  The order of the array must be in the same order as columns
   * @return {string}      the constructed AtomXML string
   */
  var constructSpreadAtomXml_ = function(data) {
    var atomXML = '<entry xmlns="http://www.w3.org/2005/Atom" xmlns:gsx="http://schemas.google.com/spreadsheets/2006/extended">\n';

    var cols = _options.columns;
    for (var i=0; i < cols.length; i++){
      atomXML += '<gsx:' + cols[i] + '>' + data[i] + '</gsx:' + cols[i] +'>\n';
    }
    atomXML += '</entry>';
    return atomXML;
  };

  var processAdd = function(response,xhr){
    if (xhr.status !== 201) {
      _response = {success:false, message: xhr.status + ": error saving"};
      console.warn(xhr);
    } else {
      _response = {success:true, message: 'saved successfully'};
    }
    // running Load again to refresh localStorage copy with new info
    // TODO: but only if option to store locally is true
    load();
    // TODO: maybe use pubsub instead of callback
    if (_options.cb !== null) {
      _options.cb(_response);
    }
    return _response;
  };

  /*
    example usage and required parameters
    var spreadsheet = Googlespreadsheet.init({
      sheet_url : 'http://link.to.your?spreadsheet'
      columns : ["an","array","of","column","names","as","strings"]
    })
    
    !! pay attention to the order of the column names in the array
    !! you'll need to match when inserting new cells 

  */

  var init = function(options) {
    _options = options || {};

    if (typeof _options.sheet_url !== 'string' || typeof _options.columns !== 'object') {
      throw new Error('Missing sheet_url or columns from init options');
    }

    var url,
        key,
        sourceIdentifier = _options.sheet_url;
    if (sourceIdentifier.match(/http(s)*:/)) {
      url = sourceIdentifier;
      try {
        key = url.match(/key=(.*?)(&|#)/)[1];
      } catch (error) {
        key = url.match(/(cells|list)\/(.*?)\//)[2];
      }
    } else {
      key = sourceIdentifier;
    }
    _options.jsonListUrl = "https://spreadsheets.google.com/feeds/list/" + key + '/od6/private/full';
    _options.jsonCellsUrl = "https://spreadsheets.google.com/feeds/cells/" + key + '/od6/private/basic';
    
    return this;
  };

  return {
    init:init,
    load:load,
    add:add
  };

});
var DrivePass = DrivePass || {};

DrivePass.Generator = (function(){
  var $uc = document.getElementById('uppercase'),
      $lc = document.getElementById('lowercase'),
      $nums = document.getElementById('numbers'),
      $show_symbols = document.getElementById('show_symbols'),
      $symbols = document.getElementById('symbols'),
      $pw = document.getElementById('pw');

  var getValues = function(){
    var includeChar ='',
        count = 0,
        charset = '',
        passLength = document.getElementById('digits').value || 15;

    if (passLength < 2){ passLength = 7; }
    [$uc,$lc,$nums].forEach(function(e){
      if (e.checked === true) {
        charset += e.value;
        //make sure at least 1 of the chosen characters are used
        var n = e.value.length;
        includeChar += e.value.charAt(Math.floor(Math.random() * n));
        count++;
      }
    });
    if ($show_symbols.checked === true) {
      charset += $symbols.value;
      var n = $symbols.value.length;
      includeChar += $symbols.value.charAt(Math.floor(Math.random() * n));
      count++;
    }
    return [passLength,charset,includeChar,count];
  };

  var generatePassword = function(e){
    e.preventDefault();
    var vals = getValues(),
        length = vals[0] - vals[3],
        charset = vals[1],
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    retVal += vals[2];
    $pw.textContent = retVal;
    $pw.className = "generated";
    return true;
  };

  var init = function(){
    document.getElementById('makePassword').addEventListener('click',generatePassword,false);
  };

  return {
    init:init
  };
});
var DrivePass = DrivePass || {};

DrivePass.Popup = (function() {

  // caching DOM elements
  // I'm not using jQuery so the $ represents element IDs only
  var $loading = document.getElementById('loading'),
      $status = document.getElementById('status'),
      $un = document.getElementById('un'),
      $pw = document.getElementById('pw'),
      $add = document.getElementById('add'),
      $theInfo = document.getElementById('theInfo'),
      theData = JSON.parse(localStorage.getItem('_data')),
      activeUrl;

  var Sheet = new DrivePass.GoogleSpreadsheet();

  Sheet.init({
    sheet_url : localStorage.getItem('sheet_url'),
    columns : ['site','username','password']
  });

  if (theData === null) {
    Sheet.load();
    theData = JSON.parse(localStorage.getItem('_data'));
  }

 /**
  * Searches through the spreadsheet data for the matching domain
  * @param  {object}  data - json object
  * @param  {string}  tabDomain
  * @return {array}   [username,password]
  */
  var findPW = function(data,tabDomain) {
    var _data = data || {};
    if (Object.keys(_data).length) {
      for (var prop in _data) {
        if (tabDomain.indexOf(_data[prop].site) !== -1) {
          var result = [];
          result.push(_data[prop].username,_data[prop].password);
          return result;
        }
      }
    } else {
      console.warn('findPW: data not an object');
    }
  };

  /**
   * Updates the status element ID and displays it
   * @param  {string} status
   * @param  {string} message
   */
  var handleStatus = function(status,message) {
    var stat = status || '';
    var msg = message || '';
    if (stat !== '' && msg !== '') {
      $status.textContent = msg;
      $status.className = stat;
      $status.style.display = "block";
    }
  };

  /**
   * run on successful load of google spreadsheet
   * @param  {object} result  - json object
   */
  var onSuccess = function(result){
    $loading.style.display = "none";
    handleStatus('success','password found');
    $un.textContent = result[0];
    $pw.textContent = result[1];
    
    DrivePass.Browser.sendToPage({username: result[0], password: result[1]});
    
    $add.textContent = "update";
  };

  /**
   * handle UI updates when password not found
   */
  var pwNotFound = function(){
    $loading.style.display = "none";
    handleStatus('error','password not found');
    utils.toggle($theInfo);
  };

  /**
   * bind the event listener that handles adding a new entry into the google spreadheet
   */
  var bindAdd = function(){
    $add.addEventListener('click', function(evt) {
      var un = document.getElementById('un').textContent;
      var pw = document.getElementById('pw').textContent;
      var data = [activeUrl,un,pw];
      Sheet.add(data,function(result){
        if (result.success === false){
          handleStatus('error',result.message);
        } else {
          handleStatus('success', result.message);
        }
      });
    },false);
  };

  var initCb = function(){
    /*
    TODO: check local storage option and either run below or do sheet.load with callback
    */
    activeUrl = DrivePass.Browser.activeTabUrl;
    var found = findPW(theData.sheetData,activeUrl);
    if (typeof found === 'undefined') {
      pwNotFound();
    } else {
      onSuccess(found);
    }
    
  };

  var init = function() {
    DrivePass.Browser.getActiveTab(initCb);
    bindAdd();
  };

  return {
    init: init
  };
});
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
  }

};
var DrivePass = DrivePass || {};

DrivePass.ext = new DrivePass.Router({

  universal : function(){
    DrivePass.Settings = JSON.parse(localStorage.getItem('options')) || {};
    DrivePass.Settings.route = document.body.dataset.route;
  },

  popup : function() {
    var initUI = function(){
      utils.toggler('showGPoptions','gpOptions');
      utils.toggler('showInfo','theInfo');
      utils.toggler('show_symbols','hidden_symbols');
    };

    var popup = new DrivePass.Popup();
    var generate = new DrivePass.Generator();
    
    document.addEventListener('DOMContentLoaded', function(e) {
      if (this.bDone) {
        return; // deal with DOMContentLoaded being fired twice for some reason
      }
      this.bDone = true;
      generate.init();
      popup.init();
      initUI();
    });
  },

  chrome_options : function() {
    /*
    TODO:  
    - add option whether to store db locally or not, read that option in googlespreadsheet module
    - store new option pref in localStorage
    - add ability to clear out local cache
    - when turning off option (setting it to false), clear out localStorage sheet data
    - if sheet_url not set, add/show a link to "drive.google.com"
    - UI updates all around
    */
   
    // Saves options to localStorage.
    function save_options() {
      localStorage.setItem("sheet_url", document.getElementById("sheet_url").value);
      // Update status to let user know options were saved.
      document.getElementById("status").textContent = "Options Saved.";
    }

    // Populates the input box with the saved url if it exists
    function restore_options() {
      var curr_url = localStorage.getItem("sheet_url");
      if (!curr_url || curr_url === "") {
        return false;
      } else {
        document.getElementById("sheet_url").value = curr_url;
        document.getElementById("save").textContent = "update";
        var sheetJump = document.getElementById("goToSheet");
        sheetJump.href = curr_url;
        sheetJump.style.display = "block";
      }
    }
    document.addEventListener('DOMContentLoaded', restore_options);
    document.getElementById('save').addEventListener('click', save_options);
  }

});
