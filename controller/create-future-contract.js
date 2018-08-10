const { ObjectID } = require("mongodb");
const ethers = require("ethers");
const Web3 = require("web3"); //just for utils
const moment = require("moment");
require("dotenv").config();

require("../config/config.js");
const { mongoose } = require("../db/mongoose.js");
const compiledFactory = require("../ethereum/build/FutureContractFactory.json");
const compiledFuture = require("../ethereum/build/FutureContract.json");
const { FutureContract } = require("../models/futurecontract.js");

module.exports = {
  //pk from the contract creator account
  createFuture: function(pk, title, size, endDate) {
    return new Promise(async function(resolve, reject) {
      try {
        const abi = JSON.parse(compiledFactory.interface);
        var provider = ethers.providers.getDefaultProvider(process.env.NETWORK);
        const factoryAddress = process.env.FACTORY_ADDRESS;
        size = size.toString();
        const sizeWei = ethers.utils.parseEther(size).toString(10);
        const initialDate = moment("1970-01-01");
        endDate = moment(endDate);
        const duration = moment.duration(endDate.diff(initialDate));
        const endDateSeconds = duration.asSeconds();
        var wallet = new ethers.Wallet(pk, provider);
        var contract = new ethers.Contract(factoryAddress, abi, wallet);

        var result = await contract.createFutureContract(
          title,
          sizeWei,
          endDateSeconds
        );
        console.log("createFuture", result);
        resolve("Future contract created");
      } catch (e) {
        console.log("createFuture Error: ", e);
        reject(e);
      }
    });
  },

  saveContractDb: function(pk) {
    return new Promise(async function(resolve, reject) {
      try {
        const abiFactory = JSON.parse(compiledFactory.interface);
        var provider = ethers.providers.getDefaultProvider(process.env.NETWORK);
        const factoryAddress = process.env.FACTORY_ADDRESS;
        var wallet = new ethers.Wallet(pk, provider);
        var factoryContract = new ethers.Contract(
          factoryAddress,
          abiFactory,
          wallet
        );

        var contractsAmount = await factoryContract.getContractsAmount();
        var strAmount = contractsAmount.toString();
        //Address of last deployed future contract
        var futureContractAddress = await factoryContract.deployedContracts(
          parseInt(strAmount) - 1
        );

        const abiFuture = JSON.parse(compiledFuture.interface);
        var deployedFutureContract = new ethers.Contract(
          futureContractAddress,
          abiFuture,
          wallet
        );

        let [
          endDate,
          contractSize,
          title
        ] = await deployedFutureContract.getStorageVars();

        var futureContract = new FutureContract({
          address: futureContractAddress,
          title: title,
          size: contractSize,
          endDate: endDate,
          manager: wallet.address
        });

        futureContract.save().then(
          doc => {
            //console.log("Saved document: ", doc);
            resolve(doc);
          },
          e => {
            console.log("Error: ", e);
            reject(e);
          }
        );
      } catch (e) {
        console.log("saveContractDb Error: ", e);
        reject(e);
      }
    });
  }
};
