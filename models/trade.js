const mongoose = require("mongoose");

var Trade = mongoose.model("Trade", {
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
  exitPrice: { default: "0" },
  sellerExitEtherAmount: { default: 0 },
  buyerExitEtherAmount: { default: 0 },
  sellerWithdraw: { default: 0 },
  buyerWithdraw: { default: 0 },
  closed: { default: false },
  settled: { default: false }
});

module.exports = { Trade };
