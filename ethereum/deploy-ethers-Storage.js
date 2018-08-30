require("../config/config.js");
const ethers = require("ethers");
const moment = require("moment");
const compiledFactory = require("./build/FutureStorage.json");
//const { bytecode } = require("./build/bytecode.js");

const NETWORK = process.env.NETWORK;
const bytecode = compiledFactory.bytecode;
console.log("BYTECODE: ", bytecode);

const abi = JSON.parse(compiledFactory.interface);
//console.log("INTERFACE: ", abi);

var provider = new ethers.providers.getDefaultProvider(NETWORK);
// Create a wallet to deploy the contract
var pk = "0x54ebbbba420fa577d9a7be4e831d3ea540bcd9e455d83ade27956b52f28f1f52"; // Only on test network
var wallet = new ethers.Wallet(pk, provider);
console.log("wallet: ", wallet);

const deploy = function() {
  var deployTransaction = ethers.Contract.getDeployTransaction(
    "0x" + bytecode,
    abi
  );
  console.log("DEPLOYED TRANSACTION");

  // Send the transaction
  var sendPromise = wallet.sendTransaction(deployTransaction);

  // Get the transaction
  sendPromise.then(function(transaction) {
    console.log("DEPLOYED TO: ", transaction);
  });
};

//Example call:  node deploy-ethers-Future.js ETHK18 0.1 2018-08-30
deploy();
