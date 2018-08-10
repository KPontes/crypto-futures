require("../config/config.js");
const intervalObj = require("interval-promise");
const ethers = require("ethers");
const etherTx = require("ethereumjs-tx");
const web3 = require("../ethereum/web3.js");
const cryptojs = require("../utils/cipher.js");
const secalc = require("../utils/secalc.js");
var { mongoose } = require("../db/mongoose.js");
var { BuyOrder } = require("../models/buyorder.js");
var { SellOrder } = require("../models/sellorder.js");
var { FutureContract } = require("../models/futurecontract.js");
var { Transaction } = require("../models/transaction.js");
var { Trade } = require("../models/trade.js");
const compiledContract = require("../ethereum/build/FutureContract.json");

("use strict");

module.exports = TradeEngine;

function TradeEngine(interval) {
  this.interval = interval;
  this.stopExecute = false;
}

TradeEngine.prototype.executeTrade = async function(contractTitle) {
  var _this = this;
  var fc = await FutureContract.findOne({ title: contractTitle }).exec();
  if (!fc) {
    _this.stopExecute = true;
    console.log(`Err executeTrade. Contract ${contractTitle} not fount`);
  }
  intervalObj(
    async (iteration, stop) => {
      try {
        if (_this.stopExecute) {
          console.log("Stop executeTrade loop");
          stop();
        }
        var result = await _this.matchOrders(fc);
        if (result !== "OK") {
          _this.stopExecute = true;
          throw result;
        }
      } catch (err) {
        console.log("Err executeTrade", err);
        _this.stopExecute = true;
      }
    },
    _this.interval,
    (options = { stopOnError: true })
  );
};

TradeEngine.prototype.stopTrade = function() {
  this.stopExecute = true;
  // clearInterval(this.intervalObject);
  console.log("stopTrade");
};

TradeEngine.prototype.matchOrders = async function(futureContract) {
  try {
    var contractAddress = futureContract.address;
    var iSell = 0;
    var buyOrders = await this.getBuyOrders(contractAddress);
    var sellOrders = await this.getSellOrders(contractAddress);
    let transaction,
      trade,
      updatedBuyOrder,
      updatedSellOrder,
      buyOrderMatches,
      tradeId;

    //walk through sellOrders trying to match a buy order to create a trade
    while (iSell < sellOrders.length) {
      buyOrderMatches = await buyOrders.filter(function(bo) {
        return (
          bo.status === "open" &&
          bo.dealPrice >= sellOrders[iSell].dealPrice &&
          bo.buyerAddress !== sellOrders[iSell].sellerAddress &&
          bo.contractsAmount - bo.contractsDealed >=
            sellOrders[iSell].contractsAmount
        );
      });

      console.log("buyOrderMatches:", buyOrderMatches);
      if (buyOrderMatches.length > 0) {
        tradeId = new mongoose.Types.ObjectId();

        transaction = await this.createTransaction(
          buyOrderMatches,
          sellOrders[iSell],
          tradeId
        );
        if (transaction) {
          trade = await this.createTrade(
            buyOrderMatches,
            sellOrders[iSell],
            tradeId,
            contractAddress
          );
          if (trade) {
            updatedBuyOrder = await this.updateBuyOrder(
              buyOrderMatches,
              sellOrders[iSell],
              tradeId
            );
            updatedSellOrder = await this.updateSellOrder(
              buyOrderMatches,
              sellOrders[iSell],
              tradeId
            );
            // if (updatedBuyOrder && updatedSellOrder) {
            //   await this.createBuyOrderBlockchainEthers(
            //     buyOrderMatches[0],
            //     tradeId,
            //     contractAddress
            //   );
            // }
          }
        }
      }
      iSell++;
    }
    return "OK";
  } catch (e) {
    console.log("Err matchOrders: ", e);
    return e.message;
  }
};

TradeEngine.prototype.updateBuyOrder = async function(
  buyOrderMatches,
  sellOrder,
  tradeId
) {
  if (buyOrderMatches.length == 0) {
    return false;
  }
  try {
    var buyOrder = buyOrderMatches[0];
    var bo = await BuyOrder.findOne({ _id: buyOrder._id }).exec();
    //one buy order may trade several sell orders
    if (bo.contractsDealed + sellOrder.contractsAmount >= bo.contractsAmount) {
      bo.status = "closed"; //this is for mongoDB
      buyOrder.status = "closed"; //this is to prevent reuse this order in the memory array
    }
    bo.contractsDealed += sellOrder.contractsAmount;
    buyOrder.contractsDealed += sellOrder.contractsAmount; //updates in the array also
    //tradeKey is an array with all tradeKeys related to this buyOrder
    bo.tradeKey === null
      ? (bo.tradeKey = [tradeId])
      : bo.tradeKey.push(tradeId);
    return await bo.save();
  } catch (err) {
    console.log("Err updateBuyOrder: ", err);
    return false;
  }
};

