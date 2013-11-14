var DOCLIST_SCOPE = 'https://spreadsheets.google.com/feeds';
var DOCLIST_FEED = DOCLIST_SCOPE + '/default/private/full/';

var bgPage = chrome.extension.getBackgroundPage();

var util = {};

util.stringify = function(parameters) {
  var params = [];
  for(var p in parameters) {
    params.push(encodeURIComponent(p) + '=' +
    encodeURIComponent(parameters[p]));
  }
  return params.join('&');
};

util.unstringify = function(paramStr) {
  var parts = paramStr.split('&');
  var params = {};
  for (var i = 0, pair; pair = parts[i]; ++i) {
    var param = pair.split('=');
    params[decodeURIComponent(param[0])] = decodeURIComponent(param[1]);
  }
  return params;
};

var accessSheet = {

  init: function(){
    localStorage.clear();
    var sample_url = "https://docs.google.com/spreadsheet/ccc?key=0AutNQyCIKVnndF9xRnpxbDJxRTJjaWRjSENPbXZvbVE&usp=sharing";
    var url = sample_url;
    var googleSpreadsheet = new GoogleSpreadsheet();
    googleSpreadsheet.url(url);
    googleSpreadsheet.load(function(result) {
      $('#results').html(JSON.stringify(result).replace(/,/g,",\n"));
    });
  },

  other: function(){
    var urlLocation = "0AutNQyCIKVnndF9xRnpxbDJxRTJjaWRjSENPbXZvbVE";
    //http://spreadsheets.google.com/feeds/cells/0AutNQyCIKVnndF9xRnpxbDJxRTJjaWRjSENPbXZvbVE/od6/public/basic?alt=json-in-script
    var url = 'http://spreadsheets.google.com/feeds/list/' + urlLocation + '/od6/public/basic?alt=json-in-script';

    $.getJSON(url, function(data) {
        console.log(data);
        $('#results').html(data);
    });

  },

  test1: function(){
    var url = DOCLIST_FEED;
    var params = {
      'headers': {
      'GData-Version': '3.0'
      },
      'method': 'GET',
      'parameters': {'alt': 'json'}
    };

    bgPage.oauth.sendSignedRequest(url, processList, params);
  },

  test2: function(){
    urlLocation = "0AutNQyCIKVnndF9xRnpxbDJxRTJjaWRjSENPbXZvbVE";
    token = localStorage.getItem('oauth_tokenhttps://spreadsheets.google.com/feeds/');
    var url = 'https://spreadsheets.google.com/feeds/cells/' + urlLocation + '/od6/private/full?alt=json-in-script&access_token=' + encodeURIComponent(token) + '&callback=?';
    $.getJSON(url, function(data) {
        $('#results').html(data);
    });
  }

};

function processList(response,xhr){
  var data = JSON.parse(response);
  $('#results').html(data);
}

document.addEventListener('DOMContentLoaded', function () {
  accessSheet.test1();
});
