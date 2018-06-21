require("./config/config.js");

const _ = require("lodash");
const { ObjectID } = require("mongodb");
const express = require("express");
const bodyParser = require("body-parser");

const { mongoose } = require("./db/mongoose.js");
const { BuyOrder } = require("./models/buyorder.js");
const { SellOrder } = require("./models/sellorder.js");
const { Trade } = require("./models/trade.js");
const { Transaction } = require("./models/transaction.js");
const TradeEngine = require("./trade-engine.js");

const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

app.get("/express", (req, res) => {
  res.send({ message: "Welcome to eth-Wallet Express Server" });
});

if (process.env.NODE_ENV === "production") {
  var sslRedirect = require("heroku-ssl-redirect");
  app.use(sslRedirect());
  // Express will serve up production assets
  // like our main.js file, or main.css file!
  app.use(express.static("client/build"));

  // Express will serve up the index.html file
  // if it doesn't recognize the route
  const path = require("path");
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

var tradeEngine = new TradeEngine(5000);
app.post("/executetrade", async (req, res) => {
  try {
    var result = await tradeEngine.executeTrade();
    res.send(result);
  } catch (e) {
    console.log("Error: ", e);
    res.status(400).send(e);
  }
});

app.post("/stoptrade", async (req, res) => {
  try {
    var result = await tradeEngine.stopTrade();
    res.send(result);
  } catch (e) {
    console.log("Error: ", e);
    res.status(400).send(e);
  }
});

app.post("/newbuyorder", (req, res) => {
  var buyorder = new BuyOrder({
    buyerAddress: req.body.buyerAddress,
    tradeKey: null,
    contractsAmount: req.body.contractsAmount,
    dealPrice: req.body.dealPrice
  });

  buyorder.save().then(
    doc => {
      res.send(doc);
    },
    e => {
      console.log("Error: ", e);
      res.status(400).send(e); //refer to httpstatuses.com
    }
  );
});

app.post("/newsellorder", (req, res) => {
  var sellorder = new SellOrder({
    sellerAddress: req.body.sellerAddress,
    tradeKey: null,
    contractsAmount: req.body.contractsAmount,
    dealPrice: req.body.dealPrice
  });

  sellorder.save().then(
    doc => {
      res.send(doc);
    },
    e => {
      console.log("Error: ", e);
      res.status(400).send(e); //refer to httpstatuses.com
    }
  );
});

app.post("/trade", async (req, res) => {
  var tradeId = new mongoose.Types.ObjectId();
  try {
    var buyOrder = await BuyOrder.findOne({
      buyerAddress: "123456789012345678901234567890123456789012"
    });
    if (!buyOrder) {
      return res.status(404).send();
    }
  } catch (e) {
    res.status(400).send();
  }
  try {
    var sellOrder = await SellOrder.findOne({
      sellerAddress: "000006789012345678901234567890123456789012"
    });
    if (!sellOrder) {
      return res.status(404).send();
    }
  } catch (e) {
    res.status(400).send();
  }
  try {
    var transaction = new Transaction({
      buyOrderKey: buyOrder._id,
      sellOrderKey: sellOrder._id,
      tradeKey: tradeId
    });

    await transaction.save();

    //create Trade after successfull insert transaction
    var trade = new Trade({
      sellerAddress: sellOrder.sellerAddress,
      buyerAddress: buyOrder.buyerAddress,
      contractAmount: req.body.contractsAmount,
      dealPrice: req.body.dealPrice,
      _id: tradeId
    });
    trade.save();

    res.send({ transaction: transaction });
  } catch (e) {
    res.status(400).send(e);
  }
});

app.listen(port, () => {
  console.log("Started on port " + port);
});

module.exports = { app };
