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
const { FutureContract } = require("./models/futurecontract.js");
const TradeEngine = require("./controller/trade-engine.js");
const factory = require("./controller/ctrl-future-contract.js");
const ctrlBuyOrder = require("./controller/buyOrder.js");
const ctrlSellOrder = require("./controller/sellOrder.js");
const ctrlTrade = require("./controller/trade.js");
const ctrlTest = require("./controller/testFunctions.js"); //const web3 = require("./ethereum/web3.js");

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

app.post("/createcontract", async (req, res) => {
  try {
    const result = await factory.createFuture(
      req.body.pk,
      req.body.title,
      req.body.size,
      req.body.endDate
    );
    res.status(200).send(result);
  } catch (e) {
    console.log("Error: ", e);
    res.status(400).send(e); //refer to httpstatuses.com
  }
});

app.post("/savebyfabric", async (req, res) => {
  try {
    const result = await factory.saveViaFabric(req.body.pk);
    res.status(200).send(result);
  } catch (e) {
    console.log("Error: ", e);
    res.status(400).send(e); //refer to httpstatuses.com
  }
});
app.post("/savedirect", async (req, res) => {
  try {
    const result = await factory.saveDirect(
      req.body.pk,
      req.body.contractAddress
    );
    res.status(200).send(result);
  } catch (e) {
    console.log("Error: ", e);
    res.status(400).send(e); //refer to httpstatuses.com
  }
});

app.post("/newbuyorder", async (req, res) => {
  try {
    const result = await ctrlBuyOrder.createDb(
      req.body.buyerAddress,
      req.body.pk,
      req.body.contractTitle,
      req.body.contractsAmount,
      1,
      req.body.dealPrice,
      req.body.depositedEther
    );
    res.status(200).send(result);
  } catch (e) {
    console.log("Error: ", e);
    res.status(400).send(e); //refer to httpstatuses.com
  }
});

app.post("/getbuyorder", async (req, res) => {
  try {
    const result = await ctrlBuyOrder.getBuyOrderEthers(
      req.body.key,
      req.body.contractTitle,
      req.body.pk
    );
    res.status(200).send(result);
  } catch (e) {
    console.log("Error: ", e);
    res.status(400).send(e); //refer to httpstatuses.com
  }
});

app.post("/newsellorder", async (req, res) => {
  try {
    const result = await ctrlSellOrder.createDb(
      req.body.sellerAddress,
      req.body.pk,
      req.body.contractTitle,
      req.body.contractsAmount,
      1,
      req.body.dealPrice,
      req.body.depositedEther
    );
    res.status(200).send(result);
  } catch (e) {
    console.log("Error: ", e);
    res.status(400).send(e); //refer to httpstatuses.com
  }
});

app.post("/getsellorder", async (req, res) => {
  try {
    const result = await ctrlSellOrder.getSellOrderEthers(
      req.body.key,
      req.body.contractTitle,
      req.body.pk
    );
    res.status(200).send(result);
  } catch (e) {
    console.log("Error: ", e);
    res.status(400).send(e); //refer to httpstatuses.com
  }
});

var tradeEngine = new TradeEngine(5000);
app.post("/executetrade", async (req, res) => {
  try {
    //contractTitle AO INVÉS DE PARÂMETRO, DEVE SER ITERADO NO BD
    //var result = await tradeEngine.executeOnce(
    var result = await tradeEngine.executeTrade(
      req.body.contractTitle,
      req.body.pk
    );
    res.send(result);
  } catch (e) {
    console.log("Error: ", e);
    res.status(400).send(e);
  }
});

app.post("/gettrade", async (req, res) => {
  try {
    const result = await ctrlTrade.getTradeEthers(
      req.body.key,
      req.body.contractTitle,
      req.body.pk
    );
    res.status(200).send(result);
  } catch (e) {
    console.log("Error: ", e);
    res.status(400).send(e); //refer to httpstatuses.com
  }
});

app.post("/calcliquidation", async (req, res) => {
  try {
    const result = await ctrlTrade.calculateLiquidation(
      req.body.pk,
      req.body.contractTitle,
      req.body.tradeKey,
      req.body.exitPrice
    );
    res.status(200).send(result);
  } catch (e) {
    console.log("Error: ", e);
    res.status(400).send(e); //refer to httpstatuses.com
  }
});

app.post("/tradewithdraw", async (req, res) => {
  try {
    const result = await ctrlTrade.tradeWithdrawEthers(
      req.body.pk,
      req.body.contractTitle,
      req.body.tradeKey
    );
    res.status(200).send(result);
  } catch (e) {
    console.log("Error: ", e);
    res.status(400).send(e); //refer to httpstatuses.com
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

app.post("/testfunction", async (req, res) => {
  try {
    const result = await ctrlTest.test(
      req.body.contractTitle,
      req.body.testStr,
      req.body.depositedEther
    );
    res.status(200).send(result);
  } catch (e) {
    console.log("Error: ", e);
    res.status(400).send(e); //refer to httpstatuses.com
  }
});

app.listen(port, () => {
  console.log("Started on port " + port);
});

module.exports = { app };
