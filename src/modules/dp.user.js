var DrivePass = DrivePass || {};

DrivePass.User = (function() {

  var template = function(rowInfo) {
    var row = document.querySelector('#row_template');
    var rowClone = document.importNode(row.content, true);
    rowClone.querySelector('.site').textContent = rowInfo.site;
    rowClone.querySelector('.username').textContent = rowInfo.username;
    rowClone.querySelector('.password').textContent = rowInfo.password;
    document.getElementById('db_container').appendChild(rowClone);
  };

  var renderView = function() {
    _.each(DrivePass.DB().get(), function(el, i, list) {
      html5tmpl('row_template', list[i]).appendTo('db_container');
      //template(list[i]);
    });
  };

  var init = function() {
    renderView();
  };

  return {
    init: init
  };
});