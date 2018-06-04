const cipher = require("../utils/cipher");

describe("Test Addition", () => {
  it("adds 1 + 2 to equal 3", () => {
    expect(cipher.testsum(1, 2)).toBe(3);
  });
});

const keyObj = {
  address: "0x85Be6c1f41234567890123456394700ccb7d0852",
  privateKey:
    "0x797336cf22a6171b1234567890123456789012345678901234567890fb0aef8c",
  mnemonic:
    "image mansion xxxxx yyyyy sauce net aaaa dice eeeee wing bbbbb alter"
};

var pwd = "12345678";
let cipherStr;

describe("Cipher Functions", () => {
  it("Encrypt Obj should return a string", () => {
    cipherStr = cipher.encryptObj(keyObj, pwd);
    expect(cipherStr.length).toBeGreaterThan(10);
  });

  it("Decrypted text should contain address", async () => {
    var plainStr = await cipher.decrypt(cipherStr, pwd);
    expect(plainStr).toContain(keyObj.address);
  });

  it("Decrypt corrupted text should thrown error", () => {
    expect(() => {
      var corruptedStr = cipherStr.substring(5) + "ejksncl";
      var plainStr = cipher.decrypt(corruptedStr, pwd);
    }).toThrow();
  });

  it("Should throw error for password length < 8", () => {
    pwd = "1234567";
    expect(() => {
      cipher.encryptObj(keyObj, pwd);
    }).toThrow();
  });
});
