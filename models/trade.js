const mongoose = require("mongoose");
var { Transaction } = require("./transaction.js");

const OrderStates = Object.freeze({
  dbOnly: "dbOnly",
  open: "open",
  calculated: "calculated",
  closed: "closed",
  fail: "fail"
});

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
    status: {
      type: String,
      enum: Object.values(OrderStates),
      default: OrderStates.dbOnly,
      required: true
    },
    liquidate: { type: Boolean, default: false, required: true },
    exitPrice: { type: Number, default: 0, required: true },
    exitFactor: { type: Number, default: 0, required: true },
    sellerExitEtherAmount: { type: Number, default: 0, required: true },
    buyerExitEtherAmount: { type: Number, default: 0, required: true },
    sellerWithdraw: { type: Number, default: 0, required: true },
    buyerWithdraw: { type: Number, default: 0, required: true }
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

Object.assign(TradeSchema.statics, {
  OrderStates
});

var Trade = mongoose.model("Trade", TradeSchema);

module.exports = { Trade };
