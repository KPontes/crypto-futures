require("../config/config.js");
const ethers = require("ethers");
const compiledFactory = require("./build/FutureContractFactory.json");
const NETWORK = process.env.NETWORK;
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
  var pk = "0x54ebbbba420fa577d9a7be4e831d3ea540bcd9e455d83ade27956b52f28f1f52"; // Only on test network
  var wallet = new ethers.Wallet(pk, provider);
  console.log("wallet: ", wallet);

  // Send the transaction
  var sendPromise = wallet.sendTransaction(deployTransaction);

  // Get the transaction
  sendPromise.then(function(transaction) {
    console.log("DEPLOYED TO: ", transaction);
  });
};

deploy();

// 0x106929531Cf3cA06f83a81f5d72504d72b360205 current in test
// 0x0F472A261e80D161AB1874bc9535d7749613D7e9 last working factory
