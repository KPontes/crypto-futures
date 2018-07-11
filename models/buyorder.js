const mongoose = require("mongoose");

var BuyOrderSchema = new mongoose.Schema(
  {
    buyerAddress: {
      type: String,
      required: true,
      minlength: 42,
      maxlength: 42,
      trim: true
    },
    tradeKey: {
      type: [mongoose.Schema.Types.ObjectId],
      default: []
    },
    contractsAmount: {
      type: Number,
      default: 1
    },
    contractsDealed: {
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
      default: "open",
      required: true
    },
    margin: {
      type: Number,
      default: 1,
      required: true
    },
    depositedEther: {
      type: Number,
      default: 0,
      required: true
    }
  },
  {
    timestamps: true
  }
);

var BuyOrder = mongoose.model("BuyOrder", BuyOrderSchema);

module.exports = { BuyOrder };
