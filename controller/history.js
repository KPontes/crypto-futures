require("../config/config.js");

const { mongoose } = require("../db/mongoose.js");
var ObjectId = require("mongoose").Types.ObjectId;
const { SellOrder } = require("../models/sellorder.js");
const { BuyOrder } = require("../models/buyorder.js");
const { Trade } = require("../models/trade.js");
const { Transaction } = require("../models/transaction.js");
const ctrlFutureContract = require("./ctrl-future-contract.js");

exports.orders = function(contractTitle, userAddress) {
  return new Promise(async function(resolve, reject) {
    try {
      const address = new RegExp(`^${userAddress}$`, "i"); //to ignore case sensitivity of address on DB
      const fc = await ctrlFutureContract.findContractBd(contractTitle);
      const trades = await Trade.find({
        status: { $ne: "fail" },
        contractAddress: fc.address,
        $and: [
          {
            $or: [{ sellerAddress: address }, { buyerAddress: address }]
          }
        ]
      })
        .sort({ createdAt: -1 })
        .limit(20)
        .exec();

      const buyorders = await BuyOrder.find({
        status: { $ne: "dbOnly" },
        contractAddress: fc.address,
        buyerAddress: address
      })
        .sort({ createdAt: -1 })
        .limit(20)
        .exec();

      const sellorders = await SellOrder.find({
        status: { $ne: "dbOnly" },
        contractAddress: fc.address,
        sellerAddress: address
      })
        .sort({ createdAt: -1 })
        .limit(20)
        .exec();

      const transactions = await getTransactions(trades);

      resolve({
        trades,
        buyorders,
        sellorders,
        transactions,
        userAddress: userAddress.toString(),
        futureContract: fc
      });
    } catch (e) {
      console.log("Order history Error: ", e);
      reject(e);
    }
  });
};

function getTransactions(trades) {
  return new Promise(async function(resolve, reject) {
    try {
      var transactions = [];
      for (let trade of trades) {
        var tr = await Transaction.findOne({
          tradeKey: ObjectId(trade._id)
        }).exec();
        transactions.push(tr);
      }
      resolve(transactions);
    } catch (e) {
      console.log("getTransaction Error: ", e);
      reject(e);
    }
  });
}
