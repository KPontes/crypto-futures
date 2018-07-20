const CryptoJS = require("crypto-js");

exports.encryptStr = function(str, key) {
  // Encrypt
  try {
    if (key.length < 8) {
      throw new Error("Invalid password");
    }
    var cipherText = CryptoJS.AES.encrypt(str, key).toString();
    return cipherText;
  } catch (e) {
    console.log("encryptObj error: ", e);
    throw e;
  }
};

exports.decryptStr = function(ciphertext, key) {
  //Decrypt
  try {
    if (key.length < 8) {
      throw new Error("Invalid password");
    }
    var bytes = CryptoJS.AES.decrypt(ciphertext.toString(), key);
    var decryptedText = bytes.toString(CryptoJS.enc.Utf8);
    return decryptedText;
  } catch (e) {
    console.log("decrypt error: ", e);
    throw e;
  }
};
