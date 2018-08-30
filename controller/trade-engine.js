require("../config/config.js");
const intervalObj = require("interval-promise");
const ethers = require("ethers");
const moment = require("moment");
var { mongoose } = require("../db/mongoose.js");
var { BuyOrder } = require("../models/buyorder.js");
var { SellOrder } = require("../models/sellorder.js");
var { FutureContract } = require("../models/futurecontract.js");
var { Transaction } = require("../models/transaction.js");
var { Trade } = require("../models/trade.js");
var trade = require("./trade.js");
const compiledContract = require("../ethereum/build/FutureContract.json");

("use strict");

module.exports = TradeEngine;

function TradeEngine(interval) {
  this.interval = interval;
  this.stopExecute = false;
}

TradeEngine.prototype.executeTrade = async function(contractTitle, pk) {
  var _this = this;
  var fc = await FutureContract.findOne({ title: contractTitle }).exec();
  if (!fc) {
    _this.stopExecute = true;
    console.log(`Err executeTrade. Contract ${contractTitle} not fount`);
  }
  intervalObj(
    async (iteration, stop) => {
      try {
        if (_this.stopExecute) {
          console.log("Stop executeTrade loop");
          stop();
        }
        var result = await _this.matchOrders(fc, pk);
        if (result !== "OK") {
          _this.stopExecute = true;
          throw result;
        }
      } catch (err) {
        console.log("Err executeTrade", err);
        _this.stopExecute = true;
      }
    },
    _this.interval,
    (options = { stopOnError: true })
  );
};

TradeEngine.prototype.executeOnce = async function(contractTitle, pk) {
  var _this = this;
  var fc = await FutureContract.findOne({ title: contractTitle }).exec();
  if (!fc) {
    _this.stopExecute = true;
    console.log(`Err executeTrade. Contract ${contractTitle} not fount`);
  }

  try {
    if (_this.stopExecute) {
      console.log("Stop executeTrade loop");
      stop();
    }
    var result = await _this.matchOrders(fc, pk);
    if (result !== "OK") {
      _this.stopExecute = true;
      throw result;
    }
  } catch (err) {
    console.log("Err executeOnceTrade", err);
    _this.stopExecute = true;
  }
};

TradeEngine.prototype.stopTrade = function() {
  this.stopExecute = true;
  // clearInterval(this.intervalObject);
  console.log("stopTrade");
};

TradeEngine.prototype.matchOrders = async function(futureContract, pk) {
  try {
    var contractAddress = futureContract.address;
    var iSell = 0;
    var buyOrders = await this.getBuyOrders(contractAddress);
    var sellOrders = await this.getSellOrders(contractAddress);
    let newTransaction,
      newTrade,
      updatedBuyOrder,
      updatedSellOrder,
      buyOrderMatches,
      tradeId;

    //walk through sellOrders trying to match a buy order to create a trade
    while (iSell < sellOrders.length) {
      buyOrderMatches = await buyOrders.filter(function(bo) {
        return (
          bo.status === "open" &&
          bo.dealPrice >= sellOrders[iSell].dealPrice &&
          bo.buyerAddress !== sellOrders[iSell].sellerAddress &&
          bo.contractsAmount - bo.contractsDealed >=
            sellOrders[iSell].contractsAmount
        );
      });

      console.log("buyOrderMatches:", buyOrderMatches);

      if (buyOrderMatches.length > 0) {
        tradeId = new mongoose.Types.ObjectId();

        newTransaction = await trade.createTransaction(
          buyOrderMatches,
          sellOrders[iSell],
          tradeId
        );
        if (newTransaction) {
          newTrade = await trade.createTrade(
            buyOrderMatches,
            sellOrders[iSell],
            tradeId,
            contractAddress
          );

          if (newTrade) {
            updatedBuyOrder = await this.updateBuyOrder(
              buyOrderMatches,
              sellOrders[iSell],
              tradeId
            );

            updatedSellOrder = await this.updateSellOrder(
              buyOrderMatches,
              sellOrders[iSell],
              tradeId
            );
            if (updatedBuyOrder && updatedSellOrder) {
              await trade.createTradeBlockchainEthers(
                pk,
                newTrade,
                buyOrderMatches[0],
                sellOrders[iSell],
                contractAddress
              );
            }
          }
        }
      }
      iSell++;
      console.log("iSell++", moment());
    }
    return "OK";
  } catch (e) {
    console.log("Err matchOrders: ", e);
    return e.message;
  }
};

TradeEngine.prototype.updateBuyOrder = async function(
  buyOrderMatches,
  sellOrder,
  tradeId
) {
  if (buyOrderMatches.length == 0) {
    return false;
  }
  try {
    var buyOrder = buyOrderMatches[0];
    var bo = await BuyOrder.findOne({ _id: buyOrder._id }).exec();
    //one buy order may trade several sell orders
    if (bo.contractsDealed + sellOrder.contractsAmount >= bo.contractsAmount) {
      bo.status = "closed"; //this is for mongoDB
      buyOrder.status = "closed"; //this is to prevent reuse this order in the memory array
    }
    bo.contractsDealed += sellOrder.contractsAmount;
    buyOrder.contractsDealed += sellOrder.contractsAmount; //updates in the array also
    //tradeKey is an array with all tradeKeys related to this buyOrder
    bo.tradeKey === null
      ? (bo.tradeKey = [tradeId])
      : bo.tradeKey.push(tradeId);
    return await bo.save();
  } catch (err) {
    console.log("Err updateBuyOrder: ", err);
    return false;
  }
};

TradeEngine.prototype.updateSellOrder = async function(
  buyOrderMatches,
  sellOrder,
  tradeId
) {
  if (buyOrderMatches.length == 0) {
    return false;
  }
  try {
    var buyOrder = buyOrderMatches[0];
    var so = await SellOrder.findOne({ _id: sellOrder._id }).exec();
    so.status = "closed";
    sellOrder.status = "closed";
    //one sell order trades with only one buy order
    so.contractsDealed = sellOrder.contractsAmount;
    so.tradeKey === null
      ? (so.tradeKey = [tradeId])
      : so.tradeKey.push(tradeId);
    return await so.save();
  } catch (err) {
    console.log("Err updateSellOrder: ", err);
    return false;
  }
};

TradeEngine.prototype.getBuyOrders = function(contractAddress) {
  return new Promise(function(resolve, reject) {
    BuyOrder.find() // find all buyorders
      .sort({ dealPrice: 1 }) // sort ascending by dealPrice
      .where("status")
      .eq("open")
      .where("contractAddress")
      .eq(contractAddress)
      .exec()
      .then(docs => {
        resolve(docs);
      })
      .catch(err => {
        console.log("Err getBuyOrders: ", err);
        reject(err);
      });
  });
};

TradeEngine.prototype.getSellOrders = function(contractAddress) {
  return new Promise(function(resolve, reject) {
    SellOrder.find() // find all buyorders
      .sort({ dealPrice: 1 }) // sort ascending by dealPrice
      .where("status")
      .eq("open") // select only open orders
      .where("contractAddress")
      .eq(contractAddress)
      .exec()
      .then(docs => {
        resolve(docs);
      })
      .catch(err => {
        console.log("Err getSellOrders: ", err);
        reject(err);
      });
  });
};
