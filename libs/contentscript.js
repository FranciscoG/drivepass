(function(){

  var focused;

  var getFocused = function() {
    focused = document.activeElement.id;
  };
  
  var nodes = document.getElementsByTagName('input');

  for (var i=0;i<nodes.length;i++) {
    if (nodes[i].type === "text" || nodes[i].type === "password") {
      nodes[i].addEventListener('focus',getFocused,false);
    }
  }

  function insertPW(pw) {
    document.getElementById(focused).value = pw;
  }

  chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
   if (typeof request.password !== 'undefined' && request.password !== ''){
      insertPW(request.password);
      sendResponse({dom: "success"});
   } else {
      sendResponse({dom: "error"});
   }
  });

})();
