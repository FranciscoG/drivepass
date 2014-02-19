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
var DrivePass = DrivePass || {};

DrivePass.GoogleSpreadsheet = (function(){

  var bgPage = chrome.extension.getBackgroundPage(),
      _options = {},
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
    bgPage.oauth.sendSignedRequest(_options.jsonListUrl, processLoad, params);
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
    bgPage.oauth.sendSignedRequest(_options.jsonListUrl, processAdd, params);
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

    if (typeof _options.sheet_url !== 'string' || 
        typeof _options.columns !== 'object') {
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
      activeUrl;

  var Sheet = new DrivePass.GoogleSpreadsheet();

 /**
  * Sends info to contentscript.js 
  * contentscripts is how a Chrome extensions interacts with a website
  * @param  {string}   un  - a usersname/login
  * @param  {string}   pw  - a password
  */
  var sendDetails = function(un,pw){
    chrome.tabs.getSelected(null, function(tab) {
      chrome.tabs.sendMessage(tab.id, {password: pw,username: un}, function(response) {
        console.log(response.dom);
      });
    });
  };

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
    sendDetails(result[0],result[1]);
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

  var init = function() {
    // chrome.tabs.query allows us to interact with current open tabs
    // I'm using it to grab the url of the active tab
    // it's asynchronous and can be passed a callback function
    chrome.tabs.query({
      active: true,
      lastFocusedWindow: true
    }, function(tabs) {
      var tab = tabs[0];
      activeUrl = utils.getHostname(tab.url);
      
      Sheet.init({
        sheet_url : localStorage['sheet_url'],
        columns : ['site','username','password']
      });

      Sheet.load(function(result){
        var found = findPW(result.sheetData,activeUrl);
        if (typeof found === 'undefined') {
          pwNotFound();
        } else {
          onSuccess(found);
        }
      });

    });
    bindAdd();
  };

  return {
    init: init
  };
});
(function(){

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

})();
