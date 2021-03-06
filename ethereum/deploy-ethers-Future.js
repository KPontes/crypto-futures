require("../config/config.js");
const ethers = require("ethers");
const moment = require("moment");
const compiledFactory = require("./build/FutureContract.json");
//const { bytecode } = require("./build/bytecode.js");

const NETWORK = process.env.NETWORK;
const bytecode = compiledFactory.bytecode;
console.log("BYTECODE: ", bytecode);

const abi = JSON.parse(compiledFactory.interface);
//console.log("INTERFACE: ", abi);

var provider = ethers.providers.getDefaultProvider(NETWORK);
// Create a wallet to deploy the contract

var pk = "0x54ebbbba420fa577d9a7be4e831d3ea540bcd9e455d83ade27956b52f28f1f52"; // Only on test network
var wallet = new ethers.Wallet(pk, provider);
//process paramenters
var title = process.argv[2];
var contractSize = process.argv[3];
contractSize = contractSize.toString();
const sizeWei = ethers.utils.parseEther(contractSize).toString(10);
var endDate = process.argv[4];
const initialDate = moment("1970-01-01");
endDate = moment(process.argv[4]);
const duration = moment.duration(endDate.diff(initialDate));
const endDateSeconds = duration.asSeconds();
const FStorageAddress = "0xEd36DD4E6f274F626bb1EDBEB9298f2Bf253A5f4";

const deploy = function() {
  var deployTransaction = {};
  deployTransaction.gasLimit = 2500000;
  deployTransaction = ethers.Contract.getDeployTransaction(
    "0x" + bytecode,
    abi,
    title,
    sizeWei,
    endDateSeconds,
    wallet.address,
    FStorageAddress
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
