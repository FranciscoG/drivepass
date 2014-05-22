var DrivePass = DrivePass || {};

DrivePass.Password = (function(sjcl) {

  sjcl.random.startCollectors();

  var _salt = sjcl.random.randomWords(2, 0);

  var params = {
    adata: "",
    iter: 1000,
    salt: _salt,
    mode: "ccm",
    ts: 64,
    ks: 256
  };

  var hash = function(password) {
    var p = sjcl.misc.cachedPbkdf2(password, params);
    var x = p.key.slice(0, params.ks / 32);
    return sjcl.codec.hex.fromBits(x);
  };

  var encrypt = function(key, plaintext) {
    var response = {};
    var ct = sjcl.encrypt(key, plaintext, params, response);
    return response;
  };

  return {
    hash: hash
  };

})(sjcl);

/*

function doPbkdf2(decrypting) {
  adata: ""
  ciphertext: ""
  iter: 1000
  json: true
  key: []
  keysize: "256"
  mode: "ccm"
  password: ""
  plaintext: ""
  salt: []
  tag: "64"


function doDecrypt() {
  var v = form.get(),
    iv = v.iv,
    key = v.key,
    adata = v.adata,
    aes, ciphertext = v.ciphertext,
    rp = {};

  if (!v.password && !v.key.length) {
    error("Can't decrypt: need a password or key!");
    return;
  }

  if (ciphertext.match("{")) {
    try {
      v.plaintext = sjcl.decrypt(v.password || v.key, ciphertext, {}, rp);
    } catch (e) {
      error("Can't decrypt: " + e);
      return;
    }
    
  } else {
    ciphertext = sjcl.codec.base64.toBits(ciphertext);
    if (iv.length === 0) {
      error("Can't decrypt: need an IV!");
      return;
    }
    if (key.length === 0) {
      if (v.password.length) {
        doPbkdf2(true);
        key = v.key;
      }
    }
    aes = new sjcl.cipher.aes(key);

    try {
      v.plaintext = sjcl.codec.utf8String.fromBits(sjcl.mode[v.mode].decrypt(aes, ciphertext, iv, v.adata, v.tag));
      v.ciphertext = "";
      document.getElementById('plaintext').select();
    } catch (e) {
      error("Can't decrypt: " + e);
    }
  }
  form.set(v);
}

*/