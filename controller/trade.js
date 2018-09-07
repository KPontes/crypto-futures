require("../config/config.js");
const ethers = require("ethers");
const { mongoose } = require("../db/mongoose.js");
var ObjectId = require("mongoose").Types.ObjectId;
const { SellOrder } = require("../models/sellorder.js");
const { Transaction } = require("../models/transaction.js");
const { Trade } = require("../models/trade.js");
const { FutureContract } = require("../models/futurecontract.js");
const compiledContract = require("../ethereum/build/FutureContract.json");
const etherParams = require("../ethereum/etherParams.js");
const ctrlFutureContract = require("./ctrl-future-contract.js");

var _this = this;

exports.createTrade = function(
  buyOrderMatches,
  sellOrder,
  tradeId,
  contractAddress
) {
  if (buyOrderMatches.length == 0) {
    return false;
  }
  var buyOrder = buyOrderMatches[0];
  if (buyOrder.buyerAddress === sellOrder.sellerAddress) {
    return false;
  }
  //try save trade
  return new Promise(function(resolve, reject) {
    var trade = new Trade({
      sellerAddress: sellOrder.sellerAddress,
      buyerAddress: buyOrder.buyerAddress,
      contractAmount: sellOrder.contractsAmount,
      dealPrice: sellOrder.dealPrice,
      contractAddress: contractAddress,
      etherAmount: sellOrder.depositedEther * 2,
      _id: tradeId
    });
    trade
      .save()
      .then(doc => {
        resolve(doc);
      })
      .catch(err => {
        console.log("Err createTrade: ", err);
        reject(err);
      });
  });
};

exports.createTransaction = function(buyOrderMatches, sellOrder, tradeId) {
  if (buyOrderMatches.length == 0) {
    return false;
  }
  var buyOrder = buyOrderMatches[0];
  if (buyOrder.buyerAddress === sellOrder.sellerAddress) {
    console.log("buyOrder.buyerAddress === sellOrder.sellerAddress");
    return false;
  }
  if (buyOrder.contractAddress !== sellOrder.contractAddress) {
    console.log("buyOrder.contractAddress <> sellOrder.contractAddress");
    return false;
  }
  //try save transaction
  return new Promise(function(resolve, reject) {
    var transaction = new Transaction({
      buyOrderKey: buyOrder._id,
      sellOrderKey: sellOrder._id,
      tradeKey: tradeId
    });
    transaction
      .save()
      .then(doc => {
        resolve(doc);
      })
      .catch(err => {
        console.log("Err createTransaction: ", err);
        reject(err);
      });
  });
};

exports.createTradeBlockchainEthers = function(
  pk,
  trade,
  buyOrder,
  sellOrder,
  contractAddress
) {
  return new Promise(async function(resolve, reject) {
    try {
      var sk = pk.indexOf("0x") === 0 ? pk : "0x" + pk;
      var contract = etherParams.initialize(
        compiledContract,
        sk,
        contractAddress
      );
      const provider = etherParams.provider;
      var transaction = await contract.createTrade(
        trade._id.toString(),
        buyOrder._id.toString(),
        sellOrder._id.toString()
      );
      console.log("createTradeEthers transaction: ", transaction);
      var transaction = await provider.waitForTransaction(transaction.hash);
      var transactionReceipt = await provider.getTransactionReceipt(
        transaction.hash
      );
      console.log("createTradeEthers transactionReceipt", transactionReceipt);
      if (transactionReceipt.status === 1) {
        trade.status = Trade.OrderStates.open;
        var updatedTrade = await trade.save();
      }
      resolve(transactionReceipt);
    } catch (e) {
      console.log("createTradeEthers Error: ", e);
      reject(e);
    }
  });
};

exports.getTradeEthers = function(key, contractTitle, pk) {
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
      var trade = {};
      let [
        buyerExitEtherAmount,
        sellerExitEtherAmount,
        exitPrice,
        status
      ] = await contract.getTrade(key);
      trade.sellerExitEtherAmount = sellerExitEtherAmount.toString(10);
      trade.buyerExitEtherAmount = buyerExitEtherAmount.toString(10);
      trade.exitPrice = exitPrice.toString(10);
      trade.status = status.toString(10);
      console.log("getTrade transaction: ", trade);
      resolve(trade);
    } catch (e) {
      console.log("getTrade Error: ", e);
      reject(e);
    }
  });
};

