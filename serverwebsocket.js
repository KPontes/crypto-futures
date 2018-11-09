const io = require("socket.io")();
const { Trade } = require("./models/trade.js");
const { SellOrder } = require("./models/sellorder.js");
const { BuyOrder } = require("./models/buyorder.js");

// here you can start emitting events to the client
const wsport = 8000;
io.on("connection", client => {
  client.on("subscribeToTrades", interval => {
    console.log("client is subscribing to trades with interval ", interval);
    let tradeData;
    setInterval(async () => {
      tradingData = await getTradingData();
      client.emit("newtrade", tradingData);
    }, interval);
  });
});

function getTradingData() {
  return new Promise(async function(resolve, reject) {
    try {
      const trades = await Trade.find({ status: { $ne: "fail" } })
        .sort({ createdAt: -1 })
        .limit(20)
        .exec();

      const buyorders = await BuyOrder.find({
        status: { $ne: "dbOnly" },
        tradeKey: null
      })
        .sort({ createdAt: -1 })
        .limit(20)
        .exec();

      const sellorders = await SellOrder.find({
        status: { $ne: "dbOnly" },
        tradeKey: null
      })
        .sort({ createdAt: -1 })
        .limit(20)
        .exec();

      resolve({ trades, buyorders, sellorders });
    } catch (e) {
      console.log("getTradingData Error: ", e);
      reject(e);
    }
  });
}

io.listen(wsport);
console.log("websocket api on port ", wsport);
