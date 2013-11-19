var bgPage = chrome.extension.getBackgroundPage();

var accessSheet = (function() {
  var init,convertArray,findPW,getDomain,loadData,bindAdd;

  var sheet = new GoogleSpreadsheet();

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
      console.warn('updateUI: results are null');
    }
  };

  bindAdd = function(){
    add = document.getElementById('add');
    add.addEventListener('click', function(evt) {
      sheet.add();
      var error = localStorage['error'];
      if (typeof error !== 'undefined'){
        handleError(error);
      }
    },false);
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
      sheet.setTabUrl(activeUrl);
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
  function GoogleSpreadsheet() {
    this.sourceIdentifier = localStorage["sheet_url"];
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
    this.tabUrl = "";
  }

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

  GoogleSpreadsheet.prototype.setTabUrl = function(tabUrl) {
    this.tabUrl = tabUrl || "";
    localStorage['tabUrl'] = tabUrl || "";
  };

  GoogleSpreadsheet.constructSpreadAtomXml_ = function() {
    var un = document.getElementById('un').textContent;
    var pw = document.getElementById('pw').textContent;
    var atomXML = '<entry xmlns="http://www.w3.org/2005/Atom" xmlns:gsx="http://schemas.google.com/spreadsheets/2006/extended">\n' +
        '<gsx:site>'+localStorage['tabUrl']+'</gsx:site>\n' +
        '<gsx:username>'+un+'</gsx:username>\n' +
        '<gsx:password>'+pw+'</gsx:password>\n' +
        '</entry>';
    return atomXML;
  };

  GoogleSpreadsheet.prototype.add = function(data){
    var handleSuccess = function(response,xhr) {
      if (xhr.status !== 201) {
        localStorage['error'] = xhr.status + ': error saving';
      } else {
        document.getElementById('error').style.display = "none";
        document.getElementById('success').style.display = "block";
      }
      console.log(xhr);
    };

    var params = {
      'method': 'POST',
      'headers': {
        'GData-Version': '3.0',
        'Content-Type': 'application/atom+xml'
      },
      'body': GoogleSpreadsheet.constructSpreadAtomXml_()
    };

    var url = this.jsonListUrl;
    bgPage.oauth.sendSignedRequest(url, handleSuccess, params);
  };

  GoogleSpreadsheet.process = function(response,xhr){
    if (xhr.status !== 200) {
      console.log(xhr.status + ": Connection Failed");
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
