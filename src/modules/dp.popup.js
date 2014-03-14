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
      $hiddenSite = document.getElementById('hdnSite'),
      filteredData = JSON.parse(localStorage.getItem('_data')),
      fullData = JSON.parse(localStorage.getItem('_full')),
      activeUrl;

  var Sheet = new DrivePass.GoogleSpreadsheet();
  Sheet.init(DrivePass.Settings.gs_sheet_init);

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
    $un.textContent = utils.encodeHTML(result[0]);
    $pw.textContent = utils.encodeHTML(result[1]);
    $hiddenSite.value = utils.encodeHTML(result[2]);
    
    DrivePass.Browser.sendToPage({username: result[0], password: result[1]});
    
    $add.classList.remove('show');
    $update.classList.add('show');
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
          resetLocal();
        }
      });
    },false);
  };

  var bindUpdate = function(){
    $update.addEventListener('click', function(evt){
      var _site = $hiddenSite.value;
      var entry = findEntry(_site);
      var un = document.getElementById('un').textContent;
      var pw = document.getElementById('pw').textContent;
      var data = [_site,un,pw];
      Sheet.update(entry,data,function(result){
        if (result.success === false){
          handleStatus('error',result.message);
        } else {
          handleStatus('success', result.message);
          resetLocal(); // reload sheet after update
        }
      });
    }, false);
  };

  /**
   * Get Object key that matches site name, used when updating information
   * @param  {string} site      the website that you're trying to change data for
   * @return {string}           the object key
   */
  var findEntry = function(site){
    var _fullSheet = fullData.sheetData;
    for (var entry in _fullSheet.feed.entry) { 
      if (_fullSheet.feed.entry[entry].gsx$site.$t === site){
        return _fullSheet.feed.entry[entry];
      }
    }
  };

  var initCb = function(){
    /*
    TODO: check local storage option and either run below or do sheet.load with callback
    */
    activeUrl = DrivePass.Browser.activeTabUrl;
    
    Sheet.query('site',activeUrl, function(r){
      var qdata = DrivePass.Password.filterResults(r.queryData);
      console.log(qdata);
    });
    var found = DrivePass.Password.findPW(filteredData,activeUrl);
    if (found.length !== 3) {
      pwNotFound();
    } else {
      onSuccess(found);
    }
  };

  var resetLocal = function(cb){
    Sheet.load(function(response_data){
      localStorage.setItem('_full', JSON.stringify(response_data));
      if (response_data.success === true) {
        filteredData = DrivePass.Password.filterResults(response_data.sheetData);
        localStorage.setItem('_data', JSON.stringify(filteredData));
        if (typeof cb === "function") {
          cb();
        }
      }
    });
  };

  var init = function() {
    /**
     * Shows the options page to the user if they haven't added their spreadsheet url yet
     */
    if (!localStorage['sheet_url'] || localStorage['sheet_url'] === "") {
      handleStatus('error', "no spreadsheet set in options");
    } else {
      if (filteredData === null || fullData === null) {
        resetLocal(function(){
          DrivePass.Browser.getActiveTab(initCb);
        });
      } else {
        DrivePass.Browser.getActiveTab(initCb);
      }
      bindAdd();
      bindUpdate();
    }
  };

  return {
    init: init,
    resetLocal: resetLocal
  };
});