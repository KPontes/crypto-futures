const { ObjectID } = require("mongodb");
const ethers = require("ethers");
const moment = require("moment");
require("../config/config.js");
const { mongoose } = require("../db/mongoose.js");
const compiledFactory = require("../ethereum/build/FutureContractFactory.json");
const compiledFuture = require("../ethereum/build/FutureContract.json");
const { FutureContract } = require("../models/futurecontract.js");
//require("dotenv").config();

module.exports = {
  //pk from the contract creator account
  createFuture: function(pk, title, size, endDate) {
    return new Promise(async function(resolve, reject) {
      try {
        const abi = JSON.parse(compiledFactory.interface);
        var provider = ethers.providers.getDefaultProvider(process.env.NETWORK);
        const factoryAddress = process.env.FACTORY_ADDRESS;
        const fStorageAddress = process.env.F_STORAGE_ADDRESS;
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
          endDateSeconds,
          fStorageAddress
        );
        console.log("createFuture", result);
        resolve("Future contract created");
      } catch (e) {
        console.log("createFuture Error: ", e);
        reject(e);
      }
    });
  },

  saveViaFabric: function(pk) {
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
        // Get information from futureContract deployed on blockchain
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

        // Save on DB
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
        console.log("saveContractViaFabric Error: ", e);
        reject(e);
      }
    });
  },

  saveDirect: function(pk, contractAddress) {
    return new Promise(async function(resolve, reject) {
      try {
        var sk = pk.indexOf("0x") === 0 ? pk : "0x" + pk;
        const abiFuture = JSON.parse(compiledFuture.interface);
        var provider = ethers.providers.getDefaultProvider(process.env.NETWORK);
        var wallet = new ethers.Wallet(sk, provider);

        var deployedFutureContract = new ethers.Contract(
          contractAddress,
          abiFuture,
          wallet
        );

        let [
          endDate,
          contractSize,
          title
        ] = await deployedFutureContract.getStorageVars();

        var futureContract = new FutureContract({
          address: contractAddress,
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
        console.log("saveContractDirect Error: ", e);
        reject(e);
      }
    });
  },

  findContractBd: function(contractTitle) {
    return new Promise(async function(resolve, reject) {
      try {
        var futureContract = await FutureContract.findOne({
          title: contractTitle
        }).exec();
        if (!futureContract) {
          throw `findContractBd Error: contract ${contractTitle} not found`;
        }
        resolve(futureContract);
      } catch (e) {
        console.log("Error: ", e);
        reject(e);
      }
    });
  }
};
