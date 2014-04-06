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
    $currSite = document.getElementById('currSite'),
    fullData = JSON.parse(localStorage.getItem('_full')),
    activeUrl;

  var Sheet = DrivePass.Sheet;

  // handle UI hide/show elements
  utils.toggler('showGPoptions', 'gpOptions');
  utils.toggler('showInfo', 'theInfo');
  utils.toggler('show_symbols', 'hidden_symbols');

  // init the Password Generator module
  var generate = new DrivePass.Generator();

  /**
   * Updates the status element ID and displays it
   * @param  {string} status
   * @param  {string} message
   */
  var handleStatus = function(status, message) {
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
  var onSuccess = function(result) {
    console.log(result);
    $loading.style.display = "none";
    handleStatus('success', 'password found');
    $un.textContent = utils.encodeHTML(result.username);
    $pw.textContent = utils.encodeHTML(result.password);
    $currSite.textContent = utils.encodeHTML(result.site);

    DrivePass.Browser.sendToPage({
      username: result.username,
      password: result.password
    });

    $add.classList.remove('show');
    $update.classList.add('show');
  };

  /**
   * handle UI updates when password not found
   */
  var pwNotFound = function() {
    $loading.style.display = "none";
    handleStatus('error', 'password not found');
    utils.toggle($theInfo);
  };

  /**
   * bind the event listener that handles adding a new entry into the google spreadheet
   */
  var bindAdd = function() {
    $add.addEventListener('click', function(evt) {
      var un = $un.textContent;
      var pw = $pw.textContent;
      var data = [activeUrl, un, pw];
      Sheet.add(data, function(result) {
        if (result.success === false) {
          handleStatus('error', result.message);
        } else {
          handleStatus('success', result.message);
          DrivePass.ResetLocal().init();
        }
      });
    }, false);
  };

  var bindUpdate = function() {
    $update.addEventListener('click', function(evt) {
      var _site = $currSite.textContent;
      var entry = findEntry(_site);
      var un = $un.textContent;
      var pw = $pw.textContent;
      var data = [_site, un, pw];
      Sheet.update(entry, data, function(result) {
        if (result.success === false) {
          handleStatus('error', result.message);
        } else {
          handleStatus('success', result.message);
          DrivePass.ResetLocal().init();
        }
      });
    }, false);
  };

  /**
   * Get Object key that matches site name, used when updating information.  Updating a row in a Google Spreadsheet
   * requires a lot more data from the full JSON response than just the un,pw, and site.
   * @param  {string} site      the website that you're trying to change data for
   * @return {string}           the object key
   */
  var findEntry = function(site) {
    var _fullSheet = fullData.sheetData;
    for (var entry in _fullSheet.feed.entry) {
      if (_fullSheet.feed.entry[entry].gsx$site.$t === site) {
        return _fullSheet.feed.entry[entry];
      }
    }
  };

  var initCb = function() {
    activeUrl = DrivePass.Browser.activeTabUrl.replace('www.', "");

    var found = DrivePass.DB({
      site: activeUrl
    }).get();

    if (found.length === 0) {
      pwNotFound();
    } else {
      onSuccess(found[0]);
    }
  };


  var init = function() {
    /**
     * Shows the options page to the user if they haven't added their spreadsheet url yet
     */
    if (!localStorage['sheet_url'] || localStorage['sheet_url'] === "") {
      handleStatus('error', "no spreadsheet set in options");
      chrome.tabs.create({
        url: "options.html"
      });
    } else {
      if (fullData === null) {
        DrivePass.ResetLocal().init(function() {
          DrivePass.Browser.getActiveTab(initCb);
        });
      } else {
        DrivePass.Browser.getActiveTab(initCb);
      }
      bindAdd();
      bindUpdate();
    }
  };

  var onload = function() {
    document.addEventListener('DOMContentLoaded', function(e) {
      if (this.bDone) {
        return; // deal with DOMContentLoaded being fired twice for some reason
      }
      this.bDone = true;
      generate.init();
      init();
    });
  };

  return {
    init: onload
  };
});