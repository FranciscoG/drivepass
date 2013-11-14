var DOCLIST_SCOPE = 'https://spreadsheets.google.com/feeds';
var DOCLIST_FEED = DOCLIST_SCOPE + '/default/private/full/';

var bgPage = chrome.extension.getBackgroundPage();

var util = {
  convertArray : function(arr){
    if (arr !== null) {
      var a = 0, newObj = {};
      for (var i = 0; i < arr.length; i = i+3) {
        newObj[a] = {
          site : arr[i],
          u : arr[i+1],
          pw : arr[i+2]
        };
        a++;
      }
      return newObj;
    } else {
      console.warn('convertArray: array is null');
    }
  },
  findPW : function(data,tabDomain) {
    if (data !== null && typeof data === 'object') {
      for (prop in data) {
        if (data[prop].site === tabDomain) {
          var result = [];
          result.push(data[prop].u,data[prop].pw);
          return result;
        }
      }
    } else {
      console.warn('findPW: data not an object');
    }
  }
  getDomain : function(tabUrl){
    if (tabUrl !== null) {
      var tabDomain, finalDomain      
      if (/http:/i.test(tabUrl)) { 
        tabDomain = tabUrl.split('http://'); 
      } else if (/https/i.test(tabUrl)) { 
        tabDomain = tabUrl.split('https://'); 
      }
      finalDomain = tabDomain[1].split('/');
      return finalDomain[0];
    } else {
      console.warn('getDomain: url is null');
    }
  }
};

var accessSheet = {

  init: function(){
    //localStorage.removeItem('GoogleSpreadsheet_data');
    //public test spreadsheet:
    //var sample_url = "https://docs.google.com/spreadsheet/ccc?key=0AutNQyCIKVnndF9xRnpxbDJxRTJjaWRjSENPbXZvbVE&usp=sharing";
    //private test spreadsheet:
    //var sample_url = "https://docs.google.com/spreadsheet/ccc?key=0AutNQyCIKVnndEdRRE5IUnhSOThQUTdXNmoxSGk1M1E#gid=0";
    var sample_url = localStorage["sheet_url"];
    var url = sample_url;
    var googleSpreadsheet = new GoogleSpreadsheet();
    googleSpreadsheet.url(url);
    
    googleSpreadsheet.load(function(result) {
      chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
      }, function(array_of_Tabs) {
        var tab = array_of_Tabs[0],
            tabUrl = tab.url;
        
        else if (/https/i.test(tabUrl)) { tabDomain = tabUrl.split('https://'); }
        plur = tabDomain[1].split('/');
        var spreadSheetData = util.convertArray(result.data);
        var found = util.findPW(spreadSheetData,plur[0]);
        $('#un').text(found[0]);
        $('#pw').text(found[1]);
      });
    });
  },

};


document.addEventListener('DOMContentLoaded', function() {
  accessSheet.init();
});
