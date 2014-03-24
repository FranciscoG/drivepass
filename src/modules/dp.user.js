var DrivePass = DrivePass || {};

DrivePass.User = (function() {

  var renderView = function() {
    _.each(DrivePass.DB().get(), function(el, i, list) {
      html5tmpl('row_template', list[i]).appendTo('db_container');
    });
  };

  var init = function() {
    renderView();
  };

  return {
    init: init
  };
});