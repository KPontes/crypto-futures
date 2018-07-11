// const HDWalletProvider = require("truffle-hdwallet-provider");
// const Web3 = require("web3");
const ethers = require("ethers");
const compiledFactory = require("./build/FutureContract.json");
//const { bytecode } = require("./build/bytecode.js");

let NETWORK;
if (process.env.NODE_ENV === "production") {
  NETWORK = "homestead";
} else {
  NETWORK = "rinkeby";
}

const bytecode = compiledFactory.bytecode;
console.log("BYTECODE: ", bytecode);

const abi = JSON.parse(compiledFactory.interface);
console.log("INTERFACE: ", abi);

const deploy = function() {
  var deployTransaction = ethers.Contract.getDeployTransaction(
    "0x" + bytecode,
    abi
  );
  console.log("DEPLOYED TRANSACTION");

  // Connect to the network
  var provider = ethers.providers.getDefaultProvider(NETWORK);

  // Create a wallet to deploy the contract
  var pk = "0x797336cf22a6171b4cb179d6a9c08e5848cbd1748563bc44ea66c506fb0aef8c"; // Only on test network
  var wallet = new ethers.Wallet(pk, provider);

  // Send the transaction
  var sendPromise = wallet.sendTransaction(deployTransaction);

  // Get the transaction
  sendPromise.then(function(transaction) {
    console.log("DEPLOYED TO: ", transaction);
  });
};

deploy();
