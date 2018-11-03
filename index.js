require("./config/config.js");
require("./serverwebsocket");

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
const FutureParams = require("./controller/futureParams.js");
const ctrlfc = require("./controller/ctrl-future-contract.js");
const ctrlBuyOrder = require("./controller/buyOrder.js");
const ctrlSellOrder = require("./controller/sellOrder.js");
const ctrlTrade = require("./controller/trade.js");
//const ctrlTest = require("./controller/testFunctions.js"); //const web3 = require("./ethereum/web3.js");

const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());
app.use(function(req, res, next) {
  //enable CORS
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.get("/express", (req, res) => {
  res.send({ message: "Welcome to crypto-Futures Express Server" });
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
    const result = await ctrlfc.createFuture(
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
    const result = await ctrlfc.saveViaFabric(req.body.pk);
    res.status(200).send(result);
  } catch (e) {
    console.log("Error: ", e);
    res.status(400).send(e); //refer to httpstatuses.com
  }
});
app.post("/savedirect", async (req, res) => {
  try {
    const result = await ctrlfc.saveDirect(
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

app.post("/listtrades", async (req, res) => {
  try {
    const result = await ctrlTrade.list(req.body.contractTitle);
    res.status(200).send(result);
  } catch (e) {
    console.log("Error: ", e);
    res.status(400).send(e); //refer to httpstatuses.com
  }
});

app.post("/listcontracts", async (req, res) => {
  try {
    const result = await ctrlfc.findContractBd(req.body.contractTitle);
    res.status(200).send(result);
  } catch (e) {
    console.log("Error: ", e);
    res.status(400).send(e); //refer to httpstatuses.com
  }
});

app.post("/setliqprice", async (req, res) => {
  try {
    const result = await ctrlTrade.setLiqPriceEthers(
      req.body.pk,
      req.body.contractTitle,
      req.body.exitPrice,
      req.body.allowWithdraw
    );
    res.status(200).send(result);
  } catch (e) {
    console.log("Error: ", e);
    res.status(400).send(e); //refer to httpstatuses.com
  }
});

app.post("/estimateliquidation", async (req, res) => {
  try {
    const result = await ctrlTrade.estimateLiquidation(
      req.body.contractTitle,
      req.body.tradeKey
    );
    res.status(200).send(result);
  } catch (e) {
    console.log("Error: ", e);
    res.status(400).send(e); //refer to httpstatuses.com
  }
});

app.post("/processliquidation", async (req, res) => {
  try {
    const result = await ctrlTrade.processLiquidation(
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

app.post("/balance", async (req, res) => {
  try {
    const result = await ctrlfc.balanceEthers(
      req.body.contractTitle,
      req.body.pk
    );
    res.status(200).send(result);
  } catch (e) {
    console.log("Error: ", e);
    res.status(400).send(e); //refer to httpstatuses.com
  }
});

var fp = new FutureParams(5000); //30000
app.post("/execfutureparams", async (req, res) => {
  try {
    //contractTitle AO INVÉS DE PARÂMETRO, DEVE SER ITERADO NO BD
    //var result = await fp.executeOnce(
    var result = await fp.executePooling(req.body.contractTitle);
    res.send(result);
  } catch (e) {
    console.log("Error: ", e);
    res.status(400).send(e);
  }
});

var tradeEngine = new TradeEngine(5000);
app.post("/executetrade", async (req, res) => {
  try {
    //contractTitle AO INVÉS DE PARÂMETRO, DEVE SER ITERADO NO BD
    //var result = await tradeEngine.executeOnce(
    var result = await tradeEngine.executeTrade(req.body.contractTitle);
    res.send(result);
  } catch (e) {
    console.log("Error: ", e);
    res.status(400).send(e);
  }
});

app.listen(port, () => {
  console.log("Started on port " + port);
});

module.exports = { app };

// app.post("/testfunction", async (req, res) => {
//   try {
//     const result = await ctrlTest.test(
//       req.body.contractTitle,
//       req.body.testStr,
//       req.body.depositedEther
//     );
//     res.status(200).send(result);
//   } catch (e) {
//     console.log("Error: ", e);
//     res.status(400).send(e); //refer to httpstatuses.com
//   }
// });
