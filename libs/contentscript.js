(function(){

  var focused,
      passwordInput=[];
  
  // grab the focused input which should be the username field
  var getFocused = function() {
    focused = document.activeElement.id;
  };
  
  // grab all inputs and find all that are type=password 
  var nodes = document.getElementsByTagName('input');

  for (var i=0;i<nodes.length;i++) {
    if (nodes[i].type === "password") {
      passwordInput.push(nodes[i]);
    } else if (nodes[i].type === "text") {
      nodes[i].addEventListener('focus',getFocused,false);
    }
  }

  function insertDetails(un,pw) {
    document.getElementById(focused).value = un;
    passwordInput.forEach(function(e){
      e.value = pw;
    });
  }

  chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
   if (typeof request.username !== 'undefined' && typeof request.password !== 'undefined'){
      insertDetails(request.username,request.password);
      sendResponse({dom: "success"});
   } else {
      sendResponse({dom: "error"});
   }
  });

})();
