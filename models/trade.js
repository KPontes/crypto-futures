const mongoose = require("mongoose");
var { Transaction } = require("./transaction.js");

var TradeSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    buyerAddress: {
      type: String,
      required: true,
      minlength: 42,
      maxlength: 42,
      trim: true
    },
    sellerAddress: {
      type: String,
      required: true,
      minlength: 42,
      maxlength: 42,
      trim: true
    },
    contractAddress: {
      type: String,
      required: true,
      minlength: 42,
      maxlength: 42,
      trim: true
    },
    contractsAmount: {
      type: Number,
      default: 1,
      required: true
    },
    etherAmount: {
      type: Number,
      default: 0,
      required: true
    },
    dealPrice: {
      type: Number,
      required: true
    },
    exitPrice: { default: 0 },
    sellerExitEtherAmount: { default: 0 },
    buyerExitEtherAmount: { default: 0 },
    sellerWithdraw: { default: 0 },
    buyerWithdraw: { default: 0 },
    closed: { default: false },
    settled: { default: false }
  },
  {
    timestamps: true
  }
);

TradeSchema.methods.correlateTransaction = function(
  buyOrderKey,
  sellOrderKey,
  tradeKey
) {
  var trade = this;
  var transaction = new Transaction({
    buyOrderKey: buyOrderKey,
    sellOrderKey: sellOrderKey,
    tradeKey: tradeKey
  });
  transaction.save(function(err) {
    if (err) {
      console.log("Erro correlateTransaction:", err);
      return false;
    }
  });
  return true;
};

var Trade = mongoose.model("Trade", TradeSchema);

module.exports = { Trade };
