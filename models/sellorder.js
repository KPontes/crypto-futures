const mongoose = require("mongoose");

var SellOrderSchema = new mongoose.Schema(
  {
    sellerAddress: {
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

var SellOrder = mongoose.model("SellOrder", SellOrderSchema);

module.exports = { SellOrder };
