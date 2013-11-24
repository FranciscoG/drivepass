var Generator = (function(){

 
  var toggle = function(evt){
    var gpOptions = document.getElementById('gpOptions');
    if (gpOptions.className === 'toggled'){
      gpOptions.className = "";
    } else {
      gpOptions.className = 'toggled';
    }
  };

  var getValues = function(){
    var charset,
        passLength = document.getElementById('digits').value || 15;
    [document.getElementById('uppercase'),
      document.getElementById('lowercase'),
      document.getElementById('numbers'),
      document.getElementById('symbols')].forEach(function(e){
        if (e.checked === true) {
          charset += e.value;
        }
    });
    return [passLength,charset];
  };

  var generatePassword = function(){
    var vals = getValues(),
        length = vals[0],
        charset = vals[1],
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    var pw = document.getElementById('pw');
    pw.textContent = retVal;
    pw.className = "generated";
  };

  var init = function(){
    document.getElementById('showGPoptions').addEventListener('click',toggle,false);
    document.getElementById('makePassword').addEventListener('click',generatePassword,false);
  };

  return {
    init:init
  };
});