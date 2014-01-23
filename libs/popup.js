(function(){

  var initUI = function(){
    utils.toggler('showGPoptions','gpOptions');
    utils.toggler('showInfo','theInfo');
    utils.toggler('show_symbols','hidden_symbols');
  };
  
  var accessSheet = (function() {

    // caching DOM elements
    // I'm not using jQuery so the $ represents element IDs only
    var $loading = document.getElementById('loading'),
        $status = document.getElementById('status'),
        $un = document.getElementById('un'),
        $pw = document.getElementById('pw'),
        $add = document.getElementById('add'),
        $theInfo = document.getElementById('theInfo');

    var Sheet = new GoogleSpreadsheet();

   /**
    * This is the function that sends info to the contentscript.js 
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
            result.push(_data[prop].u,_data[prop].pw);
            return result;
          }
        }
      } else {
        console.warn('findPW: data not an object');
      }
    };

   /**
    * Strips out a domain's hostname from a URL string
    * @param  {string}  tabUrl
    * @return {string}
    */
    var getDomain = function(tabUrl){
      // inspired by: http://stackoverflow.com/a/12470263
      var tUrl = tabUrl || "",
          a = document.createElement('a');
      if (tUrl !== ""){
        a.href = tUrl;
        return a['hostname'];
      } else {
        console.warn('tab url undefined');
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
      chrome.browserAction.setIcon({path: 'assets/drive-pass19.png'});
    };

    /**
     * handle UI updates when password not found
     */
    var pwNotFound = function(){
      $loading.style.display = "none";
      handleStatus('error','password not found');
      utils.toggle($theInfo);
      chrome.browserAction.setIcon({path: 'assets/drive-pass19.png'});
    };

    /**
     * bind the event listener that handles adding a new entry into the google spreadheet
     */
    var bindAdd = function(){
      $add.addEventListener('click', function(evt) {
        Sheet.add(function(result){
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
        var activeUrl = getDomain(tab.url);
        
        Sheet.init({
          sheet_url : localStorage['sheet_url'],
          tab_url : activeUrl
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

  var animateIcon = function(){
    var i = 0;
    
    var drawing = window.setInterval(function() {
      i++;
      chrome.browserAction.setIcon({imageData: draw(i*2, i*4)});
      if (i ===30) {clearInterval(drawing);}
    }, 50);

    function draw(starty, startx) {
      var canvas = document.getElementById('canvas');
      var context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "rgba(0,200,0,255)";
      context.fillRect(startx % 19, starty % 19, 8, 8);
      context.fillStyle = "rgba(0,0,200,255)";
      context.fillRect((startx + 5) % 19, (starty + 5) % 19, 8, 8);
      context.fillStyle = "rgba(200,0,0,255)";
      context.fillRect((startx + 10) % 19, (starty + 10) % 19, 8, 8);
      return context.getImageData(0, 0, 19, 19);
    }
  };

  var access = new accessSheet();
  var generate = new Generator();
  
  document.addEventListener('DOMContentLoaded', function(e) {
    if (this.bDone) {
      return; // deal with DOMContentLoaded being fired twice for some reason
    }
    animateIcon();
    this.bDone = true;
    generate.init();
    access.init();
    initUI();
  });

})();
