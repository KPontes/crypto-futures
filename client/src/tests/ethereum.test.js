const ether = require("../utils/ethereum");

let wallet;

describe("Ethereum access functions", () => {
  it("Create wallet", async () => {
    wallet = await ether.createWallet();
    expect(wallet.address.length).toBeGreaterThan(40);
  });

  it("View address balance with address", async done => {
    var keysObj = {
      address: wallet.address
    };
    keysObj = await ether.viewAddressInfo(keysObj);
    expect(keysObj.balance).toBe("0.0");
    done();
  });

  it("View address balance with mnemonic", async done => {
    var keysObj = {
      mnemonic: wallet.mnemonic
    };
    keysObj = await ether.viewAddressInfo(keysObj);
    expect(keysObj.balance).toBe("0.0");
    done();
  });

  it("Send ether", async done => {
    jest.setTimeout = 20000;
    const toAddress = "0x5fEDb99AAe7F1880A7a97b0cbe070231a6678f07";
    const testPk =
      "0x797336cf22a6171b4cb179d6a9c08e5848cbd1748563bc44ea66c506fb0aef8c";
    try {
      const transaction = await ether.sendEther(testPk, toAddress, "0.001");
      expect(transaction.hash).toBeDefined();
      done();
    } catch (e) {
      expect(e).toThrow();
    }
  });

  // it("Should throw error for invalid address balance", async done => {
  //   var keysObj = {
  //     address: "aaaaaaaaaabbbbbbbbbbccccccccccddddddddddee"
  //   };
  //   expect(() => {
  //     ether.viewAddressInfo(keysObj);
  //     done();
  //   }).toThrow();
  // });
});
