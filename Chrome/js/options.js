(function(){
  
  // Saves options to localStorage.
  function save_options() {
    localStorage["sheet_url"] = document.getElementById("sheet_url").value;
    // Update status to let user know options were saved.
    document.getElementById("status").textContent = "Options Saved.";
  }

  // Restores select box state to saved value from localStorage.
  function restore_options() {
    var curr_url = localStorage["sheet_url"];
    if (!curr_url || curr_url === "") {
      return false;
    } else {
      document.getElementById("sheet_url").value = curr_url;
      document.getElementById("save").textContent = "update";
      var sheetJump = document.getElementById("goToSheet");
      sheetJump.href = curr_url;
      sheetJump.style.display = "block";
    }
  }
  document.addEventListener('DOMContentLoaded', restore_options);
  document.getElementById('save').addEventListener('click', save_options);

})();