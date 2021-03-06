require("../config/config.js");
const etherTx = require("ethereumjs-tx");
const ethers = require("ethers");
const web3 = require("../ethereum/web3.js");
const etherParams = require("../ethereum/etherParams.js");
const ctrlFutureContract = require("./ctrl-future-contract.js");
const cryptojs = require("../utils/cipher.js");
const secalc = require("../utils/secalc.js");
const { mongoose } = require("../db/mongoose.js");
const { BuyOrder } = require("../models/buyorder.js");
const { FutureContract } = require("../models/futurecontract.js");
const compiledContract = require("../ethereum/build/FutureContract.json");

//("use strict");

var _this = this;

exports.createDb = function(
  buyerAddress,
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
      const balance = await w3Provided.eth.getBalance(buyerAddress);
      if (
        !balance >
        contractsAmount * futureContract.size + process.env.RESERVE_GAS
      ) {
        throw "BuyOrder create Error: Insufficient balance for contractSize + GAS";
      }
      var fee = calculateFee(etherValue);

      var buyorder = new BuyOrder({
        buyerAddress: buyerAddress,
        tradeKey: null,
        contractsAmount: contractsAmount,
        dealPrice: dealPrice,
        margin: margin,
        depositedEther: parseFloat(etherValue),
        fees: fee,
        contractAddress: futureContract.address,
        sk: ""
      });
      var doc = await buyorder.save();
      //***código sk secalc (2)
      //console.log("buyorder", doc);
      var transaction = await _this.createBuyOrderBlockchainEthers(
        doc,
        pk,
        futureContract.address
      );
      resolve(transaction);
    } catch (e) {
      console.log("createBuyOrder Error: ", e);
      reject(e);
    }
  });
};

exports.createBuyOrderBlockchainEthers = function(
  buyorder,
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
      var wei = ethers.utils.parseEther(buyorder.depositedEther.toString());
      var weiBN = ethers.utils.bigNumberify(wei);
      var options = {
        value: weiBN
      };
      var transaction = await contract.deployed.createOrder(
        1,
        buyorder._id.toString(),
        buyorder.contractsAmount,
        buyorder.margin,
        (buyorder.dealPrice * 100).toFixed(0),
        options
      );
      console.log("createBuyOrder transaction: ", transaction);
      var transaction = await provider.waitForTransaction(transaction.hash);
      var transactionReceipt = await provider.getTransactionReceipt(
        transaction.hash
      );
      console.log("createBuyOrder transactionReceipt", transactionReceipt);
      transactionReceipt.status === 1
        ? (buyorder.status = BuyOrder.OrderStates.open)
        : (buyorder.status = BuyOrder.OrderStates.fail);
      buyorder.thash = transaction.hash;
      var updatedBO = await buyorder.save();
      resolve(transactionReceipt);
    } catch (e) {
      console.log("createBuyOrder Error: ", e);
      reject(e);
    }
  });
};

exports.getBuyOrderEthers = function(key, contractTitle, pk) {
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
      var bo = {};
      let [
        buyer,
        contractsAmount,
        depositedEther,
        fees,
        dealPrice
      ] = await contract.deployed.getOrder(1, key); //buyOrder type = 1
      bo.buyer = buyer;
      bo.contractsAmount = contractsAmount.toString(10);
      bo.depositedEther = depositedEther.toString(10);
      bo.fees = fees.toString(10);
      bo.dealPrice = dealPrice.toString(10);
      console.log("getBuyOrder transaction: ", bo);
      resolve(bo);
    } catch (e) {
      console.log("getBuyOrder Error: ", e);
      reject(e);
    }
  });
};

var calculateFee = function(etherValue) {
  return parseFloat(etherValue) / 1000; //minus commision
};

exports.createBuyOrderBlockchainWeb3 = function(buyorder, pk, contractAddress) {
  return new Promise(async function(resolve, reject) {
    try {
      var sk = pk.indexOf("0x") === 0 ? pk : "0x" + pk;

      const abi = JSON.parse(compiledContract.interface);
      const w3Provided = web3.web3WithProvider();
      const account = w3Provided.eth.accounts.privateKeyToAccount(sk);
      w3Provided.eth.accounts.wallet.add(account);
      w3Provided.eth.defaultAccount = account.address;
      var contract = await new w3Provided.eth.Contract(abi, contractAddress);

      console.log("toHex(buyorder._id)", w3Provided.utils.toHex(buyorder._id));
      var methodCall = contract.methods.createBuyOrder(
        w3Provided.utils.toHex(buyorder._id),
        buyorder.contractsAmount,
        buyorder.margin,
        buyorder.dealPrice
      );
      var gasEstimate = await methodCall.estimateGas();
      console.log("gasEstimate:", gasEstimate);

      var encodedABI = await methodCall.encodeABI();
      var txCount = await w3Provided.eth.getTransactionCount(
        w3Provided.eth.defaultAccount
      );

      var txParams = {
        from: w3Provided.eth.defaultAccount,
        to: contractAddress,
        gasLimit: w3Provided.utils.toHex(300000),
        gasPrice: gasEstimate,
        value: w3Provided.utils.toHex(w3Provided.utils.toWei("0.12", "ether")),
        data: encodedABI
      };
      //var balance = await w3Provided.eth.getBalance(w3Provided.eth.defaultAccount);
      const bufferedPk = Buffer.from(
        account.privateKey.replace("0x", ""),
        "hex"
      );
      const transaction = new etherTx(txParams);
      transaction.sign(bufferedPk);
      const serializedTx = transaction.serialize();
      console.log("serializedTx:", serializedTx);

      let result = await w3Provided.eth.sendSignedTransaction(
        "0x" + serializedTx.toString("hex")
      );
      console.log("result: ", result);
      resolve(result);
    } catch (e) {
      console.log("createBuyOrder Error: ", e);
      reject(e);
    }
  });
};

//(1)
// buyorder = await BuyOrder.findOne({ _id: buyorder._id });
// var pw = secalc.sec(
//   buyorder.buyerAddress,
//   buyorder.contractsAmount,
//   buyorder.dealPrice,
//   buyorder.createdAt
// );
// var sk = cryptojs.decryptStr(buyorder.sk, pw);
//************************
//(2)
// buyorder = await BuyOrder.findOne({ _id: doc._id });
// var pw = secalc.sec(
//   buyorder.buyerAddress,
//   buyorder.contractsAmount,
//   buyorder.dealPrice,
//   buyorder.createdAt
// );
// var cipherpk = cryptojs.encryptStr(pk, pw);
// buyorder.sk = cipherpk;
// doc = buyorder.save();
