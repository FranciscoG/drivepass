var oauth = ChromeExOAuth.initBackgroundPage({
  'request_url': 'https://www.google.com/accounts/OAuthGetRequestToken',
  'authorize_url': 'https://www.google.com/accounts/OAuthAuthorizeToken',
  'access_url': 'https://www.google.com/accounts/OAuthGetAccessToken',
  'consumer_key': 'anonymous',
  'consumer_secret': 'anonymous',
  'scope': 'https://spreadsheets.google.com/feeds/',
  'app_name': 'Drive Pass Chrome Extension'
});

/**
 * oAuth callback function, updates the UI.  Very minimal, more designed page to come
 * @param  {string}   resp : the respnse string sent by the oAuth extension when successfully authorized
 * @param  {object}   xhr  : the ajax response object with http code, etc
 */
function callback(resp, xhr) {
  docBody = document.getElementsByTagName('body');
  docBody.innerHTML = resp;
}

function onAuthorized() {
  var url = 'https://spreadsheets.google.com/feeds/default/private/full';
  var request = {
    'method': 'GET',
    'parameters': {'alt': 'json'}
  };

  oauth.sendSignedRequest(url, callback, request);
}

oauth.authorize(onAuthorized);

/**
 * Shows the options page to the user if they haven't added their spreadsheet url yet
 */
if (!localStorage['sheet_url']) {
  chrome.tabs.create({url: "options.html"});
}