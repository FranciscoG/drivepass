var DrivePass = DrivePass || {};

DrivePass.Signal = (function() {
  'use strict';

  var topics = {},
    subUid = -1;

  var listen = function(topic, func) {
    if (!topics[topic]) {
      topics[topic] = [];
    }
    var token = (++subUid).toString();
    topics[topic].push({
      token: token,
      func: func
    });
    return token;
  };

  var broadcast = function(topic, args) {
    if (!topics[topic]) {
      return false;
    }
    setTimeout(function() {
      var subscribers = topics[topic],
        len = subscribers ? subscribers.length : 0;

      while (len--) {
        subscribers[len].func(topic, args);
      }
    }, 0);
    return true;
  };

  var off = function(token) {
    for (var m in topics) {
      if (topics[m]) {
        for (var i = 0, j = topics[m].length; i < j; i++) {
          if (topics[m][i].token === token) {
            topics[m].splice(i, 1);
            return token;
          }
        }
      }
    }
    return false;
  };
  return {
    broadcast: broadcast,
    listen: listen,
    off: off
  };
})();