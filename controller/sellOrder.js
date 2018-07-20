require("../config/config.js");
const web3 = require("../ethereum/web3.js");
const cryptojs = require("../utils/cipher.js");
const secalc = require("../utils/secalc.js");
const { mongoose } = require("../db/mongoose.js");
const { SellOrder } = require("../models/sellorder.js");
const { FutureContract } = require("../models/futurecontract.js");
const compiledContract = require("../ethereum/build/FutureContract.json");

module.exports = {
  create: function(
    sellerAddress,
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
          throw `SellOrder create Error: contract ${contractTitle} not found`;
        }

        const w3Provided = web3.web3WithProvider();
        const balance = await w3Provided.eth.getBalance(sellerAddress);
        if (!balance > futureContract.size + process.env.RESERVE_GAS) {
          throw "SellOrder create Error: Insufficient balance for contractSize + GAS";
        }

        var sellorder = new SellOrder({
          sellerAddress: sellerAddress,
          tradeKey: null,
          contractsAmount: contractsAmount,
          dealPrice: dealPrice,
          sk: ""
        });
        var doc = await sellorder.save();

        sellorder = await SellOrder.findOne({ _id: doc._id });

        var pw = secalc.sec(
          sellorder.sellerAddress,
          sellorder.contractsAmount,
          sellorder.dealPrice,
          sellorder.createdAt
        );
        var cipherpk = cryptojs.encryptStr(pk, pw);
        sellorder.sk = cipherpk;
        doc = sellorder.save();
        resolve(doc);
      } catch (e) {
        console.log("createSellOrder Error: ", e);
        reject(e);
      }
    });
  }
};
