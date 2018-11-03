require("../config/config.js");
const intervalObj = require("interval-promise");
const axios = require("axios");
var { mongoose } = require("../db/mongoose.js");
var { FutureContract } = require("../models/futurecontract.js");
const compiledContract = require("../ethereum/build/FutureContract.json");
const trade = require("./trade.js");

("use strict");

module.exports = FutureParams;

function FutureParams(interval) {
  this.interval = interval;
  this.stopExecute = false;
}

FutureParams.prototype.executePooling = async function(contractTitle) {
  var _this = this;
  var fc = await FutureContract.findOne({ title: contractTitle }).exec();
  if (!fc) {
    _this.stopExecute = true;
    console.log(`Err executePooling. Contract ${contractTitle} not fount`);
  }
  intervalObj(
    async (iteration, stop) => {
      try {
        if (_this.stopExecute) {
          console.log("Stop executePooling loop");
          stop();
        }
        var result = await _this.setEtherValue(fc);
        var result = await trade.monitorLiquidation(fc.title);
        //_this.stopExecute = false;
        if (result !== "OK") {
          _this.stopExecute = true;
          throw result;
        }
      } catch (err) {
        console.log("Err executePooling", err);
        _this.stopExecute = true;
      }
    },
    _this.interval,
    (options = { stopOnError: true })
  );
};

FutureParams.prototype.getCoinMarketCap = function() {
  return new Promise(function(resolve, reject) {
    axios
      .get("https://api.coinmarketcap.com/v2/ticker/1027/")
      .then(res => {
        tokenData = res.data;
        resolve(tokenData);
      })
      .catch(err => {
        console.log("Err getCoinMarketCap: ", err);
        reject(err);
      });
  });
};

FutureParams.prototype.setEtherValue = function(fc) {
  var _this = this;
  return new Promise(async function(resolve, reject) {
    try {
      var result = await _this.getCoinMarketCap();
      var price = 0;
      if (result && !fc.allowWithdraw) {
        price = result.data.quotes.USD.price;
        fc.lastPrice = Number(price).toFixed(2);
        await fc.save();
      }
      resolve("OK");
    } catch (err) {
      console.log("Err setEtherValue: ", err);
      reject(err);
    }
  });
};

FutureParams.prototype.getEtherValue = function(contractAddress) {
  return new Promise(function(resolve, reject) {
    FutureContract.find() // find all buyorders
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

FutureParams.prototype.stopExecute = function() {
  this.stopExecute = true;
  // clearInterval(this.intervalObject);
  console.log("FutureParams stopExecute");
};
