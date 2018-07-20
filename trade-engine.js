require("./config/config.js");
const intervalObj = require("interval-promise");
var { mongoose } = require("./db/mongoose.js");
var { BuyOrder } = require("./models/buyorder.js");
var { SellOrder } = require("./models/sellorder.js");
var { Transaction } = require("./models/transaction.js");
var { Trade } = require("./models/trade.js");

("use strict");

module.exports = TradeEngine;

function TradeEngine(interval) {
  this.interval = interval;
  this.stopExecute = false;
}

TradeEngine.prototype.executeTrade = function() {
  var _this = this;

  intervalObj(
    async (iteration, stop) => {
      try {
        if (_this.stopExecute) {
          console.log("Stop executeTrade loop");
          stop();
        }
        var result = await _this.matchOrders();
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

TradeEngine.prototype.stopTrade = function() {
  this.stopExecute = true;
  // clearInterval(this.intervalObject);
  console.log("stopTrade");
};

TradeEngine.prototype.matchOrders = async function() {
  try {
    var iSell = 0;
    var buyOrders = await this.getBuyOrders();
    var sellOrders = await this.getSellOrders();
    let transaction, trade, updatedBuyOrder, buyOrderMatches, tradeId;

    //console.log("sellOrders:", sellOrders);

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
        transaction = await this.createTransaction(
          buyOrderMatches,
          sellOrders[iSell],
          tradeId
        );
        if (transaction) {
          trade = await this.createTrade(
            buyOrderMatches,
            sellOrders[iSell],
            tradeId
          );
          if (trade) {
            updatedBuyOrder = await this.updateBuyOrder(
              buyOrderMatches,
              sellOrders[iSell],
              tradeId
            );
            await this.updateSellOrder(
              buyOrderMatches,
              sellOrders[iSell],
              tradeId
            );
          }
        }
      }
      iSell++;
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

TradeEngine.prototype.createTrade = function(
  buyOrderMatches,
  sellOrder,
  tradeId
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

TradeEngine.prototype.createTransaction = function(
  buyOrderMatches,
  sellOrder,
  tradeId
) {
  if (buyOrderMatches.length == 0) {
    return false;
  }
  var buyOrder = buyOrderMatches[0];
  if (buyOrder.buyerAddress === sellOrder.sellerAddress) {
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

TradeEngine.prototype.getBuyOrders = function() {
  return new Promise(function(resolve, reject) {
    BuyOrder.find() // find all buyorders
      .sort({ dealPrice: 1 }) // sort ascending by dealPrice
      .where("status")
      .eq("open") // select only open orders
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

TradeEngine.prototype.getSellOrders = function() {
  return new Promise(function(resolve, reject) {
    SellOrder.find() // find all buyorders
      .sort({ dealPrice: 1 }) // sort ascending by dealPrice
      .where("status")
      .eq("open") // select only open orders
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

//Buy Order creation on the blockchain. TradeKey é um objId
// contract = new w3Provided.eth.Contract(abi, futureContract.address);
// var result = await contract.methods
//   .createBuyOrder(web3.toHex(tradeKey), contractsAmount, margin, dealPrice)
//   .send({
//     from: w3Provided.eth.defaultAccount,
//     gas: process.env.DEFAULT_GAS,
//     gasPrice: process.env.GASPRICE,
//     value: 1000
//   });
