var DrivePass = DrivePass || {};

DrivePass.Password = {
  /*
    Some password processing utilities
   */
  
  /**
  * Searches through the spreadsheet data for the matching domain
  * @param  {object}  data - json object
  * @param  {string}  tabDomain
  * @return {array}   [username,password]
  */
  findPW : function(data,tabDomain) {
    var _data = data || {},
        _result = [];
    if (_.keys(_data).length > 0) {
      for (var prop in _data) {
        if (tabDomain.indexOf(_data[prop].site.trim()) !== -1) {
          _result.push(_data[prop].username,_data[prop].password,_data[prop].site);
        }
      }
      return _result;
    } else {
      throw new Error('findPW: data not an object');
    }
  },

  /**
   * filter out the actual spreadsheet data from the rest of the json response
   * @param  {object} response the entire Google Spreadsheet JSON list response
   * @return {object}          the filtered data in a new object
   */
  filterResults : function(response){
    var data = response || {};
    var _i = 0,
        _results = {},
        _entries = data.feed.entry,
        cols = DrivePass.Settings.gs_sheet_init.columns;

    for (var prop in _entries) {
      _results[_i] = {};
      for (var n=0; n < cols.length; n++){
        var gsx = 'gsx$'+cols[n];
        _results[_i][cols[n]] = _entries[prop][gsx].$t;
      }
      _i++;
    }
    return _results;
  }

};