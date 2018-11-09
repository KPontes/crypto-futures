require("../config/config.js");
//const _ = require("lodash");
const ethers = require("ethers");
const { mongoose } = require("../db/mongoose.js");
var ObjectId = require("mongoose").Types.ObjectId;
const { SellOrder } = require("../models/sellorder.js");
const { BuyOrder } = require("../models/buyorder.js");
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

exports.list = function(contractTitle) {
  return new Promise(async function(resolve, reject) {
    try {
      var futureContract = await ctrlFutureContract.findContractBd(
        contractTitle
      );
      var tradeList = await Trade.find({
        contractAddress: futureContract.address
      }).exec();
      resolve(tradeList);
    } catch (e) {
      console.log("listTrade Error: ", e);
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
        buyerWithdraw,
        sellerWithdraw,
        buyerExitEtherAmount,
        sellerExitEtherAmount,
        exitPrice,
        exitFactor,
        status
      ] = await contract.deployed.getTrade(key);
      trade.sellerWithdraw = sellerWithdraw.toString(10);
      trade.buyerWithdraw = buyerWithdraw.toString(10);
      trade.sellerExitEtherAmount = sellerExitEtherAmount.toString(10);
      trade.buyerExitEtherAmount = buyerExitEtherAmount.toString(10);
      trade.exitPrice = exitPrice.toString(10);
      trade.exitFactor = exitFactor.toString(10);
      trade.status = status.toString(10);
      console.log("getTrade transaction: ", trade);
      resolve(trade);
    } catch (e) {
      console.log("getTrade Error: ", e);
      reject(e);
    }
  });
};

exports.setLiqPrice = function(contractTitle, exitPrice, allowWithdraw) {
  return new Promise(async function(resolve, reject) {
    try {
      var futureContract = await ctrlFutureContract.findContractBd(
        contractTitle
      );

      futureContract.allowWithdraw = allowWithdraw;
      if (exitPrice !== 0) {
        futureContract.lastPrice = exitPrice;
      }
      var updatedFC = await futureContract.save();
      resolve(updatedFC);
    } catch (e) {
      console.log("setLiqPrice Error: ", e);
      reject(e);
    }
  });
};

exports.setLiqPriceEthers = function(
  pk,
  contractTitle,
  exitPrice,
  allowWithdraw
) {
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
      var provider = contract.provider;
      if (exitPrice === 0) {
        exitPrice = futureContract.lastPrice;
      }
      var transaction = await contract.deployed.setLiquidationPrice(
        exitPrice * 100,
        allowWithdraw
      );
      console.log("setLiqPriceEthers transaction: ", transaction);
      var transaction = await provider.waitForTransaction(transaction.hash);
      var transactionReceipt = await provider.getTransactionReceipt(
        transaction.hash
      );
      console.log("setLiqPriceEthers transacReceipt", transactionReceipt);
      if (transactionReceipt.status === 1) {
        _this.setLiqPrice(contractTitle, exitPrice, allowWithdraw);
      }
      resolve(transactionReceipt);
    } catch (e) {
      console.log("setLiqPriceEthers Error: ", e);
      reject(e);
    }
  });
};

exports.processLiquidation = function(pk, contractTitle, tradeKey) {
  return new Promise(async function(resolve, reject) {
    //calculate liquidaton values and withdraw results for pk on blockchain
    try {
      var futureContract = await ctrlFutureContract.findContractBd(
        contractTitle
      );
      var trade = await Trade.findOne({
        _id: ObjectId(tradeKey)
      }).exec();
      if (!trade) {
        throw `processLiquidation Error: trade ${tradeKey} not found`;
      }
      if (futureContract.lastPrice === 0) {
        throw `processLiquidation Error: mature price not set`;
      }
      const transaction = await Transaction.findOne({
        tradeKey: ObjectId(tradeKey)
      });
      const so = await SellOrder.findOne({
        _id: ObjectId(transaction.sellOrderKey)
      });
      const bo = await BuyOrder.findOne({
        _id: ObjectId(transaction.buyOrderKey)
      });
      if (
        trade.status !== Trade.OrderStates.calculated &&
        trade.status !== Trade.OrderStates.closed
      ) {
        //guarantee save calculation with last contract price
        await calculateLiquidation(futureContract, trade, bo, so);
        trade.status = Trade.OrderStates.calculated;
        trade.liquidate = true;
        var updatedTrade = await trade.save();
      }
      //save on Blockchain
      await _this.processLiquidationEthers(
        pk,
        contractTitle,
        transaction.tradeKey,
        transaction.buyOrderKey,
        transaction.sellOrderKey,
        so
      );
      resolve(true);
    } catch (e) {
      console.log("calcLiquidation Error: ", e);
      reject(e);
    }
  });
};

