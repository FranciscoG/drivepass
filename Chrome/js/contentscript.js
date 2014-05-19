(function() {
  if (!chrome.runtime) {
    // Chrome 20-21
    chrome.runtime = chrome.extension;
  } else if (!chrome.runtime.onMessage) {
    // Chrome 22-25
    chrome.runtime.onMessage = chrome.extension.onMessage;
    chrome.runtime.sendMessage = chrome.extension.sendMessage;
    chrome.runtime.onConnect = chrome.extension.onConnect;
    chrome.runtime.connect = chrome.extension.connect;
  }

  var possibleUn = [],
    passwordInput = [],
    isGoodForm = false,
    passwordID, usernameID;

  var addBgImage = function(el) {
    el.style.cssText = "background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpBQzlCQ0I3MjkxRDUxMUUzODA5RDlDQzg5MkRCMzg3OCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpBQzlCQ0I3MzkxRDUxMUUzODA5RDlDQzg5MkRCMzg3OCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjhEOEFFQjA5OTFENTExRTM4MDlEOUNDODkyREIzODc4IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjhEOEFFQjBBOTFENTExRTM4MDlEOUNDODkyREIzODc4Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+ujObnQAAAjpJREFUeNp8k01o1EAUx/+TZEmyu91ud7ebFsQWrR8IQnEVqUUEQY89qrAI1bo9eSgIeurRQy+K4q34cRLXQ0Fkb4oKohdbqwdFEOrBg1G6XyWkm+wkvqSzJbZrB368mcnk/17+b8J834dhGNgyjhDXidOER1SIu8Sn6CHTNCFh+5gkFonzRD8RqF8mlkX8Z2wV2Ec8FPM7xCHioJgH474481+BkohPiBniK/FNzMvi2aWdBIZFfN7l0xZEHNlJoCriWheBuohudFMRUSPOESdCVYlNuY63t2FxHT6g65Kd0OWTnucHjwvEReIp0WKijfO0uBJKMUrR9pDmLlIZjUqR8fuPQ9s+kkkFnPud5A+ojVOdCgqbNTEJrdUm7GIBL2b7MRiz8Pa1hbOlL0FlUFUpelc2PWhsOMLAzCZ69ufxa+Iobq9loKcVnCnmMX3BQKNhQ5ZZR6AWFdioy6VL53O4xVFogzHce+Ni+f064HDMzQyhLxtHteYEebp3gdUt8InD8MZGoDnUkEcLuDr5CmiuIH2sivLNOFoO6bW3d8EDmRncej6+B25vFepiHMO5OXxWLZTmc8gfSCMm2RgwrsG2bCiy5kcFdDAWeiA9WwIbG0euPoveUwNIpYDHKyS8RJnflZFdNaH35UAdjUcFhkIjMkmwD9/Rc+s4WPYnatbHsLhdSiy0qfnjBtqqSi/LwXp3VOAlMUqOrEupPPMqFVTVMnzGA5sscscDbzOmJSAlMqTJE+LvxF8BBgBqvraM87qjzwAAAABJRU5ErkJggg==);padding-right: 0px;background-attachment: scroll;background-position: 100% 50%;background-repeat: no-repeat no-repeat;";
  };

  var isUsernameInput = function(node) {
    return (/signin|email|login|username|us(e?)r/gi.test(node.id) && (node.type === "text" || node.type === "email") && !node.disabled && node.style.display !== 'none') ? true : false;
  };

  /* Not sure if I'm going to use this in the end, might not be necessary
   * I was thinking that I could save input IDs when a user adds/updates so that
   * instead of parsing through all the inputs I could just select them directly
 
  // Get input IDs on a form submit
  var bindIDgetter = function(elm) {
    elm.addEventListener('click', function(e) {
      var currentForm = e.srcElement.form;
      var len = currentForm.length;
      for (var i = 0; i < len; i++) {
        if (currentForm[i].type === "password") {
          isGoodForm = true;
          passwordID = currentForm[i].id;
          console.log(passwordID);
        }
        if (isUsernameInput(currentForm[i])) {
          isGoodForm = true;
          usernameID = currentForm[i].id;
          console.log(usernameID);
        }
      }
    });
  };
  var forms = document.getElementsByTagName('form');
  for (var n = 0; n < forms.length; n++) {
    if (/search/gi.test(forms[n].id) === false) {
      bindIDgetter(forms[n]);
    }
  }
  */

  // get all inputs
  var filterInputs = function() {
    var nodes = document.getElementsByTagName('input');
    // grab all inputs and find all that are type=password or text
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].type === "password") {
        passwordInput.push(nodes[i]);
      } else if (isUsernameInput(nodes[i])) {
        possibleUn.push(nodes[i]);
      }
    }
  };

  var encodeHTML = function(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  };

  var insertDetails = function(un, pw) {
    if (typeof un === "undefined" || typeof pw === "undefined") {
      console.warn("username or password undefined");
    }
    possibleUn.forEach(function(e) {
      e.autocomplete = "on";
      e.value = encodeHTML(un);
      addBgImage(e);
    });
    passwordInput.forEach(function(e) {
      e.autocomplete = "on";
      e.value = encodeHTML(pw);
      addBgImage(e);
    });
  };

  // fill in username and pw on page load
  chrome.runtime.sendMessage({
    method: "getPW"
  }, function(response) {
    if (response.data !== null && typeof response.password !== "undefined") {
      filterInputs();
      insertDetails(response.username, response.password);
    }
  });

  // fill in username and pw from browser action
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (typeof request.username !== 'undefined' && typeof request.password !== 'undefined') {
      filterInputs();
      insertDetails(request.username, request.password);
      sendResponse({
        dom: "success"
      });
    } else {
      sendResponse({
        dom: "error"
      });
    }
  });

})();