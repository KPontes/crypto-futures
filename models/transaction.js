const mongoose = require("mongoose");

// this is for workaround on the lack of atomicity of multidocs transactions on Mongodb
var TransactionSchema = new mongoose.Schema(
  {
    buyOrderKey: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    sellOrderKey: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true
    },
    tradeKey: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true
    }
  },
  {
    timestamps: true
  }
);
TransactionSchema.index({ buyOrderKey: 1, sellOrderKey: 1 }, { unique: true });

var Transaction = mongoose.model("Transaction", TransactionSchema);

module.exports = { Transaction };
