var oauth,
oauth_config = {
  'request_url': 'https://www.google.com/accounts/OAuthGetRequestToken',
  'authorize_url': 'https://www.google.com/accounts/OAuthAuthorizeToken',
  'access_url': 'https://www.google.com/accounts/OAuthGetAccessToken',
  'consumer_key': 'anonymous',
  'consumer_secret': 'anonymous',
  'scope': 'https://spreadsheets.google.com/feeds/'
};

/*
 * Chrome Extension oAuth source: http://developer.chrome.com/extensions/tut_oauth
 */
function onAuthorized() {
  console.log('authorized');
}

var app_name = localStorage.getItem('app_name');

if (app_name === null || app_name === "") {
  chrome.tabs.create({url: "options.html"});
} else {
  oauth_config.app_name = "DrivePass Chrome Extension - " + app_name;
  oauth = ChromeExOAuth.initBackgroundPage(oauth_config);
  oauth.authorize(onAuthorized);
}

/**
 * Shows the options page to the user if they haven't added their spreadsheet url yet
 */
if (!localStorage['sheet_url'] || localStorage['sheet_url'] === "") {
  chrome.tabs.create({url: "options.html"});
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (sender.url === sender.tab.url && request.method === "getPW") {
    var _data = localStorage.getItem('_data');
    if (_data !== null){
      var tabUrl = utils.getHostname(sender.url);
      var deets = DrivePass.Password.findPW(JSON.parse(_data),tabUrl);
      sendResponse({username: deets[0], password: deets[1], url:sender.url});
    }
  }
});

/*
 * setting up the right-click menu item
 */

function contextMenusOnclick(){
  console.log('reseting local cache');
  DrivePass.Popup().resetLocal();
}

chrome.contextMenus.create({
  "title": "refresh local data",
  "contexts": ["all"],
  "id" : "999"
}, function(){
  if (chrome.extension.lastError) {
    console.log("contextmenu error: " + chrome.extension.lastError.message);
  }
});
chrome.contextMenus.onClicked.addListener(contextMenusOnclick);
