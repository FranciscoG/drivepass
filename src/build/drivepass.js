/**
 * This is the funnel for all browser related interactions
 * right now it only handles Chrome, in the future it will also handle FireFox, maybe Safari too
 * @module DrivePass.BrowserSupport
 */

var DrivePass = DrivePass || {};

DrivePass.Browser = {

  isChrome: function() {
    return (/Chrome/.test(navigator.userAgent));
  },

  ChromeExt: function() {
    if (!chrome.runtime) {
      // Chrome 20-21
      chrome.runtime = chrome.extension;
    } else if (!chrome.runtime.onMessage) {
      // Chrome 22-25
      chrome.runtime.onMessage = chrome.extension.onMessage;
      chrome.runtime.sendMessage = chrome.extension.sendMessage;
      chrome.runtime.onConnect = chrome.extension.onConnect;
      chrome.runtime.connect = chrome.extension.connect;
    }
  },

  isFirefox: function() {
    return (/Firefox/.test(navigator.userAgent));
  },

  sendToPage: function(data) {
    var _data = data || {};

    // data should always have username and password, otherwise return.
    if (Object.keys(_data).length !== 2) {
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

  getActiveTab: function(callback) {

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

  oAuthSendRequest: function(listUrl, callback, params) {

    if (this.isChrome()) {
      this.ChromeExt();
      chrome.runtime.getBackgroundPage(function(w) {
        w.oauth.sendSignedRequest(listUrl, callback, params);
      });
    }
  }

};
var DrivePass = DrivePass || {};

DrivePass.Filters = {
  /*
    Some password processing utilities
   */

  /**
   * Searches through the spreadsheet data for the matching domain
   * @param  {object}  data - json object
   * @param  {string}  tabDomain
   * @return {array}   [username,password]
   */
  findPW: function(data, tabDomain) {
    var _data = data || {},
      _result = [];
    if (_.keys(_data).length > 0) {
      for (var prop in _data) {
        if (tabDomain.indexOf(_data[prop].site.trim()) !== -1) {
          _result.push(_data[prop].username, _data[prop].password, _data[prop].site);
        }
      }
      return _result;
    } else {
      throw new Error('findPW: data not an object');
    }
  },

  /**
   * filter out the actual spreadsheet data from the rest of the json response
   * creates a new Object with just the rows from the Google Spreadsheet JSON response
   * @param  {object} response the entire Google Spreadsheet JSON list response
   * @return {object}          the filtered data in a new object
   */
  filterResults: function(response) {
    var data = response || {};
    var _i = 0,
      _results = {},
      _entries = data.feed.entry,
      cols = DrivePass.Settings.gs_sheet_init.columns;

    for (var prop in _entries) {
      _results[_i] = {};
      for (var n = 0; n < cols.length; n++) {
        var gsx = 'gsx$' + cols[n];
        _results[_i][cols[n]] = _entries[prop][gsx].$t;
      }
      _i++;
    }
    return _results;
  },

  /**
   * filters out the actual spreadsheet data from the rest of the json response to be used with Taffy DB
   * @param  {object} response the entire Google Spreadsheet JSON list response
   * @return {object}          the filtered data in a new array
   */
  createDBarray: function(response) {
    var data = response || {};
    var _i = 0,
      _entries = data.feed.entry,
      cols = DrivePass.Settings.gs_sheet_init.columns,
      finalDBarray = [];

    for (var prop in _entries) {
      var _results = {};
      for (var n = 0; n < cols.length; n++) {
        var gsx = 'gsx$' + cols[n];
        _results[cols[n]] = _entries[prop][gsx].$t;
      }
      finalDBarray.push(_results);
      _i++;
    }
    return finalDBarray;
  }

};
/*
  I wanted to be able ot upload a blank spreadsheet for the user but that involves way more
  access and the use of the Google Drive SDK.  I'm going to leave this here but unused for now.
  I'd rather the user just create a spreadsheet themselves rather than create it for them.
 */

var DrivePass = DrivePass || {};

DrivePass.GoogleDrive = (function(){
  /*
  * https://stackoverflow.com/questions/12765813/upload-csv-to-google-drive-spreadsheet-using-drive-v2-api
  * https://developers.google.com/drive/v2/reference/files/insert 
  */

  var options = {};
  options.driveAPI = "https://www.googleapis.com/upload/drive/v2/files";

  var createCallback = function(response,xhr){
    console.log(response);
    console.log(xhr);
  };

  var createBody = function(fileData, callback){
    var boundary = '-------314159265358979323846';
    var delimiter = "\r\n--" + boundary + "\r\n";
    var close_delim = "\r\n--" + boundary + "--";
    
    var reader = new FileReader();
    reader.readAsBinaryString(fileData);

    reader.onload = function(e) {
      var contentType = fileData.type || 'application/octet-stream';
      var metadata = {
        'title': fileData.fileName,
        'mimeType': contentType
      };

      var base64Data = btoa(reader.result);
      var multipartRequestBody =
          delimiter +
          'Content-Type: application/json\r\n\r\n' +
          JSON.stringify(metadata) +
          delimiter +
          'Content-Type: ' + contentType + '\r\n' +
          'Content-Transfer-Encoding: base64\r\n' +
          '\r\n' +
          base64Data +
          close_delim;

      request(multipartRequestBody, callback);
    };
  };

  var request = function(data,cb){
    options.cb = (typeof cb === "function") ? cb : createCallback;
    var boundary = '-------314159265358979323846';
    var params = {
      'method': 'POST',
      'params': {
        'convert' : true,
        'uploadType': 'multipart',
        'visibility' : 'private'
      },
      'headers': {
        'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
      },
      'body': data
    };

    DrivePass.Browser.oAuthSendRequest(options.driveAPI, options.cb, params);
  };

  var init = function(){
    var myBlob = new Blob(["site,username,password"], {type: 'text/csv', fileName: 'DrivePass DB'});
    createBody(myBlob, createCallback);
  };

  return {
    init: init
  };
});
/**
 * A module to use
 * @module DrivePass.GoogleSpreadsheet
 */

var DrivePass = DrivePass || {};

DrivePass.GoogleSpreadsheet = (function() {

  var _options = {},
    _response;

  var processLoad = function(response, xhr) {
    if (xhr.status !== 200) {
      _response = {
        success: false,
        message: xhr.status + ": Connection Failed"
      };
      console.warn(xhr);
    } else {
      _response = {
        success: true,
        message: 'spreadsheet successfully loaded'
      };
      _response.sheetData = JSON.parse(response);
    }
    //DrivePass.Signal.broadcast('gs_data_loaded', _response);

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
  var add = function(data, cb) {
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
    for (var i = 0; i < cols.length; i++) {
      atomXML += '<gsx:' + cols[i] + '>' + data[i] + '</gsx:' + cols[i] + '>\n';
    }
    atomXML += '</entry>';
    return atomXML;
  };

  /*
    https://developers.google.com/google-apps/spreadsheets/?hl=fr-FR#updating_a_list_row
 */
  var constructUpdateSpreadAtomXml_ = function(entry, data) {
    var atomXML = "<entry xmlns='http://www.w3.org/2005/Atom' xmlns:gsx='http://schemas.google.com/spreadsheets/2006/extended' ";
    atomXML += "xmlns:gd='http://schemas.google.com/g/2005' gd:etag='" + entry.gd$etag + "'>\n";
    atomXML += '<id>' + entry.id.$t + '</id>\n';
    atomXML += '<updated>' + entry.updated.$t + '</updated>\n';
    atomXML += '<category scheme="http://schemas.google.com/spreadsheets/2006" term="http://schemas.google.com/spreadsheets/2006#list"/>\n';
    atomXML += "<title type='text'>" + entry.title.$t + "</title>\n";
    atomXML += "<content type='text'>" + entry.content.$t + "</content>\n";
    atomXML += '<link rel="self" type="application/atom+xml" href="' + entry.link[0].href + '"/>\n';
    atomXML += '<link rel="edit" type="application/atom+xml" href="' + entry.link[1].href + '"/>\n';
    var cols = _options.columns;
    for (var i = 0; i < cols.length; i++) {
      atomXML += '<gsx:' + cols[i] + '>' + data[i] + '</gsx:' + cols[i] + '>\n';
    }
    atomXML += '</entry>';
    return atomXML;
  };

  var update = function(entry, data, cb) {
    _options.cb = (typeof cb === "function") ? cb : null;
    var params = {
      'method': 'PUT',
      'headers': {
        'GData-Version': '3.0',
        'Content-Type': 'application/atom+xml',
        'if-match': '*'
      },
      'body': constructUpdateSpreadAtomXml_(entry, data)
    };
    DrivePass.Browser.oAuthSendRequest(entry.link[1].href, processUpdate, params);
  };

  var processAdd = function(response, xhr) {
    if (xhr.status !== 201) {
      _response = {
        success: false,
        message: xhr.status + ": error saving"
      };
      console.warn(xhr);
    } else {
      _response = {
        success: true,
        message: 'saved successfully'
      };
    }
    //DrivePass.Signal.broadcast('gs_data_added', _response);

    if (_options.cb !== null) {
      _options.cb(_response);
    }
    return _response;
  };

  var processUpdate = function(response, xhr) {
    if (xhr.status !== 200) {
      _response = {
        success: false,
        message: xhr.status + ": error updating"
      };
      console.warn(xhr);
    } else {
      _response = {
        success: true,
        message: 'update successful'
      };
    }
    //DrivePass.Signal.broadcast('gs_data_updated', _response);

    if (_options.cb !== null) {
      _options.cb(_response);
    }
    return _response;
  };

  var processQeury = function(response, xhr) {
    if (xhr.status !== 200) {
      _response = {
        success: false,
        message: xhr.status + ": error querying"
      };
      console.warn(xhr);
    } else {
      _response = {
        success: true,
        message: 'query successful'
      };
      _response.queryData = JSON.parse(response);
    }
    //DrivePass.Signal.broadcast('gs_data_query', _response);

    if (_options.cb !== null) {
      _options.cb(_response);
    }
    return _response;
  };

  // https://developers.google.com/google-apps/spreadsheets/#sending_a_structured_query_for_rows
  /**
   * Simple query to the Spreadsheet DB that looks for data in column and returns row
   * @param  {string}   col  the column name
   * @param  {string}   data the item to be matched
   * @param  {function} cb   callback function
   */
  var query = function(col, data, cb) {
    var q = col + '=' + data;
    _options.cb = (typeof cb === "function") ? cb : null;
    var params = {
      'method': 'GET',
      'parameters': {
        'alt': 'json',
        'sq': q.replace(' ', '%20')
      }
    };
    DrivePass.Browser.oAuthSendRequest(_options.jsonListUrl, processQeury, params);
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
    init: init,
    load: load,
    add: add,
    update: update,
    query: query
  };

});
/**
 * Module to handle messaging for all parts of the app.  Create DOM elements and handles UI
 */

var DrivePass = DrivePass || {};

DrivePass.Notify = (function(type, msg) {

  // create DOM element here
  var docfrag = document.createDocumentFragment();

  var msg_container = document.createElement('div');
  msg_container.classList.add('dp_notify', type);

  var msg_textContainer = document.createElement('p');

  msg_textContainer.textContent = msg;



});
/*
https://developers.google.com/drive/v2/reference/
 */

var DrivePass = DrivePass || {};

DrivePass.Options = (function() {

  var $appName = document.getElementById('appName'),
    $sheet_url = document.getElementById("sheet_url"),
    $status = document.getElementById("status"),
    $setAppName = document.getElementById('setAppName'),
    $save = document.getElementById('save'),
    $sheetJump = document.getElementById("goToSheet"),
    $makeSheet = document.getElementById('makeSheet'),
    doReload = false;

  utils.toggler('inst_link', 'instructions');

  var app_name = localStorage.getItem('app_name');
  if (app_name === null) {
    $setAppName.classList.add('show');
    doReload = true;
  }

  // Saves options to localStorage
  function save_options() {
    var sheet_url_val = $sheet_url.value;
    var browser_name = $appName.value;

    localStorage.setItem("sheet_url", sheet_url_val);
    localStorage.setItem("app_name", browser_name);

    DrivePass.Settings.gs_sheet_init.sheet_url = sheet_url_val;
    DrivePass.ResetLocal().init(function() {
      $status.textContent = "Options Saved.";
      if (doReload) {
        _.delay(chrome.runtime.reload, 1000);
      }
    });
  }

  // Populates the input box with the saved url if it exists
  function restore_options() {
    var curr_url = localStorage.getItem("sheet_url");
    var curr_appname = localStorage.getItem("app_name");
    $appName.value = curr_appname;

    if (curr_url === null || curr_url === "") {
      return false;
    } else {
      $sheet_url.value = curr_url;
      $save.textContent = "update";
      $sheetJump.href = curr_url;
      $sheetJump.style.display = "block";
    }
  }
  document.addEventListener('DOMContentLoaded', restore_options);
  $save.addEventListener('click', save_options);
});
var DrivePass = DrivePass || {};

DrivePass.Generator = (function() {
  var $uc = document.getElementById('uppercase'),
    $lc = document.getElementById('lowercase'),
    $nums = document.getElementById('numbers'),
    $show_symbols = document.getElementById('show_symbols'),
    $symbols = document.getElementById('symbols'),
    $pw = document.getElementById('pw');

  var getValues = function() {
    var includeChar = '', // var holding 1 of each item chosen to be included
      count = 0,
      charset = '', // all the letters, numbers, and symbols to be included
      passLength = document.getElementById('digits').value || 26;

    if (passLength < 4) {
      passLength = 4; // setting a minimum password length of 4
    }
    [$uc, $lc, $nums].forEach(function(e) {
      if (e.checked === true) {
        charset += e.value;
        //make sure at least 1 of the chosen characters are used
        includeChar += _.sample(e.value);
        count++;
      }
    });
    if ($show_symbols.checked === true) {
      charset += $symbols.value;
      includeChar += _.sample($symbols.value);
      count++;
    }
    return [passLength, charset, includeChar, count];
  };

  var generatePassword = function(e) {
    e.preventDefault();
    var vals = getValues(),
      length = vals[0] - vals[3], //chosen pw length - length of items chosen to be included
      charset = vals[1],
      retVal = "";
    retVal = _.sample(charset, length).join('');
    retVal += vals[2];
    $pw.textContent = _.shuffle(retVal).join('');
    $pw.className = "generated";
    return true;
  };

  var init = function() {
    document.getElementById('makePassword').addEventListener('click', generatePassword, false);
  };

  return {
    init: init
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
    $update = document.getElementById('update'),
    $theInfo = document.getElementById('theInfo'),
    $currSite = document.getElementById('currSite'),
    fullData = JSON.parse(localStorage.getItem('_full')),
    activeUrl;

  var Sheet = DrivePass.Sheet;

  // handle UI hide/show elements
  utils.toggler('showGPoptions', 'gpOptions');
  utils.toggler('showInfo', 'theInfo');
  utils.toggler('show_symbols', 'hidden_symbols');

  // init the Password Generator module
  var generate = new DrivePass.Generator();

  /**
   * Updates the status element ID and displays it
   * @param  {string} status
   * @param  {string} message
   */
  var handleStatus = function(status, message) {
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
  var onSuccess = function(result) {
    console.log(result);
    $loading.style.display = "none";
    handleStatus('success', 'password found');
    $un.textContent = utils.encodeHTML(result.username);
    $pw.textContent = utils.encodeHTML(result.password);
    $currSite.textContent = utils.encodeHTML(result.site);

    DrivePass.Browser.sendToPage({
      username: result.username,
      password: result.password
    });

    $add.classList.remove('show');
    $update.classList.add('show');
  };

  /**
   * handle UI updates when password not found
   */
  var pwNotFound = function() {
    $loading.style.display = "none";
    handleStatus('error', 'password not found');
    utils.toggle($theInfo);
  };

  /**
   * bind the event listener that handles adding a new entry into the google spreadheet
   */
  var bindAdd = function() {
    $add.addEventListener('click', function(evt) {
      var un = $un.textContent;
      var pw = $pw.textContent;
      var data = [activeUrl, un, pw];
      Sheet.add(data, function(result) {
        if (result.success === false) {
          handleStatus('error', result.message);
        } else {
          handleStatus('success', result.message);
          DrivePass.ResetLocal().init();
        }
      });
    }, false);
  };

  var bindUpdate = function() {
    $update.addEventListener('click', function(evt) {
      var _site = $currSite.textContent;
      var entry = findEntry(_site);
      var un = $un.textContent;
      var pw = $pw.textContent;
      var data = [_site, un, pw];
      Sheet.update(entry, data, function(result) {
        if (result.success === false) {
          handleStatus('error', result.message);
        } else {
          handleStatus('success', result.message);
          DrivePass.ResetLocal().init();
        }
      });
    }, false);
  };

  /**
   * Get Object key that matches site name, used when updating information.  Updating a row in a Google Spreadsheet
   * requires a lot more data from the full JSON response than just the un,pw, and site.
   * @param  {string} site      the website that you're trying to change data for
   * @return {string}           the object key
   */
  var findEntry = function(site) {
    var _fullSheet = fullData.sheetData;
    for (var entry in _fullSheet.feed.entry) {
      if (_fullSheet.feed.entry[entry].gsx$site.$t === site) {
        return _fullSheet.feed.entry[entry];
      }
    }
  };

  var initCb = function() {
    activeUrl = DrivePass.Browser.activeTabUrl.replace('www.', "");

    var found = DrivePass.DB({
      site: activeUrl
    }).get();

    if (found.length === 0) {
      pwNotFound();
    } else {
      onSuccess(found[0]);
    }
  };


  var init = function() {
    /**
     * Shows the options page to the user if they haven't added their spreadsheet url yet
     */
    if (!localStorage['sheet_url'] || localStorage['sheet_url'] === "") {
      handleStatus('error', "no spreadsheet set in options");
      chrome.tabs.create({
        url: "options.html"
      });
    } else {
      if (fullData === null) {
        DrivePass.ResetLocal().init(function() {
          DrivePass.Browser.getActiveTab(initCb);
        });
      } else {
        DrivePass.Browser.getActiveTab(initCb);
      }
      bindAdd();
      bindUpdate();
    }
  };

  var onload = function() {
    document.addEventListener('DOMContentLoaded', function(e) {
      if (this.bDone) {
        return; // deal with DOMContentLoaded being fired twice for some reason
      }
      this.bDone = true;
      generate.init();
      init();
    });
  };

  return {
    init: onload
  };
});
var DrivePass = DrivePass || {};

DrivePass.ResetLocal = (function() {

  var Sheet = DrivePass.Sheet;

  var init = function(cb) {
    Sheet.load(function(response_data) {

      // save full response in localStorage
      localStorage.setItem('_full', JSON.stringify(response_data));

      if (response_data.success === true) {

        // remove persisted copy of taffy db if exists
        if (typeof localStorage.taffy_tdb !== 'undefined') {
          localStorage.removeItem('taffy_tdb');
        }
        // store new copy of Taffy DB
        var _db = DrivePass.Filters.createDBarray(response_data.sheetData);
        DrivePass.DB = TAFFY(_db);
        DrivePass.DB.store('tdb');

        // run any callback function if it exists
        if (typeof cb === "function") {
          cb();
        }

      }
    });
  };

  return {
    init: init
  };

});
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
    } else {
      return;
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
var DrivePass = DrivePass || {};

DrivePass.Signal = (function() {
  'use strict';

  var topics = {},
    subUid = -1;

  var listen = function(topic, func) {
    if (!topics[topic]) {
      topics[topic] = [];
    }
    var token = (++subUid).toString();
    topics[topic].push({
      token: token,
      func: func
    });
    return token;
  };

  var broadcast = function(topic, args) {
    if (!topics[topic]) {
      return false;
    }
    setTimeout(function() {
      var subscribers = topics[topic],
        len = subscribers ? subscribers.length : 0;

      while (len--) {
        subscribers[len].func(topic, args);
      }
    }, 0);
    return true;
  };

  var off = function(token) {
    for (var m in topics) {
      if (topics[m]) {
        for (var i = 0, j = topics[m].length; i < j; i++) {
          if (topics[m][i].token === token) {
            topics[m].splice(i, 1);
            return token;
          }
        }
      }
    }
    return false;
  };
  return {
    broadcast: broadcast,
    listen: listen,
    off: off
  };
})();
var DrivePass = DrivePass || {};

DrivePass.User = (function() {

  var renderView = function() {
    _.each(DrivePass.DB().get(), function(el, i, list) {
      html5tmpl('row_template', list[i]).appendTo('db_container');
    });
  };

  var init = function() {
    renderView();
  };

  return {
    init: init
  };
});
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
  toggler: function(handler, targ) {
    var self = this;
    var elm = document.getElementById(targ);
    document.getElementById(handler).addEventListener('click', function(e) {
      self.toggle(elm);
    }, false);
  },

  /**
   * gets the hostname from a URL string
   * @param  {string}  a full url
   * @return {string}
   */
  getHostname: function(url) {
    // letting the browser give me the hostname, easier than a regex
    // inspired by: http://stackoverflow.com/a/12470263
    var _url = url || "",
      a = document.createElement('a');
    if (_url !== "") {
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

  addslashes: function(str) {
    return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
  },

  getJSON: function(req_url, yay, bummer) {
    var data,
      request = new XMLHttpRequest();

    var _noCB = function() {
      console.log('');
    };
    var success = (typeof yay === 'function') ? yay : _noCB;
    var fail = (typeof bummer === 'function') ? bummer : _noCB;

    request.open('GET', req_url, false);

    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
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
}; // close utils

var Fake$ = function(st) {

  // my simple fake jQuery
  var about = "this is my minimal fake jQuery";

  if (st) {
    if (window === this) {
      return new Fake$(st);
    }

    var x = st.charAt(0);
    if (x === "#") {
      this.el = document.getElementById(st.substring(1));
    } else if (x === ".") {
      var nodeList = document.querySelectorAll(st);
      this.el = Array.prototype.slice.call(nodeList); //to return an array intead of a nodeList
    } else {
      this.el = document.getElementById(st);
    }
    return this.el;
  } else {
    return about;
  }
};
//var $ = Fake$;

/**
 * mini templating library using native html5 templating
 * important to note: since html5 templating is basically a wrapper over documentFragment you need to have content nested 1 level deep.
 * You can't grab innerHTML of the documentFragment itself, but you can for its children.
 * @param  {string} id       id attribute of the template tag
 * @param  {object} tmplData data to be added to the template
 *
 */
var html5tmpl = (function(id, tmplData) {

  var template = document.importNode(document.getElementById(id).content, true);
  var parent = template.children[0]; // grabbing the element that wraps the actual template
  var _tmpl = parent.innerHTML;

  function repl(match, p1, offset, string) {
    return tmplData[p1];
  }

  _tmpl = _tmpl.trim().replace(/\{\{(\w+)\}\}/g, repl);

  var render = function(to) {
    parent.innerHTML = _tmpl;
    document.getElementById(to).appendChild(parent);
  };

  return {
    appendTo: render
  };
});
var DrivePass = DrivePass || {};

DrivePass.ext = new DrivePass.Router({

  universal: function() {
    DrivePass.Settings = JSON.parse(localStorage.getItem('options')) || {};
    DrivePass.Settings.keeplocal = DrivePass.Settings.keeplocal || true;
    DrivePass.Settings.route = document.body.dataset.route;

    DrivePass.Settings.gs_sheet_init = {
      sheet_url: localStorage.getItem('sheet_url'),
      columns: ['site', 'username', 'password']
    };

    DrivePass.Sheet = new DrivePass.GoogleSpreadsheet();
    DrivePass.Sheet.init(DrivePass.Settings.gs_sheet_init);

    if (typeof localStorage.taffy_tdb !== 'undefined') {
      DrivePass.DB = TAFFY().store('tdb');
    } else if (typeof localStorage._full !== 'undefined') {
      var _db = localStorage.getItem('_full');
      _db = DrivePass.Filters.createDBarray(JSON.parse(_db).sheetData);
      DrivePass.DB = TAFFY(_db);
    } else {
      DrivePass.ResetLocal().init();
    }
  }

});