TradeEngine.prototype.updateSellOrder = async function(
  buyOrderMatches,
  sellOrder,
  tradeId
) {
  if (buyOrderMatches.length == 0) {
    return false;
  }
  try {
    var buyOrder = buyOrderMatches[0];
    var so = await SellOrder.findOne({ _id: sellOrder._id }).exec();
    so.status = "closed";
    sellOrder.status = "closed";
    //one sell order trades with only one buy order
    so.contractsDealed = sellOrder.contractsAmount;
    so.tradeKey === null
      ? (so.tradeKey = [tradeId])
      : so.tradeKey.push(tradeId);
    return await so.save();
  } catch (err) {
    console.log("Err updateSellOrder: ", err);
    return false;
  }
};

TradeEngine.prototype.createTrade = function(
  buyOrderMatches,
  sellOrder,
  tradeId,
  contractAddress
) {
  if (buyOrderMatches.length == 0) {
    return false;
  }
  var buyOrder = buyOrderMatches[0];
  if (buyOrder.buyerAddress === sellOrder.sellerAddress) {
    return false;
  }
  //try save trade
  return new Promise(function(resolve, reject) {
    var trade = new Trade({
      sellerAddress: sellOrder.sellerAddress,
      buyerAddress: buyOrder.buyerAddress,
      contractAmount: sellOrder.contractsAmount,
      dealPrice: sellOrder.dealPrice,
      contractAddress: contractAddress,
      _id: tradeId
    });
    trade
      .save()
      .then(doc => {
        resolve(doc);
      })
      .catch(err => {
        console.log("Err createTrade: ", err);
        reject(err);
      });
  });
};

TradeEngine.prototype.createTransaction = function(
  buyOrderMatches,
  sellOrder,
  tradeId
) {
  if (buyOrderMatches.length == 0) {
    return false;
  }
  var buyOrder = buyOrderMatches[0];
  if (buyOrder.buyerAddress === sellOrder.sellerAddress) {
    console.log("buyOrder.buyerAddress === sellOrder.sellerAddress");
    return false;
  }
  if (buyOrder.contractAddress !== sellOrder.contractAddress) {
    console.log("buyOrder.contractAddress <> sellOrder.contractAddress");
    return false;
  }
  //try save transaction
  return new Promise(function(resolve, reject) {
    var transaction = new Transaction({
      buyOrderKey: buyOrder._id,
      sellOrderKey: sellOrder._id,
      tradeKey: tradeId
    });
    transaction
      .save()
      .then(doc => {
        resolve(doc);
      })
      .catch(err => {
        console.log("Err createTransaction: ", err);
        reject(err);
      });
  });
};

TradeEngine.prototype.getBuyOrders = function(contractAddress) {
  return new Promise(function(resolve, reject) {
    BuyOrder.find() // find all buyorders
      .sort({ dealPrice: 1 }) // sort ascending by dealPrice
      .where("status")
      .eq("open")
      .where("contractAddress")
      .eq(contractAddress)
      .exec()
      .then(docs => {
        resolve(docs);
      })
      .catch(err => {
        console.log("Err getBuyOrders: ", err);
        reject(err);
      });
  });
};

TradeEngine.prototype.getSellOrders = function(contractAddress) {
  return new Promise(function(resolve, reject) {
    SellOrder.find() // find all buyorders
      .sort({ dealPrice: 1 }) // sort ascending by dealPrice
      .where("status")
      .eq("open") // select only open orders
      .where("contractAddress")
      .eq(contractAddress)
      .exec()
      .then(docs => {
        resolve(docs);
      })
      .catch(err => {
        console.log("Err getSellOrders: ", err);
        reject(err);
      });
  });
};

TradeEngine.prototype.createTradeBlockchainEthers = async function(
  buyOrderMatches,
  sellOrder,
  tradeId,
  contractAddress
) {
  sellorder = await SellOrder.findOne({ _id: sellOrder._id });
  var pw = secalc.sec(
    sellorder.sellerAddress,
    sellorder.contractsAmount,
    sellorder.dealPrice,
    sellorder.createdAt
  );
  var sk = cryptojs.decryptStr(sellorder.sk, pw);
  sk = sk.indexOf("0x") === 0 ? sk : "0x" + sk;
  const NETWORK = "rinkeby";
  const w3Provided = web3.web3WithProvider(); //to access utils
  var provider = ethers.providers.getDefaultProvider(NETWORK);

  //************* refatorar para estas inicializações ocorrerem somente uma vez
  const abi = JSON.parse(compiledContract.interface);
  var wallet = new ethers.Wallet(sk, provider);
  var contract = new ethers.Contract(contractAddress, abi, wallet);
  var overrideOptions = {
    nonce: 6,
    gasLimit: 30000,
    gasPrice: 20000,
    value: ethers.utils.parseEther("1.001")
  };
  var result = contract.createSellOrder(
    w3Provided.utils.toHex(tradeId),
    sellorder.contractsAmount,
    sellorder.margin,
    sellorder.dealPrice,
    overrideOptions
  );
  result.then(function(transaction) {
    console.log(transaction);
  });
  // console.log("result:", result);
  // return result;
};

