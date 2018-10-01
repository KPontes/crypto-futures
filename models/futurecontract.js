const mongoose = require("mongoose");

var FutureContractSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      required: true,
      minlength: 42,
      maxlength: 42,
      trim: true
    },
    title: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 6,
      trim: true,
      unique: true
    },
    size: {
      type: String,
      required: true
    },
    endDate: {
      type: Number,
      required: true
    },
    allowWithdraw: {
      type: Boolean,
      required: true,
      default: false
    },
    lastPrice: {
      type: Number,
      required: true,
      default: 0
    },
    manager: {
      type: String,
      required: true,
      minlength: 42,
      maxlength: 42,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

var FutureContract = mongoose.model("FutureContract", FutureContractSchema);

module.exports = { FutureContract };
