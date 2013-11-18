var bgPage = chrome.extension.getBackgroundPage();

var accessSheet = (function() {
  var init,convertArray,findPW,getDomain,loadData,bindAdd;

  convertArray = function(arr){
    if (arr !== null) {
      var a = 0, newObj = {};
      for (var i = 0; i < arr.length; i = i+3) {
        newObj[a] = {
          site : arr[i].trim(),
          u : arr[i+1].trim(),
          pw : arr[i+2].trim()
        };
        a++;
      }
      return newObj;
    } else {
      console.warn('convertArray: array is null');
    }
  };
  findPW = function(data,tabDomain) {
    if (data !== null && typeof data === 'object') {
      for (prop in data) {
        if (tabDomain.indexOf(data[prop].site) !== -1) {
          var result = [];
          result.push(data[prop].u,data[prop].pw);
          return result;
        }
      }
    } else {
      console.warn('findPW: data not an object');
    }
  };
  getDomain = function(tabUrl){
    if (tabUrl !== null) {
      var tabDomain,
          finalDomain;
      if (/http:/i.test(tabUrl)) {
        tabDomain = tabUrl.split('http://');
        finalDomain = tabDomain[1].split('/');
      } else if (/https/i.test(tabUrl)) {
        tabDomain = tabUrl.split('https://');
        finalDomain = tabDomain[1].split('/');
      } else {
        finalDomain = tabDomain.split('/');
      }
      return finalDomain[0];
    } else {
      console.warn('getDomain: url is null');
    }
  };

  loadData = function(){
    var url = localStorage["sheet_url"];
    var sheet = new GoogleSpreadsheet();
    sheet.url(url);
    sheet.load(); //saves results to localStorage["sheetData"] or error to localStorage['error']
    if (localStorage['error']) {
      handleError(localStorage['error']);
      return;
    }
    var data = localStorage["sheetData"].split(',');
    return convertArray(data);
  };

  handleError = function(err){
    if (err !== null){
      var error = document.getElementById('error');
      error.textContent = err;
      error.style.display = 'block';
      if (typeof localStorage['error'] !== 'undefined'){
        localStorage.removeItem('error');
      }
    }
  };

  updateUI = function(result){
    if (result !== null ){
      document.getElementById('un').textContent = result[0];
      document.getElementById('pw').textContent = result[1];
    } else {
      console.warn('results are null brah');
    }
  };

  bindAdd = function(){
    var url = localStorage["sheet_url"];
    var sheet = new GoogleSpreadsheet();
    sheet.url(url);
    add = document.getElementById('add');
    add.addEventListener('click', function(evt) {
      sheet.add();
      var error = localStorage['error'];
      if (typeof error !== 'undefined'){
        handleError(error);
      }
    });
  };

  init = function() {
    bindAdd();
    var spreadSheetData = loadData();
    chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
    }, function(tabs) {
      var tab = tabs[0];
      var activeUrl = getDomain(tab.url);
      var found = findPW(spreadSheetData,activeUrl);
      if (typeof found === 'undefined') {
        handleError('password not found');
      } else {
        updateUI(found);
      }
      localStorage.removeItem('sheetData');
    });

  };

  return {
    init: init
  };
});


var GoogleSpreadsheet = (function(){
  function GoogleSpreadsheet() {}

  GoogleSpreadsheet.prototype.url = function(url){
    this.sourceIdentifier = url;
    if (this.sourceIdentifier.match(/http(s)*:/)) {
      this.url = this.sourceIdentifier;
      try {
        this.key = this.url.match(/key=(.*?)(&|#)/)[1];
      } catch (error) {
        this.key = this.url.match(/(cells|list)\/(.*?)\//)[2];
      }
    } else {
      this.key = this.sourceIdentifier;
    }
    this.jsonListUrl = "https://spreadsheets.google.com/feeds/list/" + this.key + '/od6/private/full';
    this.jsonCellsUrl = "https://spreadsheets.google.com/feeds/cells/" + this.key + '/od6/private/basic';
  };

  GoogleSpreadsheet.prototype.load = function() {
    var params = {
      'headers': {
        'GData-Version': '3.0'
      },
      'parameters': {
        'alt': 'json',
        'showfolders': 'true'
      }
    };
    var url = this.jsonCellsUrl;
    bgPage.oauth.sendSignedRequest(url, GoogleSpreadsheet.process, params);
  };

  GoogleSpreadsheet.constructSpreadAtomXml_ = function(site, u, pw) {
    var atom = '<entry xmlns="http://www.w3.org/2005/Atom" xmlns:gsx="http://schemas.google.com/spreadsheets/2006/extended">\n' +
        '<gsx:site>'+site+'</gsx:site>\n' +
        '<gsx:username>'+u+'</gsx:username>\n' +
        '<gsx:password>'+pw+'</gsx:password>\n' +
        '</entry>';
    return atom;
  };

  GoogleSpreadsheet.prototype.add = function(data){
    var handleSuccess = function(response,xhr) {
      if (xhr.status !== 200) {
        localStorage['error'] = xhr.status + ": " + xhr.statusText + ": " + xhr.responseText;
        console.log(xhr);
      } else {
        var success = document.getElementById('success');
        success.style.display = "block";
        console.log(xhr);
      }
    };

    var atom = GoogleSpreadsheet.constructSpreadAtomXml_('uuurl', 'bob', '123');
    var params = {
      'method': 'POST',
      'headers': {
        'GData-Version': '3.0',
        'Content-Type': 'application/atom+xml'
      },
      'body': atom
    };

    var url = this.jsonListUrl;
    bgPage.oauth.sendSignedRequest(url, handleSuccess, params);
  };

  GoogleSpreadsheet.process = function(response,xhr){
    if (xhr.status !== 200) {
      console.log(xhr.status + " Connection Failed");
      localStorage['error'] = "Connection failed";
      return false;
    }
    var data = JSON.parse(response);
    localStorage['rows'] = data.feed.entry.length / 3;
    var _i, _len, _ref, _results;
    _ref = data.feed.entry;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      cell = _ref[_i];
      _results.push(cell.content.$t);
    }
    localStorage["sheetData"] = _results;
  };

  return GoogleSpreadsheet;
})();


var access = new accessSheet();

document.addEventListener('DOMContentLoaded', function() {
  access.init();
});
