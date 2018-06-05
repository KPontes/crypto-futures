const mongoose = require("mongoose");

var SellOrder = mongoose.model("SellOrder", {
  sellerAddress: {
    type: String,
    required: true,
    minlength: 42,
    maxlength: 42,
    trim: true
  },
  tradeKey: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  contractsAmount: {
    type: Number,
    default: 1
  },
  dealPrice: {
    type: Number,
    required: true
  },
  depositedEther: {
    type: Number,
    default: 0,
    required: true
  }
});

module.exports = { SellOrder };
