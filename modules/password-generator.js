var DrivePass = DrivePass || {};

DrivePass.Generator = (function(){
  var $uc = document.getElementById('uppercase'),
      $lc = document.getElementById('lowercase'),
      $nums = document.getElementById('numbers'),
      $show_symbols = document.getElementById('show_symbols'),
      $symbols = document.getElementById('symbols'),
      $pw = document.getElementById('pw');

  var getValues = function(){
    var includeChar ='',
        count = 0,
        charset = '',
        passLength = document.getElementById('digits').value || 15;

    if (passLength < 2){ passLength = 7; }
    [$uc,$lc,$nums].forEach(function(e){
      if (e.checked === true) {
        charset += e.value;
        //make sure at least 1 of the chosen characters are used
        var n = e.value.length;
        includeChar += e.value.charAt(Math.floor(Math.random() * n));
        count++;
      }
    });
    if ($show_symbols.checked === true) {
      charset += $symbols.value;
      var n = $symbols.value.length;
      includeChar += $symbols.value.charAt(Math.floor(Math.random() * n));
      count++;
    }
    return [passLength,charset,includeChar,count];
  };

  var generatePassword = function(e){
    e.preventDefault();
    var vals = getValues(),
        length = vals[0] - vals[3],
        charset = vals[1],
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    retVal += vals[2];
    $pw.textContent = retVal;
    $pw.className = "generated";
  };

  var init = function(){
    document.getElementById('makePassword').addEventListener('click',generatePassword,false);
  };

  return {
    init:init
  };
});