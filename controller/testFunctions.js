require("../config/config.js");
const etherTx = require("ethereumjs-tx");
const moment = require("moment");
const ethers = require("ethers");
const web3 = require("../ethereum/web3.js");
const { mongoose } = require("../db/mongoose.js");
const { FutureContract } = require("../models/futurecontract.js");
const compiledContract = require("../ethereum/build/FutureContract.json");

//("use strict");

var _this = this;

exports.test = function(contractTitle, testStr, value) {
  return new Promise(async function(resolve, reject) {
    try {
      var futureContract = await FutureContract.findOne({
        title: contractTitle
      }).exec();
      if (!futureContract) {
        throw `create Error: contract ${contractTitle} not found`;
      }

      var transaction = await _this.testEthers(
        testStr,
        futureContract.address,
        value
      );
      resolve(transaction);
    } catch (e) {
      console.log("Test Error: ", e);
      reject(e);
    }
  });
};

exports.testEthers = function(testStr, contractAddress, value) {
  return new Promise(async function(resolve, reject) {
    try {
      var pk =
        "0x797336cf22a6171b4cb179d6a9c08e5848cbd1748563bc44ea66c506fb0aef8c";
      var address = "0x85Be6c1f4DE7a2D1de9564086394700ccb7d0852";
      contractAddress = "0xe522cf1096eb7ba4d2ad4b2c23ae8f0746a2562f";

      var sk = pk; //pk.indexOf("0x") === 0 ? pk : "0x" + pk;
      // const network = ethers.providers.networks.rinkeby;
      // const provider = new ethers.providers.InfuraProvider(
      //   network,
      //   "57d315a3ee704eeeb57cf05ff872a94a"
      // );
      var provider = ethers.providers.getDefaultProvider("rinkeby");
      // var provider = new ethers.providers.EtherscanProvider("rinkeby");
      const abi = JSON.parse(compiledContract.interface);
      var wallet = new ethers.Wallet(sk, provider);
      console.log("wallet:", wallet);
      var contract = new ethers.Contract(contractAddress, abi, wallet);

      var options = {
        value: 1000
      };
      //var gasLimit = await contract.estimate.contribute(testStr);

      let [title, contractSize, owner] = await contract.getStorageVars();
      console.log("title: ", title);
      console.log("contractSize: ", contractSize);
      console.log("owner: ", owner);

      var transaction = await contract.functions.setStorage("Quinto titulo", 5);
      console.log("transaction1: ", transaction);
      transaction = await contract.functions.contribute(options);
      console.log("transaction2: ", transaction);
      resolve(transaction);
    } catch (e) {
      console.log("Test Error: ", e);
      reject(e);
    }
  });
};

exports.testWeb3 = function(testStr, contractAddress, value) {
  return new Promise(async function(resolve, reject) {
    try {
      var pk =
        "0x8f4149e18266e094b93069475de230f6a6f74fb2c9ecf044130aeaf90d400bb5";
      var address = "0x3c511616bA2F6bD8Aa4e1e9Cdc20389dC6B6b107";
      contractAddress = "0xe24769E800B29D22354dF15516Ce8e2F5e333203";

      var sk = pk; //pk.indexOf("0x") === 0 ? pk : "0x" + pk;

      const abi = JSON.parse(compiledContract.interface);
      const w3Provided = web3.web3WithProvider();
      const account = w3Provided.eth.accounts.privateKeyToAccount(sk);
      w3Provided.eth.accounts.wallet.add(account);
      w3Provided.eth.defaultAccount = account.address;
      var contract = await new w3Provided.eth.Contract(abi, contractAddress);

      console.log("toHex(testStr)", w3Provided.utils.toHex(testStr));
      var methodCall = contract.methods.contribute("Meu Teste");
      // var gasEstimate = await methodCall.estimateGas();
      // console.log("gasEstimate:", gasEstimate);

      var encodedABI = await methodCall.encodeABI();
      var txCount = await w3Provided.eth.getTransactionCount(
        w3Provided.eth.defaultAccount
      );

      var txParams = {
        nonce: 10102,
        from: w3Provided.eth.defaultAccount,
        to: contractAddress,
        gasLimit: w3Provided.utils.toHex(300000),
        gasPrice: "20000",
        value: w3Provided.utils.toHex(w3Provided.utils.toWei(value, "ether")),
        data: encodedABI
      };

      //var balance = await w3Provided.eth.getBalance(w3Provided.eth.defaultAccount);
      const bufferedPk = Buffer.from(
        account.privateKey.replace("0x", ""),
        "hex"
      );
      console.log("txParams", txParams);
      const transaction = new etherTx(txParams);
      console.log("transaction:", transaction);
      transaction.sign(bufferedPk);
      const serializedTx = transaction.serialize();
      console.log("serializedTx:", serializedTx);

      let result = await w3Provided.eth.sendSignedTransaction(
        "0x" + serializedTx.toString("hex")
      );
      console.log("result: ", result);
      resolve(result);
    } catch (e) {
      console.log("TestW3 Error: ", e);
      reject(e);
    }
  });
};

//(1)
// buyorder = await BuyOrder.findOne({ _id: buyorder._id });
// var pw = secalc.sec(
//   buyorder.buyerAddress,
//   buyorder.contractsAmount,
//   buyorder.dealPrice,
//   buyorder.createdAt
// );
// var sk = cryptojs.decryptStr(buyorder.sk, pw);
//************************
//(2)
// buyorder = await BuyOrder.findOne({ _id: doc._id });
// var pw = secalc.sec(
//   buyorder.buyerAddress,
//   buyorder.contractsAmount,
//   buyorder.dealPrice,
//   buyorder.createdAt
// );
// var cipherpk = cryptojs.encryptStr(pk, pw);
// buyorder.sk = cipherpk;
// doc = buyorder.save();