exports.processLiquidationEthers = function(
  pk,
  contractTitle,
  tradeKey,
  buyOrderKey,
  sellOrderKey,
  sellOrder
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
        throw `processLiquidationEthers Error: trade ${tradeKey} not found`;
      }
      var sk = pk.indexOf("0x") === 0 ? pk : "0x" + pk;
      var contract = etherParams.initialize(
        compiledContract,
        sk,
        futureContract.address
      );
      var provider = contract.provider;

      var transaction = await contract.deployed.processLiquidation(
        tradeKey.toString(),
        buyOrderKey.toString(),
        sellOrderKey.toString(),
        futureContract.lastPrice * 100
      );
      console.log("processLiquidationEthers transaction: ", transaction);
      var transaction = await provider.waitForTransaction(transaction.hash);
      var transactionReceipt = await provider.getTransactionReceipt(
        transaction.hash
      );
      console.log(
        "processLiquidationEthers transacReceipt",
        transactionReceipt
      );
      if (transactionReceipt.status === 1) {
        if (
          sellOrder.sellerAddress.toLowerCase() ===
          contract.wallet.address.toLowerCase()
        ) {
          trade.sellerWithdraw = trade.sellerExitEtherAmount;
          trade.sellerExitEtherAmount = 0;
        } else {
          trade.buyerWithdraw = trade.buyerExitEtherAmount;
          trade.buyerExitEtherAmount = 0;
        }
        trade.status = Trade.OrderStates.calculated;
        if (
          trade.buyerExitEtherAmount === 0 &&
          trade.sellerExitEtherAmount === 0
        ) {
          trade.status = Trade.OrderStates.closed;
        }
        var updatedTrade = await trade.save();
      }
      resolve(transactionReceipt);
    } catch (e) {
      console.log("processLiquidationEthers Error: ", e);
      reject(e);
    }
  });
};

exports.monitorLiquidation = function(contractTitle) {
  return new Promise(async function(resolve, reject) {
    //calculate liquidaton values and withdrawresults for pk on blockchain
    try {
      var fc = await ctrlFutureContract.findContractBd(contractTitle);
      var trades = await Trade.find({
        contractAddress: fc.address,
        status: { $ne: Trade.OrderStates.closed }
      }).exec();
      if (!trades) {
        throw `monitorLiquidation Error: trades not found`;
      }
      if (fc.lastPrice === 0) {
        throw `monitorLiquidation Error: liquidation price not set`;
      }
      for (let trade of trades) {
        const transaction = await Transaction.findOne({
          tradeKey: ObjectId(trade._id)
        });
        const so = await SellOrder.findOne({
          _id: ObjectId(transaction.sellOrderKey)
        });
        const bo = await BuyOrder.findOne({
          _id: ObjectId(transaction.buyOrderKey)
        });
        if (!transaction) {
          continue;
        } else {
          await calculateLiquidation(fc, trade, bo, so);
        }
      }
      resolve("OK");
    } catch (e) {
      console.log("monitorLiquidation Error: ", e);
      reject(e);
    }
  });
};

async function calculateLiquidation(fc, trade, bo, so) {
  return new Promise(async function(resolve, reject) {
    //calculate liquidaton values and withdrawresults for pk on blockchain
    try {
      if (
        trade.status !== Trade.OrderStates.calculated &&
        trade.status !== Trade.OrderStates.closed &&
        !trade.liquidate
      ) {
        //save calculations only on BD for queries purposes
        const totalValueSeller = so.margin * so.depositedEther;
        const diffPriceSeller = trade.dealPrice - fc.lastPrice;
        const totalDiffSeller = diffPriceSeller * totalValueSeller;
        const diffDivLastPrice = totalDiffSeller / fc.lastPrice;
        trade.sellerExitEtherAmount =
          diffDivLastPrice + so.depositedEther - so.fees;
        trade.buyerExitEtherAmount =
          bo.depositedEther +
          so.depositedEther -
          trade.sellerExitEtherAmount -
          so.fees -
          bo.fees;
        if (trade.sellerExitEtherAmount < 0) {
          trade.liquidate = true;
          trade.sellerExitEtherAmount = 0;
          trade.buyerExitEtherAmount =
            bo.depositedEther + so.depositedEther - bo.fees;
        }
        if (trade.buyerExitEtherAmount < 0) {
          trade.liquidate = true;
          trade.buyerExitEtherAmount = 0;
          trade.sellerExitEtherAmount =
            bo.depositedEther + so.depositedEther - so.fees;
        }
        if (
          trade.buyerExitEtherAmount === trade.etherAmount * 0.1 ||
          trade.sellerExitEtherAmount === trade.etherAmount * 0.1
        ) {
          //future feature is create a call for margin
          trade.liquidate = true;
        }
        trade.exitPrice = fc.lastPrice;
        trade.exitFactor =
          trade.sellerExitEtherAmount / (bo.depositedEther + so.depositedEther);

        var updatedTrade = await trade.save();
        //console.log("calculateLiquidation", updatedTrade);
      }
      resolve(true);
    } catch (e) {
      console.log("calculateLiquidation Error: ", e);
      reject(e);
    }
  });
}
