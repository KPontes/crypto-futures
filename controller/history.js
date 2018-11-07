require("../config/config.js");

const { mongoose } = require("../db/mongoose.js");
const { SellOrder } = require("../models/sellorder.js");
const { BuyOrder } = require("../models/buyorder.js");
const { Trade } = require("../models/trade.js");
const ctrlFutureContract = require("./ctrl-future-contract.js");

exports.orders = function(contractTitle, userAddress) {
  return new Promise(async function(resolve, reject) {
    try {
      const fc = await ctrlFutureContract.findContractBd(contractTitle);
      const trades = await Trade.find({
        status: { $ne: "fail" },
        contractAddress: fc.address,
        $and: [
          {
            $or: [{ sellerAddress: userAddress }, { buyerAddress: userAddress }]
          }
        ]
      })
        .sort({ createdAt: -1 })
        .limit(20)
        .exec();

      const buyorder = await BuyOrder.find({
        status: { $ne: "dbOnly" },
        contractAddress: fc.address,
        buyerAddress: userAddress
      })
        .sort({ createdAt: -1 })
        .limit(20)
        .exec();

      const sellorder = await SellOrder.find({
        status: { $ne: "dbOnly" },
        contractAddress: fc.address,
        sellerAddress: userAddress
      })
        .sort({ createdAt: -1 })
        .limit(20)
        .exec();
      resolve({ trades, buyorder, sellorder, userAddress, futureContract: fc });
    } catch (e) {
      console.log("Order history Error: ", e);
      reject(e);
    }
  });
};
