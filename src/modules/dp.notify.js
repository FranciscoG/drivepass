/**
 * Module to handle messaging for all parts of the app.  Create DOM elements and handles UI
 */

var DrivePass = DrivePass || {};

DrivePass.Notify = (function(type, msg) {

  var msg_container = document.createElement('div');
  msg_container.classList.add('dp_notify', type);

  var msg_textContainer = document.createElement('p');

  msg_textContainer.textContent = msg;



});