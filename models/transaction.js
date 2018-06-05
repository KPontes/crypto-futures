const mongoose = require("mongoose");

// this is for workaround on the lack of atomicity of multidocs transactions on Mongodb
var Transaction = mongoose.model("Transaction", {
  buyOrderKey: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true
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
});

module.exports = { Transaction };
