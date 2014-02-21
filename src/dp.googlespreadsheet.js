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