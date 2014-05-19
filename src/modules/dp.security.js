var DrivePass = DrivePass || {};

DrivePass.Password = (function(sjcl) {

  sjcl.random.startCollectors();

  var things = {
    iv: sjcl.random.randomWords(4, 0)
  };

  var hash = function(password) {
    var params = {};
    params.iter = 1000;
    params.salt = sjcl.random.randomWords(2, 0);
    var p = sjcl.misc.cachedPbkdf2(password, params);
    var x = p.key.slice(0, 256 / 32);
    x = sjcl.codec.hex.fromBits(x);
    return x.toUpperCase().replace(/ /g, '').replace(/(.{8})/g, "$1 ").replace(/ $/, '');
  };

  return {
    hash: hash
  };

})(sjcl);

/*
adata: ""
ciphertext: ""
freshiv: true
freshsalt: true
iter: 1000
iv: Array[0]
json: true
key: Array[8]
  0: 1447440996
  1: 281118551
  2: 821043674
  3: -330744501
  4: -613092380
  5: -22726433
  6: -742177644
  7: 526024257
keysize: "256"
mode: "ccm"
password: "test"
plaintext: ""
salt: Array[2]
  0: -61143847
  1: 1421077246
tag: "64"

*/