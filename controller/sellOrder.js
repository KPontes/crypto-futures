require("../config/config.js");
const web3 = require("../ethereum/web3.js");
const ethers = require("ethers");
const etherParams = require("../ethereum/etherParams.js");
const ctrlFutureContract = require("./ctrl-future-contract.js");
const cryptojs = require("../utils/cipher.js");
const secalc = require("../utils/secalc.js");
const { mongoose } = require("../db/mongoose.js");
const { SellOrder } = require("../models/sellorder.js");
const { FutureContract } = require("../models/futurecontract.js");
const compiledContract = require("../ethereum/build/FutureContract.json");

var _this = this;

exports.createDb = function(
  sellerAddress,
  pk,
  contractTitle,
  contractsAmount,
  margin,
  dealPrice,
  etherValue
) {
  return new Promise(async function(resolve, reject) {
    try {
      const abi = JSON.parse(compiledContract.interface);
      var futureContract = await ctrlFutureContract.findContractBd(
        contractTitle
      );
      const w3Provided = web3.web3WithProvider();
      const balance = await w3Provided.eth.getBalance(sellerAddress);
      if (
        !balance >
        contractsAmount * futureContract.size + process.env.RESERVE_GAS
      ) {
        throw "SellOrder create Error: Insufficient balance for contractSize + GAS";
      }
      var fee = calculateFee(etherValue);

      var sellorder = new SellOrder({
        sellerAddress: sellerAddress,
        tradeKey: null,
        contractsAmount: contractsAmount,
        dealPrice: dealPrice,
        depositedEther: parseFloat(etherValue),
        fees: fee,
        contractAddress: futureContract.address,
        sk: ""
      });
      var doc = await sellorder.save();
      //***código sk secalc (2)
      //console.log("sellorder", doc);
      var transaction = await _this.createSellOrderBlockchainEthers(
        doc,
        pk,
        futureContract.address
      );
      resolve(transaction);
    } catch (e) {
      console.log("createSellOrder Error: ", e);
      reject(e);
    }
  });
};

exports.createSellOrderBlockchainEthers = function(
  sellorder,
  pk,
  contractAddress
) {
  return new Promise(async function(resolve, reject) {
    try {
      //***código sk secalc (1)
      var sk = pk.indexOf("0x") === 0 ? pk : "0x" + pk;
      var contract = etherParams.initialize(
        compiledContract,
        sk,
        contractAddress
      );
      const provider = contract.provider;
      var wei = ethers.utils.parseEther(sellorder.depositedEther.toString());
      var weiBN = ethers.utils.bigNumberify(wei);
      var options = {
        value: weiBN
      };
      var transaction = await contract.deployed.createOrder(
        2,
        sellorder._id.toString(),
        sellorder.contractsAmount,
        sellorder.margin,
        (sellorder.dealPrice * 100).toFixed(0),
        options
      );
      console.log("createSellOrder transaction: ", transaction);
      var transaction = await provider.waitForTransaction(transaction.hash);
      var transactionReceipt = await provider.getTransactionReceipt(
        transaction.hash
      );
      console.log("createSellOrder transactionReceipt", transactionReceipt);
      transactionReceipt.status === 1
        ? (sellorder.status = SellOrder.OrderStates.open)
        : (sellorder.status = SellOrder.OrderStates.fail);
      sellorder.thash = transaction.hash;
      var updatedSO = await sellorder.save();
      resolve(transactionReceipt);
    } catch (e) {
      console.log("createSellOrder Error: ", e);
      reject(e);
    }
  });
};

exports.getSellOrderEthers = function(key, contractTitle, pk) {
  return new Promise(async function(resolve, reject) {
    try {
      var futureContract = await ctrlFutureContract.findContractBd(
        contractTitle
      );
      var sk = pk.indexOf("0x") === 0 ? pk : "0x" + pk;
      var contract = etherParams.initialize(
        compiledContract,
        sk,
        futureContract.address
      );
      var so = {};
      let [
        seller,
        contractsAmount,
        depositedEther,
        fees,
        dealPrice
      ] = await contract.deployed.getOrder(2, key); //sellOrder type=2
      so.seller = seller;
      so.contractsAmount = contractsAmount.toString(10);
      so.depositedEther = depositedEther.toString(10);
      so.fees = fees.toString(10);
      so.dealPrice = dealPrice.toString(10);
      console.log("getSellOrder transaction: ", so);
      resolve(so);
    } catch (e) {
      console.log("getSellOrder Error: ", e);
      reject(e);
    }
  });
};

var calculateFee = function(etherValue) {
  return parseFloat(etherValue) / 1000; //minus commision
};
