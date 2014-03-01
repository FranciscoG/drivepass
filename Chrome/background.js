var oauth,
oauth_config = {
  'request_url': 'https://www.google.com/accounts/OAuthGetRequestToken',
  'authorize_url': 'https://www.google.com/accounts/OAuthAuthorizeToken',
  'access_url': 'https://www.google.com/accounts/OAuthGetAccessToken',
  'consumer_key': 'anonymous',
  'consumer_secret': 'anonymous',
  'scope': 'https://spreadsheets.google.com/feeds/'
};

var app_name = localStorage.getItem('app_name');

if (app_name === null){
  utils.getJSON('/config.json', function(data){
    oauth_config.app_name = data.app_name;
    localStorage.setItem('app_name', data.app_name);
    oauth = ChromeExOAuth.initBackgroundPage(oauth_config);
  });
} else {
  oauth_config.app_name = app_name;
  oauth = ChromeExOAuth.initBackgroundPage(oauth_config);
}

function onAuthorized() {
  console.log('authorized');
}

oauth.authorize(onAuthorized);

/**
 * Shows the options page to the user if they haven't added their spreadsheet url yet
 */
if (!localStorage['sheet_url']) {
  chrome.tabs.create({url: "options.html"});
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  var _data = localStorage.getItem('_data');
  if (_data !== null){
    var tabUrl = utils.getHostname(sender.url);
    var deets = DrivePass.Password.findPW(JSON.parse(_data),tabUrl);
    sendResponse({username: deets[0], password: deets[1]});
  } else {
    sendResponse({data: null});
  }
});
