require("../config/config.js");
const web3 = require("../ethereum/web3.js");
const cryptojs = require("../utils/cipher.js");
const secalc = require("../utils/secalc.js");
const { mongoose } = require("../db/mongoose.js");
const { BuyOrder } = require("../models/buyorder.js");
const { FutureContract } = require("../models/futurecontract.js");
const compiledContract = require("../ethereum/build/FutureContract.json");

module.exports = {
  create: function(
    buyerAddress,
    pk,
    contractTitle,
    contractsAmount,
    margin,
    dealPrice
  ) {
    return new Promise(async function(resolve, reject) {
      try {
        const abi = JSON.parse(compiledContract.interface);

        var futureContract = await FutureContract.findOne({
          title: contractTitle
        }).exec();
        if (!futureContract) {
          throw `BuyOrder create Error: contract ${contractTitle} not found`;
        }

        const w3Provided = web3.web3WithProvider();
        const balance = await w3Provided.eth.getBalance(buyerAddress);
        if (!balance > futureContract.size + process.env.RESERVE_GAS) {
          throw "BuyOrder create Error: Insufficient balance for contractSize + GAS";
        }

        var buyorder = new BuyOrder({
          buyerAddress: buyerAddress,
          tradeKey: null,
          contractsAmount: contractsAmount,
          dealPrice: dealPrice,
          sk: ""
        });
        var doc = await buyorder.save();

        buyorder = await BuyOrder.findOne({ _id: doc._id });
        var pw = secalc.sec(
          buyorder.buyerAddress,
          buyorder.contractsAmount,
          buyorder.dealPrice,
          buyorder.createdAt
        );
        var cipherpk = cryptojs.encryptStr(pk, pw);
        buyorder.sk = cipherpk;
        doc = buyorder.save();
        resolve(doc);
      } catch (e) {
        console.log("createBuyOrder Error: ", e);
        reject(e);
      }
    });
  }
};
