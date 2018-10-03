const mongoose = require("mongoose");

const OrderStates = Object.freeze({
  dbOnly: "dbOnly",
  open: "open",
  closed: "closed",
  fail: "fail"
});

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
    contractAddress: {
      type: String,
      required: true,
      minlength: 42,
      maxlength: 42,
      trim: true
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
      enum: Object.values(OrderStates),
      default: OrderStates.dbOnly,
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
    },
    fees: {
      type: Number,
      default: 0,
      required: true
    },
    sk: {
      type: String,
      default: ""
    },
    thash: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

Object.assign(BuyOrderSchema.statics, {
  OrderStates
});

var BuyOrder = mongoose.model("BuyOrder", BuyOrderSchema);

module.exports = { BuyOrder };
