require("./config/config.js");

var { mongoose } = require("./db/mongoose.js");
var { BuyOrder } = require("./models/buyorder.js");
var { SellOrder } = require("./models/sellorder.js");
var { Transaction } = require("./models/transaction.js");
var { Trade } = require("./models/trade.js");

("use strict");

class TradeEngine {
  constructor(match) {
    this.calcMatch = match;
  }

  async matchOrders() {
    try {
      var iSell = 0;
      var buyOrders = await this.getBuyOrders();
      var sellOrders = await this.getSellOrders();
      let transaction, trade, updatedBuyOrder;

      //walk through sellOrders trying a match a buy order to create a trade
      while (iSell < sellOrders.length) {
        var buyOrderMatches = buyOrders.filter(function(bo) {
          return (
            bo.status === "open" &&
            bo.dealPrice >= sellOrders[iSell].dealPrice &&
            bo.contractsAmount - bo.contractsDealed >=
              sellOrders[iSell].contractsAmount
          );
        });
        if (buyOrderMatches.length > 0) {
          var tradeId = new mongoose.Types.ObjectId();
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
    } catch (e) {
      console.log("Error: ", e);
    }
  }

  async updateBuyOrder(buyOrderMatches, sellOrder, tradeId) {
    if (buyOrderMatches.length == 0) {
      return false;
    }
    try {
      var buyOrder = buyOrderMatches[0];
      var bo = await BuyOrder.findOne({ _id: buyOrder._id }).exec();
      //one buy order may trade several sell orders
      if (
        bo.contractsDealed + sellOrder.contractsAmount >=
        bo.contractsAmount
      ) {
        bo.status = "closed";
        buyOrder.status = "closed"; //this is to prevent reuse this order in the array
      }
      bo.contractsDealed += sellOrder.contractsAmount;
      buyOrder.contractsDealed += sellOrder.contractsAmount; //updates in the array also
      bo.tradeKey === null
        ? (bo.tradeKey = [tradeId])
        : bo.tradeKey.push(tradeId);
      return await bo.save();
    } catch (err) {
      console.log("Err updateBuyOrder: ", err);
      return false;
    }
  }

  async updateSellOrder(buyOrderMatches, sellOrder, tradeId) {
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
  }

  createTrade(buyOrderMatches, sellOrder, tradeId) {
    if (buyOrderMatches.length == 0) {
      return false;
    }
    //try save trade
    var buyOrder = buyOrderMatches[0];
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
  }

  createTransaction(buyOrderMatches, sellOrder, tradeId) {
    if (buyOrderMatches.length == 0) {
      return false;
    }
    //try save transaction
    var buyOrder = buyOrderMatches[0];
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
  }

  getBuyOrders() {
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
  }

  getSellOrders() {
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
  }
}

module.exports = TradeEngine;