TradeEngine.prototype.createTradeBlockchainWeb3 = async function(
  buyOrderMatches,
  sellOrder,
  tradeId,
  contractAddress
) {
  sellorder = await SellOrder.findOne({ _id: sellOrder._id });
  var pw = secalc.sec(
    sellorder.sellerAddress,
    sellorder.contractsAmount,
    sellorder.dealPrice,
    sellorder.createdAt
  );
  var sk = cryptojs.decryptStr(sellorder.sk, pw);
  sk = sk.indexOf("0x") === 0 ? sk : "0x" + sk;

  //************* refatorar para estas inicializações ocorrerem somente uma vez
  const abi = JSON.parse(compiledContract.interface);
  const w3Provided = web3.web3WithProvider();
  const account = w3Provided.eth.accounts.privateKeyToAccount(sk);
  w3Provided.eth.accounts.wallet.add(account);
  w3Provided.eth.defaultAccount = account.address;
  var contract = await new w3Provided.eth.Contract(abi, contractAddress);

  var methodCall = contract.methods.createSellOrder(
    w3Provided.utils.toHex(tradeId),
    sellorder.contractsAmount,
    sellorder.margin,
    sellorder.dealPrice
  );
  var encodedABI = await methodCall.encodeABI();
  var txCount = await w3Provided.eth.getTransactionCount(
    w3Provided.eth.defaultAccount
  );

  var txParams = {
    nonce: w3Provided.utils.toHex(txCount),
    chainId: w3Provided.utils.toHex(4),
    networkId: w3Provided.utils.toHex(4),
    from: w3Provided.eth.defaultAccount,
    to: contractAddress,
    gasLimit: w3Provided.utils.toHex(3000000),
    gasPrice: w3Provided.utils.toHex(20000),
    value: w3Provided.utils.toHex(w3Provided.utils.toWei("1.01", "ether")),
    data: encodedABI
  };
  //var balance = await w3Provided.eth.getBalance(w3Provided.eth.defaultAccount);
  const bufferedPk = Buffer.from(account.privateKey.replace("0x", ""), "hex");
  const transaction = new etherTx(txParams);

  transaction.sign(bufferedPk);
  const serializedTx = transaction.serialize();
  console.log("serializedTx:", serializedTx);

  let result = await w3Provided.eth.sendSignedTransaction(
    "0x" + serializedTx.toString("hex")
  );

  console.log("result:", result);
  return result;
};

TradeEngine.prototype.testFunctionEthers = async function(
  tradeId,
  contractAddress
) {
  sk = "0xfbc8e1cb44f9505d93a6ae6215beed81a7be1eb9c6ce6e46fd520d747d9c84cb";
  const NETWORK = "rinkeby";
  const w3Provided = web3.web3WithProvider(); //to access utils
  var provider = ethers.providers.getDefaultProvider(NETWORK);

  //************* refatorar para estas inicializações ocorrerem somente uma vez
  const abi = JSON.parse(compiledContract.interface);
  var wallet = new ethers.Wallet(sk, provider);
  console.log("wallet:", wallet);
  console.log("contractAddress:", contractAddress);
  var contract = new ethers.Contract(contractAddress, abi, wallet);
  var overrideOptions = {
    gasLimit: 250000,
    gasPrice: ethers.utils.bigNumberify("20000000000"),
    value: ethers.utils.parseEther("1.001")
  };

  console.log(
    "w3Provided.utils.toHex(tradeId)",
    w3Provided.utils.toHex(tradeId)
  );
  var result = contract.createBuyOrder(
    w3Provided.utils.toHex(tradeId),
    1,
    1,
    500,
    overrideOptions
  );

  result.then(function(transaction) {
    console.log(transaction);
  });
  // console.log("result:", result);
  // return result;
};

TradeEngine.prototype.testFunctionWeb3 = async function(
  tradeId,
  contractAddress
) {
  sk = "0xfbc8e1cb44f9505d93a6ae6215beed81a7be1eb9c6ce6e46fd520d747d9c84cb";
  const w3Provided = web3.web3WithProvider(); //to access utils
  const account = w3Provided.eth.accounts.privateKeyToAccount(sk);
  w3Provided.eth.accounts.wallet.add(account);
  w3Provided.eth.defaultAccount = account.address;
  console.log("w3Provided.eth.defaultAccount", w3Provided.eth.defaultAccount);
  const abi = JSON.parse(compiledContract.interface);
  contract = new w3Provided.eth.Contract(abi, contractAddress);

  var result = await contract.methods
    .contribute(w3Provided.utils.toHex(tradeId))
    .send({
      nonce: w3Provided.utils.toHex(10001),
      from: account.address,
      gasLimit: 30000,
      gasPrice: 20000,
      value: w3Provided.utils.toHex(w3Provided.utils.toWei("0.004", "ether"))
    });
  console.log("result:", result);
};
