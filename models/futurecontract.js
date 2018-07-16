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
      trim: true
    },
    size: {
      type: Number,
      default: 1,
      required: true
    },
    endDate: {
      type: Number,
      required: true
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