exports.calculateLiquidation = function(
  pk,
  contractTitle,
  tradeKey,
  exitPrice
) {
  return new Promise(async function(resolve, reject) {
    try {
      var futureContract = await ctrlFutureContract.findContractBd(
        contractTitle
      );
      var trade = await Trade.findOne({
        _id: ObjectId(tradeKey)
      }).exec();
      if (!trade) {
        throw `calcLiquidation Error: trade ${tradeKey} not found`;
      }
      const transaction = await Transaction.findOne({
        tradeKey: ObjectId(tradeKey)
      });
      const so = await SellOrder.findOne({
        _id: ObjectId(transaction.sellOrderKey)
      });
      trade.status = Trade.OrderStates.calculated;
      trade.exitFactor = trade.dealPrice / exitPrice;
      trade.exitPrice = exitPrice;
      trade.sellerExitEtherAmount =
        so.depositedEther * trade.exitFactor - so.fees;
      trade.buyerExitEtherAmount =
        (2 - trade.exitFactor) * so.depositedEther - so.fees;
      trade.status = Trade.OrderStates.calculated;
      //save DB
      var updatedTrade = await trade.save();
      //save Blockchain
      await _this.calculateLiquidationEthers(
        pk,
        contractTitle,
        tradeKey,
        trade.exitFactor,
        exitPrice
      );
      resolve(updatedTrade);
    } catch (e) {
      console.log("calcLiquidation Error: ", e);
      reject(e);
    }
  });
};

exports.calculateLiquidationEthers = function(
  pk,
  contractTitle,
  tradeKey,
  exitFactor,
  exitPrice
) {
  return new Promise(async function(resolve, reject) {
    try {
      var futureContract = await ctrlFutureContract.findContractBd(
        contractTitle
      );
      var trade = await Trade.findOne({
        _id: ObjectId(tradeKey)
      }).exec();
      if (!trade) {
        throw `calcLiquidationEthers Error: trade ${tradeKey} not found`;
      }
      var sk = pk.indexOf("0x") === 0 ? pk : "0x" + pk;
      var contract = etherParams.initialize(
        compiledContract,
        sk,
        futureContract.address
      );
      var provider = etherParams.provider;
      exitFactor = exitFactor * 1000000;
      exitPrice = exitPrice * 100;

      var transaction = await contract.calculateLiquidation(
        tradeKey.toString(),
        exitFactor.toFixed(0),
        exitPrice.toFixed(0)
      );
      console.log("calcLiquidationEthers transaction: ", transaction);
      var transaction = await provider.waitForTransaction(transaction.hash);
      var transactionReceipt = await provider.getTransactionReceipt(
        transaction.hash
      );
      console.log("calcLiquidationEthers transacReceipt", transactionReceipt);
      resolve(transactionReceipt);
    } catch (e) {
      console.log("calcLiquidationEthers Error: ", e);
      reject(e);
    }
  });
};

exports.tradeWithdrawEthers = function(pk, contractTitle, tradeKey) {
  return new Promise(async function(resolve, reject) {
    try {
      var futureContract = await ctrlFutureContract.findContractBd(
        contractTitle
      );
      var trade = await Trade.findOne({
        _id: ObjectId(tradeKey)
      }).exec();
      if (!trade) {
        throw `tradeWithdrawEthers Error: trade ${tradeKey} not found`;
      }
      var sk = pk.indexOf("0x") === 0 ? pk : "0x" + pk;
      var contract = etherParams.initialize(
        compiledContract,
        sk,
        futureContract.address
      );
      var provider = etherParams.provider;
      var wallet = contract.signer;
      trade.status = Trade.OrderStates.closed;
      if (wallet.address.toLowerCase() == trade.buyerAddress.toLowerCase()) {
        trade.buyerWithdraw = trade.buyerExitEtherAmount;
        trade.buyerExitEtherAmount = 0;
      }
      if (wallet.address.toLowerCase() == trade.sellerAddress.toLowerCase()) {
        trade.sellerWithdraw = trade.sellerExitEtherAmount;
        trade.sellerExitEtherAmount = 0;
      }
      var transaction = await contract.tradeWithdraw(tradeKey.toString());
      console.log("tradeWithdrawEthers transaction: ", transaction);
      var transaction = await provider.waitForTransaction(transaction.hash);
      var transactionReceipt = await provider.getTransactionReceipt(
        transaction.hash
      );
      console.log("tradeWithdrawEthers transactionReceipt", transactionReceipt);
      if (transactionReceipt.status === 1) {
        var updatedTrade = await trade.save();
      }
      resolve(transactionReceipt);
    } catch (e) {
      console.log("tradeWithdrawEthers Error: ", e);
      reject(e);
    }
  });
};
