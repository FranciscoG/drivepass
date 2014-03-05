var DrivePass = DrivePass || {};

DrivePass.GoogleDrive = (function(){
  /*
  * https://stackoverflow.com/questions/12765813/upload-csv-to-google-drive-spreadsheet-using-drive-v2-api
  * https://developers.google.com/drive/v2/reference/files/insert 
  */

  var options = {};
  options.driveAPI = "https://www.googleapis.com/upload/drive/v2/files";

  var createCallback = function(response,xhr){
    console.log(response);
    console.log(xhr);
  };

  var create = function(data,cb){
    options.cb = (typeof cb === "function") ? cb : createCallback;
    var params = {
      'method': 'POST',
      'params': {
        'convert' : true,
        'uploadType': 'media',
        'visibility' : 'private'
      },
      'headers': {
        'Content-Type': 'text/csv'
      },
      'body': 'site,username,password'
    };

    DrivePass.Browser.oAuthSendRequest(options.driveAPI, options.cb, params);
  };

  return {
    create: create
  };
});