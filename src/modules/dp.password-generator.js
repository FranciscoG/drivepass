var DrivePass = DrivePass || {};

DrivePass.Generator = (function() {
  var $uc = document.getElementById('uppercase'),
    $lc = document.getElementById('lowercase'),
    $nums = document.getElementById('numbers'),
    $show_symbols = document.getElementById('show_symbols'),
    $symbols = document.getElementById('symbols'),
    $pw = document.getElementById('pw');

  var getValues = function() {
    var includeChar = '', // var holding 1 of each item chosen to be included
      count = 0,
      charset = '', // all the letters, numbers, and symbols to be included
      passLength = document.getElementById('digits').value || 26;

    if (passLength < 4) {
      passLength = 4; // setting a minimum password length of 4
    }
    [$uc, $lc, $nums].forEach(function(e) {
      if (e.checked === true) {
        charset += e.value;
        //make sure at least 1 of the chosen characters are used
        includeChar += _.sample(e.value);
        count++;
      }
    });
    if ($show_symbols.checked === true) {
      charset += $symbols.value;
      includeChar += _.sample($symbols.value);
      count++;
    }
    return [passLength, charset, includeChar, count];
  };

  var generatePassword = function(e) {
    e.preventDefault();
    var vals = getValues(),
      length = vals[0] - vals[3], //chosen pw length - length of items chosen to be included
      charset = vals[1],
      retVal = "";
    retVal = _.sample(charset, length).join('');
    retVal += vals[2];
    $pw.textContent = _.shuffle(retVal).join('');
    $pw.className = "generated";
    return true;
  };

  var init = function() {
    document.getElementById('makePassword').addEventListener('click', generatePassword, false);
  };

  return {
    init: init
  };
});