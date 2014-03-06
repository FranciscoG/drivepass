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

  var createBody = function(fileData, callback){
    var boundary = '-------314159265358979323846';
    var delimiter = "\r\n--" + boundary + "\r\n";
    var close_delim = "\r\n--" + boundary + "--";
    
    var reader = new FileReader();
    reader.readAsBinaryString(fileData);

    reader.onload = function(e) {
      var contentType = fileData.type || 'application/octet-stream';
      var metadata = {
        'title': fileData.fileName,
        'mimeType': contentType
      };

      var base64Data = btoa(reader.result);
      var multipartRequestBody =
          delimiter +
          'Content-Type: application/json\r\n\r\n' +
          JSON.stringify(metadata) +
          delimiter +
          'Content-Type: ' + contentType + '\r\n' +
          'Content-Transfer-Encoding: base64\r\n' +
          '\r\n' +
          base64Data +
          close_delim;

      request(multipartRequestBody, callback);
    };
  };

  var request = function(data,cb){
    options.cb = (typeof cb === "function") ? cb : createCallback;
    var boundary = '-------314159265358979323846';
    var params = {
      'method': 'POST',
      'params': {
        'convert' : true,
        'uploadType': 'multipart',
        'visibility' : 'private'
      },
      'headers': {
        'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
      },
      'body': data
    };

    DrivePass.Browser.oAuthSendRequest(options.driveAPI, options.cb, params);
  };

  var init = function(){
    var myBlob = new Blob(["site,username,password"], {type: 'text/csv', fileName: 'DrivePass DB'});
    createBody(myBlob, createCallback);
  };

  return {
    init: init
  };
});