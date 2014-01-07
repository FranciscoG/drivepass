var issetParam = function(a){
  return (void 0===a || null===a) ? false : true;
};

var GoogleSpreadsheet = (function(){

  var bgPage = chrome.extension.getBackgroundPage();

  var _options = {};
  var _response;

  var processLoad = function(response,xhr){
    if (xhr.status !== 200) {
      _response = {success:false, message: xhr.status + ": Connection Failed", on: "load"};
      console.log(xhr);
    } else {
      _response = {success:true, message: 'spreadsheet successfully loaded', on: "load"};
      var data = JSON.parse(response);
      var _i = 0,
          _results = {},
          _entries = data.feed.entry;
      for (var prop in _entries) {
        _results[_i] = {
          site : _entries[prop].gsx$site.$t,
          pw : _entries[prop].gsx$password.$t,
          u : _entries[prop].gsx$username.$t
        };
        _i++;
      }
      _response.sheetData = _results;
    }
    //localStorage.setItem("result",JSON.stringify(_response));
    //return JSON.stringify(_response);
    if (_options.cb !== null) {
      _options.cb(_response);
    }
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

  var add = function(cb){
    _options.cb = (typeof cb === "function") ? cb : null;
    var params = {
      'method': 'POST',
      'headers': {
        'GData-Version': '3.0',
        'Content-Type': 'application/atom+xml'
      },
      'body': constructSpreadAtomXml_(_options.tab_url)
    };
    bgPage.oauth.sendSignedRequest(_options.jsonListUrl, processAdd, params);
  };

  var constructSpreadAtomXml_ = function(tabUrl) {
    var un = document.getElementById('un').textContent;
    var pw = document.getElementById('pw').textContent;
    var atomXML = '<entry xmlns="http://www.w3.org/2005/Atom" xmlns:gsx="http://schemas.google.com/spreadsheets/2006/extended">\n' +
        '<gsx:site>'+tabUrl+'</gsx:site>\n' +
        '<gsx:username>'+un+'</gsx:username>\n' +
        '<gsx:password>'+pw+'</gsx:password>\n' +
        '</entry>';
    return atomXML;
  };

  var processAdd = function(response,xhr){
    if (xhr.status !== 201) {
      _response = {success:false, message: xhr.status + ": error saving", on: "add"};
      console.log(xhr);
    } else {
      _response = {success:true, message: 'saved', on: "add"};
    }
    localStorage.setItem("result",JSON.stringify(_response));
    if (_options.cb !== null) {
      _options.cb();
    }
  };
  
  

  /*
    example usage and required parameters
    var spreadsheet = Googlespreadsheet.init({
      sheet_url : 'http://link.to.your?spreadsheet'
      tab_url : 'www.blabla.com' //active tab url, only necessary for 'add' method
    })

    returns status object
  */

  var init = function(options) {
    _options = options || {};

    if (issetParam(_options.sheet_url)) {
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
    } else {
      console.warn('options are undefined');
      return false;
    }
    return this;
  };

  return {
    init:init,
    load:load,
    add:add
  };

});