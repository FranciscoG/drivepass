var Generator = (function(){

 
  var toggle = function(evt){
    var gpOptions = document.getElementById('gpOptions');
    gpOptions.className = (gpOptions.className === "toggled") ? "" : "toggled";
  };

  var getValues = function(){
    var includeChar ='',
        count = 0,
        charset = '',
        passLength = document.getElementById('digits').value || 15;
    if (passLength < 2){ passLength = 7; }
    [document.getElementById('uppercase'),
      document.getElementById('lowercase'),
      document.getElementById('numbers'),
      document.getElementById('symbols')].forEach(function(e){
        if (e.checked === true) {
          charset += e.value;
          //make sure at least 1 of the chosen characters are used
          var n = e.value.length;
          includeChar += e.value.charAt(Math.floor(Math.random() * n));
          count++;
        }
    });
    return [passLength,charset,includeChar,count];
  };

  var generatePassword = function(e){
    e.preventDefault();
    console.log(getValues());
    var vals = getValues(),
        length = vals[0] - vals[3],
        charset = vals[1],
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    retVal += vals[2];
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