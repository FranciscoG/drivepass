// Saves options to localStorage.
function save_options() {
  var sheet_url = document.getElementById("sheet_url").value;
  localStorage["sheet_url"] = sheet_url;

  // Update status to let user know options were saved.
  var status = document.getElementById("status");
  status.innerHTML = "Options Saved.";
}

// Restores select box state to saved value from localStorage.
function restore_options() {
  var curr_url = localStorage["sheet_url"];
  if (!curr_url) {
    return;
  } else {
    document.getElementById("sheet_url").value = curr_url;
  }
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);