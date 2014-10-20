var DrivePass = DrivePass || {};

DrivePass.User = (function() {

  var renderView = function() {
    _.each(DrivePass.DB().get(), function(el, i, list) {
      html5tmpl('row_template', list[i]).appendTo('db_container');
    });
  };

  var filterSearch = function() {
    var options = {
      valueNames: ['site']
    };
    var List = window.List;
    window.userList = new List('siteList', options);
  };

  var init = function() {
    renderView();
    filterSearch();
  };

  return {
    init: init
  };
});