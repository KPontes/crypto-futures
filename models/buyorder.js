const mongoose = require("mongoose");

var BuyOrder = mongoose.model("BuyOrder", {
  buyerAddress: {
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

module.exports = { BuyOrder };

// var newTodo = new Todo({
//   text: "shop supermarket",
//   completed: false,
//   completedAt: 10000
// });
// newTodo.save().then((doc) => {
//   console.log('Saved Todo', doc);
// }, (e) => {
//   console.log('Unable to save', e);
// });
