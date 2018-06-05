require("./config/config.js");

const _ = require("lodash");
const { ObjectID } = require("mongodb");
const express = require("express");
const bodyParser = require("body-parser");

var { mongoose } = require("./db/mongoose.js");
var { BuyOrder } = require("./models/buyorder.js");

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

app.post("/newbuyorder", (req, res) => {
  var buyorder = new BuyOrder({
    buyerAddress: req.body.buyerAddress,
    tradeKey: null,
    contractsAmount: req.body.contractsAmount,
    dealPrice: req.body.dealPrice,
    depositedEther: req.body.depositedEther
  });

  buyorder.save().then(
    doc => {
      console.log("Document: ", doc);
      res.send(doc);
    },
    e => {
      console.log("Error: ", e);
      res.status(400).send(e); //refer to httpstatuses.com
    }
  );
});

app.listen(port, () => {
  console.log("Started on port " + port);
});

module.exports = { app };
