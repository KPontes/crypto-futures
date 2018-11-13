import ethers from "ethers";
const providers = ethers.providers;

let NETWORK;
if (process.env.NODE_ENV === "production") {
  NETWORK = "rinkeby";
} else {
  NETWORK = "rinkeby";
}

export async function viewAddressInfo(keysObj) {
  try {
    //query balance by address or pk
    let balance;
    let wallet;
    if (keysObj.address) {
      const provider = providers.getDefaultProvider(NETWORK);
      balance = await provider.getBalance(keysObj.address);
    } else {
      if (keysObj.privateKey) {
        wallet = new ethers.Wallet(keysObj.privateKey);
      } else {
        wallet = new ethers.Wallet.fromMnemonic(keysObj.mnemonic);
      }
      wallet.provider = ethers.providers.getDefaultProvider(NETWORK);
      balance = await wallet.getBalance();
      keysObj["address"] = await wallet.getAddress();
      keysObj["privateKey"] = wallet.privateKey;
    }
    // balance is a BigNumber (in wei); format it as a string (in ether)
    const etherString = ethers.utils.formatEther(balance);
    keysObj["balance"] = etherString;
    return keysObj;
  } catch (e) {
    console.log("viewAddressInfo error: ", e);
    throw e;
  }
}

export async function createWallet() {
  try {
    const wallet = await ethers.Wallet.createRandom();
    return wallet;
  } catch (e) {
    console.log("createWallet error: ", e);
    throw e;
  }
}

export async function sendEther(pk, toAddress, etherValue) {
  var wallet = new ethers.Wallet(pk);
  wallet.provider = ethers.providers.getDefaultProvider(NETWORK);

  // We must pass in the amount as wei, so need to convert ether to wei.
  var amount = ethers.utils.parseEther(etherValue);
  var options = {
    gasLimit: 40000
    //gasPrice: utils.bigNumberify("20000000000")
  };
  try {
    var transaction = await wallet.send(toAddress, amount, options);
    console.log("transaction ", transaction);
    return transaction;
  } catch (e) {
    console.log("sendEther error: ", e);
    throw e;
  }
}
