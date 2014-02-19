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
    
    Sheet.init({
      sheet_url : localStorage['sheet_url'],
      columns : ['site','username','password']
    });

    Sheet.load(function(result){
      activeUrl = DrivePass.Browser.activeTabUrl;
      var found = findPW(result.sheetData,activeUrl);
      if (typeof found === 'undefined') {
        pwNotFound();
      } else {
        onSuccess(found);
      }
    });
    
  };

  var init = function() {
    DrivePass.Browser.getActiveTab(initCb);
    bindAdd();
  };

  return {
    init: init
  };
});