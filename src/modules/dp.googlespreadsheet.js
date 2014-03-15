var DrivePass = DrivePass || {};

DrivePass.GoogleSpreadsheet = (function(){

  var _options = {},
      _response;

  var processLoad = function(response,xhr){
    if (xhr.status !== 200) {
      _response = {success:false, message: xhr.status + ": Connection Failed"};
      console.warn(xhr);
    } else {
      _response = {success:true, message: 'spreadsheet successfully loaded'};
      _response.sheetData = JSON.parse(response);
    }
    DrivePass.Signal.broadcast('gs_data_loaded', _response);

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

  /*
    https://developers.google.com/google-apps/spreadsheets/?hl=fr-FR#updating_a_list_row
    
    example entry:
    <entry xmlns='http://www.w3.org/2005/Atom' xmlns:gsx='http://schemas.google.com/spreadsheets/2006/extended'>  
    <id>https://spreadsheets.google.com/feeds/list/0AutNQyCIKVnndDB3WUFKRmZ6Y1BlRXcxY0p5VDlUbGc/od6/private/full/agihe</id>
    <updated>2014-02-25T05:51:56.809Z</updated>
    <category scheme='http://schemas.google.com/spreadsheets/2006' term='http://schemas.google.com/spreadsheets/2006#list'/>
    <title type='text'>test_test</title>
    <content type='text'>username: test, password: test</content> 
    <link rel='self' type='application/atom+xml' href='https://spreadsheets.google.com/feeds/list/0AutNQyCIKVnndDB3WUFKRmZ6Y1BlRXcxY0p5VDlUbGc/od6/private/full/agihe'/>
    <link rel='edit' type='application/atom+xml' href='https://spreadsheets.google.com/feeds/list/0AutNQyCIKVnndDB3WUFKRmZ6Y1BlRXcxY0p5VDlUbGc/od6/private/full/agihe/gglbng5oc977'/> 
    <gsx:site>test_test</gsx:site>
    <gsx:username>test</gsx:username>
    <gsx:password>test</gsx:password>
    </entry>
 */
  var constructUpdateSpreadAtomXml_ = function(entry,data) {
    var atomXML = "<entry xmlns='http://www.w3.org/2005/Atom' xmlns:gsx='http://schemas.google.com/spreadsheets/2006/extended' ";
    atomXML += "xmlns:gd='http://schemas.google.com/g/2005' gd:etag='"+ entry.gd$etag +"'>\n";
    atomXML += '<id>' + entry.id.$t + '</id>\n';
    atomXML += '<updated>' + entry.updated.$t + '</updated>\n';
    atomXML += '<category scheme="http://schemas.google.com/spreadsheets/2006" term="http://schemas.google.com/spreadsheets/2006#list"/>\n';
    atomXML += "<title type='text'>" + entry.title.$t + "</title>\n";
    atomXML +=  "<content type='text'>"+ entry.content.$t +"</content>\n";
    atomXML += '<link rel="self" type="application/atom+xml" href="'+entry.link[0].href+'"/>\n';
    atomXML += '<link rel="edit" type="application/atom+xml" href="'+entry.link[1].href+'"/>\n';
    var cols = _options.columns;
    for (var i=0; i < cols.length; i++){
      atomXML += '<gsx:' + cols[i] + '>' + data[i] + '</gsx:' + cols[i] +'>\n';
    }
    atomXML += '</entry>';
    return atomXML;
  };

  var update = function(entry,data,cb){
    _options.cb = (typeof cb === "function") ? cb : null;
    var params = {
      'method': 'PUT',
      'headers': {
        'GData-Version': '3.0',
        'Content-Type': 'application/atom+xml',
        'if-match' : '*'
      },
      'body': constructUpdateSpreadAtomXml_(entry,data)
    };
    DrivePass.Browser.oAuthSendRequest(entry.link[1].href, processUpdate, params);
  };

  var processAdd = function(response,xhr){
    if (xhr.status !== 201) {
      _response = {success:false, message: xhr.status + ": error saving"};
      console.warn(xhr);
    } else {
      _response = {success:true, message: 'saved successfully'};
    }
    DrivePass.Signal.broadcast('gs_data_added', _response);

    if (_options.cb !== null) {
      _options.cb(_response);
    }
    return _response;
  };

  var processUpdate = function(response,xhr){
    if (xhr.status !== 200) {
      _response = {success:false, message: xhr.status + ": error updating"};
      console.warn(xhr);
    } else {
      _response = {success:true, message: 'update successful'};
    }
    DrivePass.Signal.broadcast('gs_data_updated', _response);

    if (_options.cb !== null) {
      _options.cb(_response);
    }
    return _response;
  };

  var processQeury = function(response,xhr) {
    if (xhr.status !== 200) {
      _response = {success:false, message: xhr.status + ": error querying"};
      console.warn(xhr);
    } else {
      _response = {success:true, message: 'query successful'};
      _response.queryData = JSON.parse(response);
    }
    DrivePass.Signal.broadcast('gs_data_query', _response);

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
    var q = col +'=' + data;
    _options.cb = (typeof cb === "function") ? cb : null;
    var params = {
      'method': 'GET',
      'parameters': {
        'alt': 'json',
        'sq' : q.replace(' ', '%20')
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
    init:init,
    load:load,
    add:add,
    update:update,
    query:query
  };

});