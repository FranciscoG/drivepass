var utils = {
  /**
   * Add or remove the css class "show"
   * @param {object}  elm  - A DOM element 
   */
  toggle: function(elm) {
    if (elm.classList.contains("show")) {
      elm.classList.remove('show');
    } else {
      elm.classList.add('show');
    }
  },
  /**
   * simple toggler to add/remove a class that uses CSS3 transition to show/hide an element
   * @param  {string}   handler 
   * @param  {string}   targ
   */
  toggler: function(handler,targ) {
    var that = this;
    var elm = document.getElementById(targ);
    document.getElementById(handler).addEventListener('click',function(e){
      that.toggle(elm);
    },false);
  }
};